package services

import (
	"encoding/json"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func StartRecipientsAppointmentConsumer() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "recipient-appointment",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Errorf("Connection failed for the kafka",  err)
		return
	}

	go func() {
		err := consumer.SubscribeTopics([]string{config.Config.Kafka.RecipientAppointmentTopic}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err == nil {
				log.Info("Got the message to book an appointment")
				var recipientAppointmentMessage RecipientAppointmentMessage
				err = json.Unmarshal(msg.Value, &recipientAppointmentMessage)
				if err == nil {
					filter := map[string]interface{}{}
					filter["code"] = map[string]interface{}{
						"eq": recipientAppointmentMessage.Code,
					}
					if responseFromRegistry, err := kernelService.QueryRegistry("Enrollment", filter, 100, 0); err==nil {
						appointmentTData := make(map[string]interface{})
						osid := responseFromRegistry["Enrollment"].([]interface{})[0].(map[string]interface{})["osid"]
						appointmentTData["appointmentTime"] = recipientAppointmentMessage.Time
						appointmentTData["osid"] = osid
						appointmentTData["appointmentDate"] = recipientAppointmentMessage.Date
						appointmentTData["enrollmentScopeId"] = recipientAppointmentMessage.FacilityId
						log.Infof("Message on %s: %v \n", msg.TopicPartition, appointmentTData)
						_, err := kernelService.UpdateRegistry("Enrollment", appointmentTData)
						if err == nil {
							// Send notification message
							//if err != nil {
							//	log.Error("Unable to send notification to the enrolled user",  err)
							//}
						} else {
							log.Error("Booking appointment is failed ", err)
							// Push to error topic
						}
						_, _ = consumer.CommitMessage(msg)
					} else {
						log.Errorf("Unable to fetch the osid for Enrollment", err)
					}
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

type RecipientAppointmentMessage struct {
	Code       string
	FacilityId string
	Date       string
	Time       string
}
