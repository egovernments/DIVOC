package services

import (
	"encoding/json"

	"github.com/divoc/portal-api/config"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
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
	producer, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": servers,
		"security.protocol": config.Config.Kafka.SecurityProtocol,
		"sasl.mechanism"    : config.Config.Kafka.SaslMechanism,
		"sasl.username": config.Config.Kafka.SaslUsername,
		"sasl.password": config.Config.Kafka.SaslPassword,
		"ssl.ca.location": config.Config.Kafka.SslCaLocation,
	})
	if err != nil {
		panic(err)
	}

	log.Infof("Connected to kafka on %s", servers)
	StartEnrollmentACKConsumer()
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
		topic := config.Config.Kafka.EnrollmentTopic
		for {
			msg := <-enrollmentMessages
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          msg,
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
