package consumers

import (
	"encoding/json"

	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/services"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func StartEnrollmentConsumer() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "enroll-recipient",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Errorf("Failed connecting to kafka %+v", err)
	}
	go func() {
		err := consumer.SubscribeTopics([]string{config.Config.Kafka.EnrollmentTopic}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err != nil {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
				if msg != nil {
					_, _ = consumer.CommitMessage(msg)
				}
				continue
			}
			log.Info("Got the message to create new enrollment")
			var enrollment = services.EnrollmentPayload{}
			if err := json.Unmarshal(msg.Value, &enrollment); err != nil {
				// Push to error topic
				log.Info("Unable to serialize the request body", err)
				_, _ = consumer.CommitMessage(msg)
				continue
			}
			
			log.Infof("Topic %s", msg.TopicPartition)
			log.Debugf("Message on %s: %v \n", msg.TopicPartition, string(msg.Value))	
			err = services.CreateEnrollment(&enrollment, 0)
			services.PublishEnrollmentACK(enrollment, err)
			if err != nil {
				// Push to error topic
				log.Errorf("Error occurred while trying to create the enrollment (%v)", err)
				_, _ = consumer.CommitMessage(msg)
				continue
			}
			if err := services.NotifyRecipient(enrollment.Enrollment); err != nil {
				log.Error("Unable to send notification to the enrolled user", err)
			}
			_, _ = consumer.CommitMessage(msg)

		}
	}()
}
