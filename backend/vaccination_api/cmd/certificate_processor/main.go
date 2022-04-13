package main

import (
	"fmt"
	"sync"
	"time"

	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/models"
	"github.com/divoc/api/pkg/services"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

const mobilePhonePrefix = "tel:"

var revokedCertificateErrors = make(chan []byte)

type VaccinationCertificateRequest struct {
	ID     string `json:"id"`
	Ver    string `json:"ver"`
	Ets    string `json:"ets"`
	Params struct {
		Did   string `json:"did"`
		Key   string `json:"key"`
		Msgid string `json:"msgid"`
	} `json:"params"`
	Request struct {
		VaccinationCertificate struct {
			CertificateID string   `json:"certificateId"`
			Identity      string   `json:"identity"`
			Contact       []string `json:"contact"`
			Name          string   `json:"name"`
			Certificate   string   `json:"certificate"`
		} `json:"VaccinationCertificate"`
	} `json:"request"`
}

type CertifyMessage struct {
	Facility struct {
		Address struct {
			AddressLine1 string `json:"addressLine1"`
			District     string `json:"district"`
			State        string `json:"state"`
		} `json:"address"`
		Name string `json:"name"`
	} `json:"facility"`
	PreEnrollmentCode string `json:"preEnrollmentCode"`
	Recipient         struct {
		Dob         string   `json:"dob"`
		Gender      string   `json:"gender"`
		Identity    string   `json:"identity"`
		Name        string   `json:"name"`
		Nationality string   `json:"nationality"`
		Contact     []string `json:"contact"`
	} `json:"recipient"`
	Vaccination struct {
		Batch          string    `json:"batch"`
		Date           time.Time `json:"date"`
		EffectiveStart string    `json:"effectiveStart"`
		EffectiveUntil string    `json:"effectiveUntil"`
		Manufacturer   string    `json:"manufacturer"`
		Name           string    `json:"name"`
	} `json:"vaccination"`
	Vaccinator struct {
		Name string `json:"name"`
	} `json:"vaccinator"`
}

func main() {
	log.Infof("Starting certificate processor")
	config.Initialize()

	var wg sync.WaitGroup
	wg.Add(2)
	log.Infof("CreateRecipientInKeycloakService enabled %s", config.Config.EnabledServices.CreateRecipientInKeycloakService)
	if config.Config.EnabledServices.CreateRecipientInKeycloakService == "true" {
		go initializeCreateUserInKeycloak(&wg)
	}

	log.Infof("RevokeCertificateService enabled %s", config.Config.EnabledServices.RevokeCertificateService)
	if config.Config.EnabledServices.RevokeCertificateService == "true" {
		go initializeRevokeCertificate(&wg)
	}
	wg.Wait()
}

func initializeCreateUserInKeycloak(wg *sync.WaitGroup) {
	defer wg.Done()
	log.Infof("Using kafka for certificate_processor %s", config.Config.Kafka.BootstrapServers)
	c := createConsumer("certificate_processor", "earliest", "false")
	if err := c.SubscribeTopics([]string{config.Config.Kafka.CertifyTopic}, nil); err != nil {
		panic(err)
	}
	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
			//valid := validate.AgainstSchema()
			//if !valid {
			//push to back up queue -- todo what do we do with these requests?
			//}
			//message := signCertificate(message)
			var err error
			var preEnrollmentCode string
			var status models.Status
			if preEnrollmentCode, status, err = processCertificateMessage(string(msg.Value)); err == nil {
				c.CommitMessage(msg)
			} else {
				log.Errorf("Error in processing the certificate %+v", err)
			}
			services.PublishProcStatus(models.ProcStatus{
				Date:              time.Now(),
				PreEnrollmentCode: preEnrollmentCode,
				ProcType:          "certify",
				Status:            string(status),
			})
		} else {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", err)
		}
	}

	c.Close()
}

func initializeRevokeCertificate(wg *sync.WaitGroup) {
	defer wg.Done()
	log.Infof("Using kafka for revoke_cert %s", config.Config.Kafka.BootstrapServers)

	servers := config.Config.Kafka.BootstrapServers
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": servers})
	services.InitializeKafkaForRevocationService(producer)
	services.InitRedis()
	startRevokeCertificateErrorTopicProducer(producer)
	c := createConsumer("revoke_cert", "earliest", "false")
	if err = c.SubscribeTopics([]string{config.Config.Kafka.RevokeCertTopic}, nil); err != nil {
		panic(err)
	}
	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
			preEnrollmentCode, revokeStatus, err := handleCertificateRevocationMessage(string(msg.Value))
			if revokeStatus == SUCCESS || revokeStatus == ERROR {
				c.CommitMessage(msg)
			}
			if revokeStatus == ERROR {
				log.Errorf("Error in revoking the certificate %+v", err)
				publishRevokeCertificateErrorMessage(msg.Value)
			}
			services.PublishProcStatus(models.ProcStatus{
				Date:              time.Now(),
				PreEnrollmentCode: preEnrollmentCode,
				ProcType:          "revoke_cert",
				Status:            string(revokeStatus),
			})
			log.Infof("Published revoke_cert request status for %v with status %v to ProcStatus", preEnrollmentCode, revokeStatus)
		} else {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", err)
		}
	}

	c.Close()
}

func createConsumer(groupId string, autoOffsetReset string, enableAutoCommit string) *kafka.Consumer {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           groupId,
		"auto.offset.reset":  autoOffsetReset,
		"enable.auto.commit": enableAutoCommit,
	})
	if err != nil {
		panic(err)
	}
	return c
}

func startRevokeCertificateErrorTopicProducer(producer *kafka.Producer) {
	go func() {
		topic := config.Config.Kafka.RevokeCertErrTopic
		for {
			msg := <-revokedCertificateErrors
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          msg,
			}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
		}
	}()
}

func publishRevokeCertificateErrorMessage(revokeErrorMessage []byte) {
	log.Infof("Publishing to revoke certificate errors topic")
	revokedCertificateErrors <- revokeErrorMessage
}
