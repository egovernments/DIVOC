package consumers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/services"
	"github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func StartCertifiedConsumerWithRabbitmq() {
	c, ch := services.CreateNewConnectionAndChannel()
	topic := config.Config.Rabbitmq.CertifiedTopic
	queue := topic + services.DefaultQueueSuffix
	go func() {
		msgs, cErr := services.ConsumeFromExchangeUsingQueue(ch, topic,
			queue, services.DefaultExchangeKind)
		if cErr != nil {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", cErr)
		} else {
			defer c.Close()
			defer ch.Close()
			for msg := range msgs {
				processCertifiedTopicMessage(topic, msg.Body)
				ch.Ack(msg.DeliveryTag, false)
			}
		}
	}()
}

func StartCertifiedConsumerWithKafka() {
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
		topic := config.Config.Kafka.CertifiedTopic
		err := consumer.SubscribeTopics([]string{topic}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err == nil {
				processCertifiedTopicMessage(topic, msg.Value)
				consumer.CommitMessage(msg)
			} else {
				// The client will automatically try to recover from all errors.
				logrus.Infof("Consumer error: %v \n", err)
			}

		}
	}()
}

func processCertifiedTopicMessage(topic string, msgValue []byte) bool {
	var message map[string]interface{}
	json.Unmarshal(msgValue, &message)
	logrus.Infof("Message on %s: %v \n", topic, message)
	preEnrollmentCode, ok := message["preEnrollmentCode"].(string)
	if !ok {
		logrus.Error("preEnrollmentCode not found to mark the user certified %v", message)
		return false
	}
	name, ok := message["name"].(string)
	if !ok {
		logrus.Error("name not found to mark the user certified %v", message)
		return false
	}
	contact, ok := message["mobile"].(string)
	if !ok {
		logrus.Error("contacts not found to mark the user certified %v", message)
		return false
	}
	certificateId, ok := message["certificateId"].(string)
	if !ok {
		logrus.Error("certificateId not found to mark the user certified %v", message)
		return false
	}
	certificateStr, ok := message["certificate"].(string)
	if !ok {
		logrus.Error("certificate not found to mark the user certified %v", message)
		return false
	}
	programId, ok := message["programId"].(string)
	if !ok {
		logrus.Error("programId not found to mark the user certified %v", message)
		return false
	}
	meta, ok := message["meta"].(map[string]interface{})
	if !ok {
		logrus.Error("meta details not found which contains osid of the user to mark as certified %v", message)
		return false
	}
	enrollmentOsid, ok := meta["enrollmentOsid"].(string)
	if !ok {
		logrus.Error("enrollmentOsid not found to mark the user certified %v", message)
		return false
	}
	var certificateMsg map[string]interface{}
	if err := json.Unmarshal([]byte(certificateStr), &certificateMsg); err == nil {
		if dose, totalDoses, vaccine, err := getVaccineDetails(certificateMsg); err == nil {
			services.MarkPreEnrolledUserCertified(preEnrollmentCode, contact, name, dose, certificateId, vaccine, programId, totalDoses, enrollmentOsid)
		}
	}

	return true
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
