package consumers

import (
	"encoding/json"
	"errors"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/services"
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
					logrus.Error("preEnrollmentCode not found to mark the user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				name, ok := message["name"].(string)
				if !ok {
					logrus.Error("name not found to mark the user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				contact, ok := message["mobile"].(string)
				if !ok {
					logrus.Error("contacts not found to mark the user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				certificateId, ok := message["certificateId"].(string)
				if !ok {
					logrus.Error("certificateId not found to mark the user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				certificateStr, ok := message["certificate"].(string)
				if !ok {
					logrus.Error("certificate not found to mark the user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				programId, ok := message["programId"].(string)
				if !ok {
					logrus.Error("programId not found to mark the user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				meta, ok := message["meta"].(map[string]interface{})
				if !ok {
					logrus.Error("meta details not found which contains osid of the user to mark as certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				enrollmentOsid, ok := meta["enrollmentOsid"].(string)
				if !ok {
					logrus.Error("enrollmentOsid not found to mark the user certified %v", message)
					consumer.CommitMessage(msg)
					continue
				}
				var certificateMsg map[string]interface{}
				if err := json.Unmarshal([]byte(certificateStr), &certificateMsg); err == nil {
					if dose, totalDoses, vaccine, err := getVaccineDetails(certificateMsg); err == nil {
						services.MarkPreEnrolledUserCertified(preEnrollmentCode, contact, name, dose, certificateId, vaccine, programId, totalDoses, enrollmentOsid)
					}
				}

				consumer.CommitMessage(msg)
			} else {
				// The client will automatically try to recover from all errors.
				logrus.Infof("Consumer error: %v \n", err)
			}

		}
	}()
}

func getVaccineDetails(certificateMsg map[string]interface{}) (float64, float64, string, error) {
	if evidence, ok := certificateMsg["evidence"].([]interface{})[0].(map[string]interface{}); ok {
		var dose = -1.0
		var totalDoses = -1.0
		var vaccine = ""
		if doseFromResponse, ok := evidence["dose"].(float64); ok {
			dose = doseFromResponse
		}
		if totalDosesFromResponse, ok := evidence["totalDoses"].(float64); ok {
			totalDoses = totalDosesFromResponse
		}
		if vaccineFromMessage, ok := evidence["vaccine"].(string); ok {
			vaccine = vaccineFromMessage
		}
		return dose, totalDoses, vaccine, nil
	}
	return -1, 0, "", errors.New("dose not found")
}
