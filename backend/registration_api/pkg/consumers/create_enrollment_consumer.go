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
			if err != nil {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
				continue
			}
			log.Info("Got the message to create new enrollment")
			var enrollment = services.EnrollmentPayload{}
			if err = json.Unmarshal(msg.Value, &enrollment); err != nil {
				// Push to error topic
				log.Info("Unable to serialize the request body", err)
				continue
			}
			log.Infof("Message on %s: %v \n", msg.TopicPartition, string(msg.Value))
			
			if err := services.ValidateEnrollment(enrollment); err != nil {
				log.Error("Error validating enrollment", err)
				services.PublishEnrollmentACK(enrollment, err)
				continue
			}

			osid, err := services.CreateEnrollment(&enrollment, 1)
			services.PublishEnrollmentACK(enrollment,err)
			if err != nil {
				// Push to error topic
				log.Errorf("Error occurred while trying to create the enrollment (%v)", err)
				continue
			}
			cacheEnrollmentInfo(enrollment.Enrollment, osid)
			if err := services.NotifyRecipient(enrollment.Enrollment); err != nil {
				log.Error("Unable to send notification to the enrolled user", err)
			}
			_, _ = consumer.CommitMessage(msg)

		}
	}()
}

func cacheEnrollmentInfo(enrollment *models.Enrollment, osid string) {
	data := map[string]interface{}{
		"phone":        enrollment.Phone,
		"updatedCount": 0, //to restrict multiple updates
		"osid":         osid,
	}
	_, err := services.SetHMSet(enrollment.Code, data)
	if err != nil {
		log.Error("Unable to cache enrollment info", err)
	}
}
