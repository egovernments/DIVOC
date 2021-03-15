package services

import (
	"encoding/json"
	"github.com/divoc/api/config"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

//StartEnrollmentACKConsumer : consumes enrollment_ack and updates CSV upload errors
func StartEnrollmentACKConsumer() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "enrollment_ack",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Errorf("Failed connecting to kafka", err)
	}
	go func() {
		err := consumer.SubscribeTopics([]string{config.Config.Kafka.EnrollmentACKTopic}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err == nil {
				var message struct {
					Err                *string `json:"errMsg"`
					EnrollmentType     string  `json:"enrollmentType"`
					VaccinationDetails []byte  `json:"vaccinationDetails"`
				}
				json.Unmarshal(msg.Value, &message)
				log.Infof("Message on %s: %v \n", msg.TopicPartition, message)

				if message.EnrollmentType == "walkin" {
					PublishCertifyMessage(message.VaccinationDetails, nil, nil)
				}
				consumer.CommitMessage(msg)
			} else {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
			}

		}
	}()
}
