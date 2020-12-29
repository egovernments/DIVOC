package consumers

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/notification-service/config"
	"github.com/divoc/notification-service/pkg/models"
	"github.com/divoc/notification-service/pkg/services"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func smsNotifyConsumer() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "sms_notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})

	if err != nil {
		panic(err)
	}
	c.SubscribeTopics([]string{config.Config.Kafka.CertifiedTopic}, nil)
	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
			var certifyMessage models.CertifiedMessage
			if err := json.Unmarshal([]byte(string(msg.Value)), &certifyMessage); err != nil {
				log.Errorf("Received message is not in required format %+v", err)
			}
			if len(certifyMessage.Recipient.Contact) > 0 {
				for _, contact := range certifyMessage.Recipient.Contact {
					//TODO: check for prefix
					mobileNumber := contact
					vaccineName := certifyMessage.Vaccination.Name
					recipientName := certifyMessage.Recipient.Name
					message := recipientName + ", your " + vaccineName + " vaccine certificate can be viewed and downloaded at: https://divoc.xiv.in/certificate/ "
					if resp, err := services.SendSMS(mobileNumber, message); err == nil {
						log.Debugf("SMS sent response %+v", resp)
						c.CommitMessage(msg)
					} else {
						log.Errorf("Error in sending SMS %+v", err)
					}
				}
			} else {
				log.Errorf("Mobile number not available to send SMS %+v", certifyMessage)
			}
		} else {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", err)
		}
	}

	c.Close()
}
