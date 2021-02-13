package services

import (
	"encoding/json"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/models"
	"github.com/divoc/portal-api/pkg/utils"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"time"
)

type NotificationRequest struct {
	Message   string `json:"message"`
	Recipient string `json:"recipient"`
	Subject   string `json:"subject,omitempty"`
}

var notifications = make(chan []byte)
var enrollmentMessages = make(chan []byte)

func InitializeKafka() {
	servers := config.Config.Kafka.BootstrapServers
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": servers})
	if err != nil {
		panic(err)
	}

	log.Infof("Connected to kafka on %s", servers)
	StartCertifiedConsumer()
	StartEnrollmentConsumer()
	go func() {
		topic := config.Config.Kafka.NotifyTopic
		for {
			msg := <-notifications
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          msg,
			}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
		}
	}()

	go func() {
		topic := config.Config.Kafka.EnromentTopic
		for {
			msg:= <-enrollmentMessages
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
					Value: msg,
				}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
		}
	}()

	go func() {
		for e := range producer.Events() {
			log.Infof("%+v", e)
			switch ev := e.(type) {
			case *kafka.Message:
				if ev.TopicPartition.Error != nil {
					log.Infof("Delivery failed: %v\n%+v", ev.TopicPartition, ev.Value)
				} else {
					log.Infof("Delivered message to %v\n", ev.TopicPartition)
				}
			}
		}

	}()
}

func PublishEnrollmentMessage(enrollment []byte) {
	enrollmentMessages <- enrollment
}

func PublishNotificationMessage(recipient string, subject string, message string) {
	request := NotificationRequest{
		Recipient: recipient,
		Subject:   subject,
		Message:   message,
	}
	if messageJson, err := json.Marshal(request); err != nil {
		log.Errorf("Error in getting json of event %+v", request)
	} else {
		notifications <- messageJson
	}
}

func StartCertifiedConsumer() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "pre-enrollment-certified",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Errorf("Failed connecting to kafka", err)
	}
	go func() {
		err := consumer.SubscribeTopics([]string{config.Config.Kafka.CertifiedTopic}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err == nil {
				var message map[string]interface{}
				json.Unmarshal(msg.Value, &message)
				log.Infof("Message on %s: %v \n", msg.TopicPartition, message)
				preEnrollmentCode, ok := message["preEnrollmentCode"].(string)
				if !ok {
					log.Error("preEnrollmentCode not found to mark pre-enrolled user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				name, ok := message["name"].(string)
				if !ok {
					log.Error("name not found to mark pre-enrolled user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				contact, ok := message["mobile"].(string)
				if !ok {
					log.Error("contacts not found to mark pre-enrolled user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				markPreEnrolledUserCertified(preEnrollmentCode, contact, name)
				consumer.CommitMessage(msg)
			} else {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
			}

		}
	}()
}

func StartEnrollmentConsumer() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "enroll-recipient",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Errorf("Failed connecting to kafka", err)
	}
	go func() {
		err := consumer.SubscribeTopics([]string{config.Config.Kafka.EnromentTopic}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err == nil {
				log.Info("Got the message to create new enrollment")
				var enrollment models.Enrollment
				err = json.Unmarshal(msg.Value, &enrollment)

				if err == nil {
					_, err := time.Parse("2006-01-02", enrollment.Dob)
					log.Infof("Message on %s: %v \n", msg.TopicPartition, string(msg.Value))
					err = createEnrollment(enrollment, 1)
					// Below condition flow will be used by WALK_IN component.
					if err == nil {
						// Push to ack topic
					} else {
						// Push to error topic
					}
					_, _ = consumer.CommitMessage(msg)
				} else {
					log.Info("Unable to serialize the request body", err)
				}

			} else {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
			}

		}
	}()
}

func createEnrollment(enrollment models.Enrollment, currentRetryCount int) error {
	enrollment.Code = utils.GenerateEnrollmentCode(enrollment.Phone)
	err := kernelService.CreateNewRegistry(enrollment, "Enrollment")
	// If the generated Code is not unique, try again
	// code + programId should be unique
	if err != nil && currentRetryCount <= config.Config.EnrollmentCreation.MaxRetryCount {
		return createEnrollment(enrollment, currentRetryCount + 1)
	}
	return err
}
