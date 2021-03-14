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
				var enrollment struct {
					RowID             uint   `json:"rowID"`
					Code              string `json:"code"`
					EnrollmentScopeId string `json:"enrollmentScopeId"`
					models.Enrollment
				}
				err = json.Unmarshal(msg.Value, &enrollment)

				if err == nil {
					log.Infof("Message on %s: %v \n", msg.TopicPartition, string(msg.Value))
					var osid = ""
					if enrollment.Code != "" {
						osid, err = services.CreateWalkInEnrollment(&enrollment)
					} else {
						osid, err = services.CreateEnrollment(&enrollment.Enrollment, 1)
					}
					services.PublishEnrollmentACK(enrollment.RowID, err)

					// Below condition flow will be used by WALK_IN component.
					if err == nil {
						cacheEnrollmentInfo(enrollment.Enrollment, osid)
						err := services.NotifyRecipient(enrollment.Enrollment)
						if err != nil {
							log.Error("Unable to send notification to the enrolled user", err)
						}
					} else {
						// Push to error topic
						log.Errorf("Error occurred while trying to create the enrollment (%v)", err)
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

func cacheEnrollmentInfo(enrollment models.Enrollment, osid string) {
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
