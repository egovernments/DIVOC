package consumers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"

	kernelServices "github.com/divoc/kernel_library/services"
	"github.com/divoc/notification-service/config"
	eventModels "github.com/divoc/notification-service/pkg/models"
	"github.com/divoc/notification-service/pkg/services"
	"github.com/divoc/notification-service/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

const RecipientCertified = "recipientCertified"
func certifiedEmailNotificationConsumer() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "certified_email_notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
		"security.protocol": config.Config.Kafka.SecurityProtocol,
		"sasl.mechanism"    : config.Config.Kafka.SaslMechanism,
		"sasl.username": config.Config.Kafka.SaslUsername,
		"sasl.password": config.Config.Kafka.SaslPassword,
		"ssl.ca.location": config.Config.Kafka.SslCaLocation,
	})

	if err != nil {
		log.Error(err)
	} else {
		topicName := config.Config.Kafka.CertifiedTopic
		if err := c.SubscribeTopics([]string{topicName}, nil); err != nil {
			log.Errorf("Error in subscribing to the topic %s : %+v", topicName, err)
		} else {
			for {
				msg, err := c.ReadMessage(-1)
				if err == nil {
					log.Debugf("Message:  %s", string(msg.Value))
					log.Infof("Topic: %s ", msg.TopicPartition)
					var certifyMessage eventModels.CertifiedMessage
					if err := json.Unmarshal([]byte(string(msg.Value)), &certifyMessage); err != nil {
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
										facilityRegisteredTemplateString := kernelServices.AppConfigs.NotificationTemplates[RecipientCertified].Message
										subject := kernelServices.AppConfigs.NotificationTemplates[RecipientCertified].Subject
										facilityRegisteredTemplate := template.Must(template.New("").Parse(facilityRegisteredTemplateString))

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

func certifiedSMSNotificationConsumer() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "certified_sms_notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
		"security.protocol": config.Config.Kafka.SecurityProtocol,
		"sasl.mechanism"    : config.Config.Kafka.SaslMechanism,
		"sasl.username": config.Config.Kafka.SaslUsername,
		"sasl.password": config.Config.Kafka.SaslPassword,
		"ssl.ca.location": config.Config.Kafka.SslCaLocation,
	})

	if err != nil {
		log.Error(err)
	} else {
		topicName := config.Config.Kafka.CertifiedTopic
		if err := c.SubscribeTopics([]string{topicName}, nil); err != nil {
			log.Errorf("Error in subscribing to %s : %+v", topicName, err)
		} else {
			for {
				msg, err := c.ReadMessage(-1)
				if err == nil {
					log.Debugf("Message:  %s", string(msg.Value))
					log.Infof("Topic: %s ", msg.TopicPartition)
					var certifyMessage eventModels.CertifiedMessage
					if err := json.Unmarshal([]byte(string(msg.Value)), &certifyMessage); err != nil {
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
										facilityRegisteredTemplateString := kernelServices.AppConfigs.NotificationTemplates[RecipientCertified].Message
										facilityRegisteredTemplate := template.Must(template.New("").Parse(facilityRegisteredTemplateString))
										err := facilityRegisteredTemplate.Execute(&buf, templateObject)
										if err == nil {
											if resp, err := services.SendSMS(mobileNumber, buf.String()); err == nil {
												log.Debugf("SMS sent response %+v", resp)
												log.Infof("SMS is sent")
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

func notifyConsumer() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
		"security.protocol": config.Config.Kafka.SecurityProtocol,
		"sasl.mechanism"    : config.Config.Kafka.SaslMechanism,
		"sasl.username": config.Config.Kafka.SaslUsername,
		"sasl.password": config.Config.Kafka.SaslPassword,
		"ssl.ca.location": config.Config.Kafka.SslCaLocation,
	})

	if err != nil {
		log.Error(err)
	}
	err = c.SubscribeTopics([]string{config.Config.Kafka.NotifyTopic}, nil)
	if err != nil {
		log.Error(err)
	} else {
		for {
			msg, err := c.ReadMessage(-1)
			if err == nil {
				log.Debugf("Message:  %s", string(msg.Value))
				log.Infof("Topic: %s ", msg.TopicPartition)
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
							log.Infof("SMS is sent")
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
