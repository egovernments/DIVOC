package consumers

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/notification-service/config"
	eventModels "github.com/divoc/notification-service/pkg/models"
	"github.com/divoc/notification-service/pkg/services"
	"github.com/divoc/notification-service/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func certifiedEmailNotificationConsumer() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "certified_email_notifier",
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
			var certifyMessage eventModels.CertifiedMessage
			if err := json.Unmarshal([]byte(string(msg.Value)), &certifyMessage); err != nil {
				log.Errorf("Received message is not in required format %+v", err)
			}
			if len(certifyMessage.Recipient.Contact) > 0 {
				for _, contact := range certifyMessage.Recipient.Contact {
					emailID, err := services.GetEmailId(contact)
					if err == nil {
						vaccineName := certifyMessage.Vaccination.Name
						recipientName := certifyMessage.Recipient.Name
						subject := "DIVOC - Vaccine Certificate"
						message := recipientName + ", your " + vaccineName + " vaccine certificate can be viewed and downloaded at: https://divoc.xiv.in/certificate/ "
						if err := services.SendEmail(emailID, subject, message); err == nil {
							log.Debugf("EMAIL sent response %+v")
							c.CommitMessage(msg)
						} else {
							log.Errorf("Error in sending email %+v", err)
						}
					}
				}

			} else {
				log.Errorf("EMAIL ID not available to send SMS %+v", certifyMessage)
			}
		} else {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", err)
		}
	}

	c.Close()
}

func certifiedSMSNotificationConsumer() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "certified_sms_notifier",
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
			var certifyMessage eventModels.CertifiedMessage
			if err := json.Unmarshal([]byte(string(msg.Value)), &certifyMessage); err != nil {
				log.Errorf("Received message is not in required format %+v", err)
			}
			if len(certifyMessage.Recipient.Contact) > 0 {
				for _, contact := range certifyMessage.Recipient.Contact {
					//TODO: check for prefix
					mobileNumber, err := services.GetMobileNumber(contact)
					if err == nil {
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

func notifyConsumer() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})

	if err != nil {
		panic(err)
	}
	err = c.SubscribeTopics([]string{config.Config.Kafka.NotifyTopic}, nil)
	if err != nil {
		panic(err)
	}
	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
			var request models.NotificationRequest
			if err := json.Unmarshal([]byte(string(msg.Value)), &request); err != nil {
				log.Errorf("Received message is not in required format %+v", err)
			}
			contactType, err := services.GetContactType(*request.Recipient)
			if contactType == services.SMS {
				mobileNumber, err := services.GetMobileNumber(*request.Recipient)
				if err == nil {
					if resp, err := services.SendSMS(mobileNumber, *request.Message); err == nil {
						log.Debugf("SMS sent response %+v", resp)
						_, err := c.CommitMessage(msg)
						if err != nil {
							log.Errorf("Error in committing message %+v", err)
						}
					} else {
						log.Errorf("Error in sending SMS %+v", err)
					}
				} else {
					log.Errorf("Invalid notification mobile number %+v, %+v", request, err)
				}
			} else if contactType == services.Email {
				emailId, err := services.GetEmailId(*request.Recipient)
				if err == nil {
					if err := services.SendEmail(emailId, request.Subject, *request.Message); err == nil {
						log.Debugf("Email sent successfully")
						_, err := c.CommitMessage(msg)
						if err != nil {
							log.Errorf("Error in committing message %+v", err)
						}
					} else {
						log.Errorf("Error in sending SMS %+v", err)
					}
				} else {
					log.Errorf("Invalid notification mobile number %+v, %+v", request, err)
				}
			} else {
				log.Errorf("Invalid notification contact %+v, %+v", request, err)
			}

		} else {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", err)
		}
	}

	c.Close()
}
