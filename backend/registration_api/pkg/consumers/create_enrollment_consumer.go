package consumers

import (
	"encoding/json"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/services"
	"github.com/divoc/registration-api/swagger_gen/models"
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
			if err == nil {
				log.Info("Got the message to create new enrollment")
				var enrollment models.Enrollment
				err = json.Unmarshal(msg.Value, &enrollment)

				if err == nil {
					log.Infof("Message on %s: %v \n", msg.TopicPartition, string(msg.Value))
					err = services.CreateEnrollment(&enrollment, 1)
					// Below condition flow will be used by WALK_IN component.
					if err == nil {
						_, err := services.SetHash(enrollment.Code, "phone", enrollment.Phone)
						if err != nil {
							log.Error("Unable to store enrollment code in redis",  err)
						}
						err = services.NotifyRecipient(enrollment)
						if err != nil {
							log.Error("Unable to send notification to the enrolled user",  err)
						}
					} else {
						// Push to error topic
						log.Errorf("Error occured while trying to create the enrollment (%v)",  err)
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
