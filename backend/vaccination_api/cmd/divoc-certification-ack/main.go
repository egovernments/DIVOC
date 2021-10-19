package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/models"
	models2 "github.com/divoc/api/swagger_gen/models"
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"io/ioutil"
	"net/http"
	"strings"
	"time"
)

var redisClient *redis.Client
var ctx context.Context

type AcknowledgementRequest struct {
	BeneficiaryReferenceID string    `json:"beneficiary_reference_id"`
	Dose                   int       `json:"dose"`
	Status                 string    `json:"status"`
	Reason                 string    `json:"reason"`
	DateCreated            time.Time `json:"date_created"`
}

var addr = flag.String("listen-address", ":8006", "The address to listen on for HTTP requests.")

func main() {
	config.Initialize()
	initRedis()
	startKafkaConsumer()
	log.Info("Running certificate acknowledgement service (webhook)")
	r := mux.NewRouter()
	r.Handle("/metrics", promhttp.Handler())
	http.Handle("/", r)
	_ = http.ListenAndServe(*addr, nil)

	//integration

}


type CertificateErrorMessage struct {
	Message string `json:"message"`
	Error   string    `json:"error"`
}

func sendErrorCertificateAck(msg string) error {
	errorMessage := CertificateErrorMessage{}
	if err := json.Unmarshal([]byte(msg), &errorMessage); err != nil {
		log.Errorf("Error while unmarshalling certificate error message from kafka %+v", msg)
	} else {
		cert := models2.CertificationRequest{}
		if err := json.Unmarshal([]byte(errorMessage.Message), &cert); err != nil {
			log.Errorf("Error in marshalling certificate request body %+v", errorMessage.Message)
		} else {
			beneficiaryId := cert.PreEnrollmentCode
			dose := int(cert.Vaccination.Dose)

			return notifyWebhook(beneficiaryId, dose, "error", errorMessage.Error)

		}
	}
	return nil
}

func sendCertificateAck(msg string) error {
	var certifiedMessage models.CertifiedMessage
	if err := json.Unmarshal([]byte(msg), &certifiedMessage); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return errors.New("kafka message unmarshalling failed")
	}
	if certifiedMessage.Certificate == nil {
		log.Infof("Ignoring invalid message %+v", msg)
		return nil
	}
	if certifiedMessage.Meta.VaccinationApp == nil {
		certifiedMessage.Meta.VaccinationApp = &models2.CertificationRequestV2MetaVaccinationApp{}
	}

	beneficiaryId := certifiedMessage.PreEnrollmentCode
	dose := certifiedMessage.Certificate.Evidence[0].Dose
	certificateStatus := "success"
	reason := "created"

	return notifyWebhook(beneficiaryId, dose, certificateStatus, reason)
}

func notifyWebhook(beneficiaryId string, dose int, certificateStatus string, errorMessage string) error {
	request := AcknowledgementRequest{
		BeneficiaryReferenceID: beneficiaryId,
		Dose:                   dose,
		Status:                 certificateStatus,
		Reason:                 errorMessage,
		DateCreated:            time.Now(),
	}
	if requestBody, err := json.Marshal(request); err != nil {
		log.Errorf("Error in marshalling the json %+v", err)
	} else {
		url := config.Config.Acknowledgement.CallbackUrl
		if postRequest, err := http.NewRequest("POST", url, bytes.NewReader(requestBody)); err == nil {
			client := http.Client{}
			postRequest.Header.Set("Authorization", getToken(config.Config.Acknowledgement.CallbackAuthKey))
			postRequest.Header.Set("Content-Type", "application/json")
			if resp, err := client.Do(postRequest); err != nil {
				log.Errorf("Error in sending the ack for the certificate to %s : %+v", url, err)
			} else {
				log.Infof("Ack %+v ", resp)
				if (resp.StatusCode == 200) {
					log.Infof("Successfully acknowledgement sent %s dose %d : status: %d", beneficiaryId, dose, resp.StatusCode)
				} else {
					log.Errorf("Error in acknowledging the certificate %s dose %d - status: %d, %s", beneficiaryId, dose, resp.StatusCode, string(requestBody))
				}
				/*if response, err := ioutil.ReadAll(resp.Body); err == nil {
					log.Info("Ack response", response)
				} else {
					log.Errorf("error %+v", err)
				}*/
			}
		} else {
			log.Errorf("Error while posting the request %+v", err)
		}
	}
	return nil
}

func getToken(id string) string {
	const callbackTokenKey = "certificate-callback-token"
	if token, err := redisClient.Get(ctx, callbackTokenKey).Result(); err == nil {
		return token
	} else {
		request := fmt.Sprintf("{\"user_name\":\"%s\"}", id)
		buf := strings.NewReader(request)
		url := config.Config.Acknowledgement.CallbackAuthUrl
		log.Infof("Using the callback auth %s", url)
		if resp, err := http.Post(url, "application/json", buf); err == nil {
			if response, err := ioutil.ReadAll(resp.Body); err == nil {
				fmt.Printf("%s %+v", response, err)
				token := string(response)
				redisClient.Set(ctx, callbackTokenKey, token,
					time.Duration(config.Config.Acknowledgement.CallbackAuthExpiryMinutes)*time.Minute)
				return token
			} else {
				log.Errorf("error %+v", err)
			}
		} else {
			log.Errorf("error %+v", err)
		}
		return ""
	}
}

func startKafkaConsumer() {
	go startCertificateEventConsumer(sendCertificateAck, config.Config.Kafka.CertifiedTopic, "latest")
	go startCertificateEventConsumer(sendErrorCertificateAck, config.Config.Kafka.ErrorCertificateTopic, "latest")
}


type MessageCallback func(string) error

func startCertificateEventConsumer(callback MessageCallback, topic string, resetOption string) {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "certified_ack_webhook",
		"auto.offset.reset":  resetOption,
		"enable.auto.commit": "false",
	})

	if err != nil {
		panic(err)
	}

	if err = c.SubscribeTopics([]string{topic}, nil); err != nil {
		log.Errorf("Error while subscribing to the topic %s", topic)
	}

	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			log.Infof("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))

			if err := callback(string(msg.Value)); err == nil {
				if _, err = c.CommitMessage(msg); err != nil {
					log.Errorf("Error while committing the message %s %+v", topic, msg)
				}
			} else {
				log.Errorf("Error in processing the certificate %+v", err)
			}
		} else {
			// The client will automatically try to recover from all errors.
			log.Errorf("Consumer error: %v \n", err)
		}
	}
}

func initRedis() {
	options, err := redis.ParseURL(config.Config.Redis.Url)
	ctx = context.Background()
	if err != nil {
		panic(err)
	}

	redisClient = redis.NewClient(options)
}
