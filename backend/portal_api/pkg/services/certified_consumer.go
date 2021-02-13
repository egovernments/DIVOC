package services

import (
	"encoding/json"
	"github.com/divoc/portal-api/config"
	"github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func StartCertifiedConsumer() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "pre-enrollment-certified",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		logrus.Errorf("Failed connecting to kafka", err)
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
				logrus.Infof("Message on %s: %v \n", msg.TopicPartition, message)
				preEnrollmentCode, ok := message["preEnrollmentCode"].(string)
				if !ok {
					logrus.Error("preEnrollmentCode not found to mark pre-enrolled user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				name, ok := message["name"].(string)
				if !ok {
					logrus.Error("name not found to mark pre-enrolled user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				contact, ok := message["mobile"].(string)
				if !ok {
					logrus.Error("contacts not found to mark pre-enrolled user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				MarkPreEnrolledUserCertified(preEnrollmentCode, contact, name)
				consumer.CommitMessage(msg)
			} else {
				// The client will automatically try to recover from all errors.
				logrus.Infof("Consumer error: %v \n", err)
			}

		}
	}()
}
