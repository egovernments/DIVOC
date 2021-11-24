package consumers

import (
	"bytes"
	"encoding/json"
	"fmt"
	kernelServices "github.com/divoc/kernel_library/services"
	"github.com/divoc/notification-service/config"
	eventModels "github.com/divoc/notification-service/pkg/models"
	"github.com/divoc/notification-service/pkg/services"
	"github.com/divoc/notification-service/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"text/template"
)

const RecipientCertified = "recipientCertified"

func certifiedEmailNotificationConsumerWithRabbitmq() {
	facilityRegisteredTemplateString := kernelServices.FlagrConfigs.NotificationTemplates[RecipientCertified].Message
	subject := kernelServices.FlagrConfigs.NotificationTemplates[RecipientCertified].Subject

	var facilityRegisteredTemplate = template.Must(template.New("").Parse(facilityRegisteredTemplateString))
	c, ch := services.CreateNewConnectionAndChannel()
	topic := config.Config.Rabbitmq.CertifiedTopic
	queue := topic + "_email"
	msgs, cErr := services.ConsumeFromExchangeUsingQueue(ch, topic,
		queue, services.DefaultExchangeKind)
	if cErr != nil {
		// The client will automatically try to recover from all errors.
		fmt.Printf("Consumer error: %v \n", cErr)
	} else {
		defer c.Close()
		defer ch.Close()
		for msg := range msgs {
			processEmailCertifiedTopicMessage(topic, msg.Body, subject, facilityRegisteredTemplate)
			ch.Ack(msg.DeliveryTag, false)
		}
	}
}

func certifiedEmailNotificationConsumerWithKafka() {
	facilityRegisteredTemplateString := kernelServices.FlagrConfigs.NotificationTemplates[RecipientCertified].Message
	subject := kernelServices.FlagrConfigs.NotificationTemplates[RecipientCertified].Subject

	var facilityRegisteredTemplate = template.Must(template.New("").Parse(facilityRegisteredTemplateString))
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "certified_email_notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})

	if err != nil {
		log.Error(err)
	} else {
		topic := config.Config.Kafka.CertifiedTopic
		if err := c.SubscribeTopics([]string{topic}, nil); err != nil {
			log.Errorf("Error in subscribing to the topic %s : %+v", topic, err)
		} else {
			for {
				msg, err := c.ReadMessage(-1)
				if err == nil {
					processEmailCertifiedTopicMessage(topic, msg.Value, subject, facilityRegisteredTemplate)
				} else {
					// The client will automatically try to recover from all errors.
					fmt.Printf("Consumer error: %v \n", err)
				}
				if msg != nil {
					_, _ = c.CommitMessage(msg)
				}
			}
		}

		c.Close()
	}
}

func processEmailCertifiedTopicMessage(topic string,  msgVal []byte,
	subject string, facilityRegisteredTemplate *template.Template) {

	fmt.Printf("Message on %s: %s\n", topic, string(msgVal))
	var certifyMessage eventModels.CertifiedMessage
	if err := json.Unmarshal([]byte(string(msgVal)), &certifyMessage); err != nil {
		log.Errorf("Received message is not in required format %+v", err)
	}
	if len(certifyMessage.Contact) > 0 {
		for _, contact := range certifyMessage.Contact {
			emailID, err := services.GetEmailId(contact)
			if err == nil {
				var certificate map[string]interface{}
				err := json.Unmarshal([]byte(certifyMessage.Certificate), &certificate)
				if err == nil {
					vaccineName, ok := (certificate["evidence"].([]interface{})[0].(map[string]interface{}))["vaccine"].(string)
					if ok {
						templateObject := map[string]interface{}{
							"Name":        certifyMessage.Name,
							"VaccineName": vaccineName,
						}
						buf := bytes.Buffer{}
						err := facilityRegisteredTemplate.Execute(&buf, templateObject)
						if err == nil {
							if err := services.SendEmail(emailID, subject, buf.String()); err == nil {
								log.Debugf("EMAIL sent response %+v")
							} else {
								log.Errorf("Error in sending email %+v", err)
							}
						} else {
							log.Errorf("Failed generating notification template", err)
						}
					}
				}
			}
		}
	} else {
		log.Errorf("EMAIL ID not available to send SMS %+v", certifyMessage)
	}
}

func certifiedSMSNotificationConsumerWithRabbitmq() {
	facilityRegisteredTemplateString := kernelServices.FlagrConfigs.NotificationTemplates[RecipientCertified].Message
	var facilityRegisteredTemplate = template.Must(template.New("").Parse(facilityRegisteredTemplateString))
	c, ch := services.CreateNewConnectionAndChannel()
	topic := config.Config.Rabbitmq.CertifiedTopic
	queue := topic + "_sms"
	msgs, cErr := services.ConsumeFromExchangeUsingQueue(ch, topic,
		queue, services.DefaultExchangeKind)
	if cErr != nil {
		// The client will automatically try to recover from all errors.
		fmt.Printf("Consumer error: %v \n", cErr)
	} else {
		defer c.Close()
		defer ch.Close()
		for msg := range msgs {
			processSmsCertifiedTopicMessage(topic, msg.Body, facilityRegisteredTemplate)
			ch.Ack(msg.DeliveryTag, false)
		}
	}
}


func certifiedSMSNotificationConsumerWithKafka() {
	facilityRegisteredTemplateString := kernelServices.FlagrConfigs.NotificationTemplates[RecipientCertified].Message
	var facilityRegisteredTemplate = template.Must(template.New("").Parse(facilityRegisteredTemplateString))
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "certified_sms_notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})

	if err != nil {
		log.Error(err)
	} else {
		topic := config.Config.Kafka.CertifiedTopic
		if err := c.SubscribeTopics([]string{topic}, nil); err!=nil {
			log.Errorf("Error in subscribing to %s : %+v", topic, err)
		} else {
			for {
				msg, err := c.ReadMessage(-1)
				if err == nil {
					processSmsCertifiedTopicMessage(topic, msg.Value, facilityRegisteredTemplate)
				} else {
					// The client will automatically try to recover from all errors.
					fmt.Printf("Consumer error: %v \n", err)
				}
				if msg != nil {
					_, _ = c.CommitMessage(msg)
				}
			}
		}

		_ = c.Close()
	}
}

func processSmsCertifiedTopicMessage(topic string,  msgVal []byte,
	facilityRegisteredTemplate *template.Template) {
	fmt.Printf("Message on %s: %s\n", topic, string(msgVal))
	var certifyMessage eventModels.CertifiedMessage
	if err := json.Unmarshal([]byte(string(msgVal)), &certifyMessage); err != nil {
		log.Errorf("Received message is not in required format %+v", err)
	}
	if len(certifyMessage.Contact) > 0 {
		for _, contact := range certifyMessage.Contact {
			mobileNumber, err := services.GetMobileNumber(contact)
			if err == nil {
				var certificate map[string]interface{}
				err := json.Unmarshal([]byte(certifyMessage.Certificate), &certificate)
				if err == nil {
					vaccineName, ok := (certificate["evidence"].([]interface{})[0].(map[string]interface{}))["vaccine"].(string)
					if ok {
						templateObject := map[string]interface{}{
							"Name":        certifyMessage.Name,
							"VaccineName": vaccineName,
						}
						buf := bytes.Buffer{}
						err := facilityRegisteredTemplate.Execute(&buf, templateObject)
						if err == nil {
							if resp, err := services.SendSMS(mobileNumber, buf.String()); err == nil {
								log.Debugf("SMS sent response %+v", resp)
							} else {
								log.Errorf("Error in sending SMS %+v", err)
							}
						} else {
							log.Errorf("Failed generating notification template", err)
						}
					}
				}
			}
		}
	} else {
		log.Errorf("Mobile number not available to send SMS %+v", certifyMessage)
	}
}

func notifyConsumerWithRabbitmq() {
	c, ch := services.CreateNewConnectionAndChannel()
	topic := config.Config.Rabbitmq.NotifyTopic
	queue := topic + services.DefaultQueueSuffix
	msgs, cErr := services.ConsumeFromExchangeUsingQueue(ch, topic,
		queue, services.DefaultExchangeKind)
	if cErr != nil {
		// The client will automatically try to recover from all errors.
		fmt.Printf("Consumer error: %v \n", cErr)
	} else {
		defer c.Close()
		defer ch.Close()
		for msg := range msgs {
			processNotifyMessage(topic, msg.Body)
			ch.Ack(msg.DeliveryTag, false)
		}
	}
}

func notifyConsumerWithKafka() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	topic := config.Config.Kafka.NotifyTopic
	if err != nil {
		log.Error(err)
	}
	err = c.SubscribeTopics([]string{topic}, nil)
	if err != nil {
		log.Error(err)
	} else {
		for {
			msg, err := c.ReadMessage(-1)
			if err == nil {
				processNotifyMessage(topic, msg.Value)
			} else {
				// The client will automatically try to recover from all errors.
				fmt.Printf("Consumer error: %v \n", err)
			}
			if msg != nil {
				_, err = c.CommitMessage(msg)
			}
			if err != nil {
				log.Errorf("Error in committing message %+v", err)
			}
		}

		c.Close()
	}
}

func processNotifyMessage(topic string, msgVal []byte) {
	fmt.Printf("Message on %s: %s\n", topic, string(msgVal))
	var request models.NotificationRequest
	if err := json.Unmarshal([]byte(string(msgVal)), &request); err != nil {
		log.Errorf("Received message is not in required format %+v", err)
	}
	contactType, err := services.GetContactType(*request.Recipient)
	if contactType == services.SMS {
		mobileNumber, err := services.GetMobileNumber(*request.Recipient)
		if err == nil {
			if resp, err := services.SendSMS(mobileNumber, *request.Message); err == nil {
				log.Debugf("SMS sent response %+v", resp)

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

			} else {
				log.Errorf("Error in sending SMS %+v", err)
			}
		} else {
			log.Errorf("Invalid notification mobile number %+v, %+v", request, err)
		}
	} else {
		log.Errorf("Invalid notification contact %+v, %+v", request, err)
	}
}
