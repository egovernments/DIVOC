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

func InitializeKafka() {
	servers := config.Config.Kafka.BootstrapServers
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": servers})
	if err != nil {
		panic(err)
	}

	log.Infof("Connected to kafka on %s", servers)
	StartCertifiedConsumer()
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
				// check the status
				// update that status to certifyErrorRows db
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
