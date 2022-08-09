package consumers

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/divoc/notification-service/config"
	"github.com/divoc/notification-service/pkg/services"
	model "github.com/divoc/notification-service/pkg/models"
	"github.com/divoc/notification-service/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func notifyConsumer() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
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
				var request models.NotificationRequest
				if err = json.Unmarshal([]byte(string(msg.Value)), &request); err != nil {
					log.Errorf("Received message is not in NotificationRequest format %+v", err)
				}
				for _, recipient := range strings.Split(*request.Recipient, ",") {
					contactType, err := services.GetContactType(recipient)
					if err != nil {
						log.Error(err)
					}
					if contactType == services.SMS {
						mobileNumber, err := services.GetMobileNumber(recipient)
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
						emailId, err := services.GetEmailId(recipient)
						if err == nil {
							if err := services.SendEmail(emailId, request.Subject, *request.Message); err == nil {
								log.Debugf("Email sent successfully")

							} else {
								log.Errorf("Error in sending Email %+v", err)
							}
						} else {
							log.Errorf("Invalid notification mobile number %+v, %+v", request, err)
						}
					}
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

func createNotificationConsumer() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "notifier",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Error(err)
	}
	err = c.SubscribeTopics([]string{config.Config.Kafka.CreateNotificationTopic}, nil)
	if err != nil {
		log.Error(err)
	} else {
		for {
			msg, err := c.ReadMessage(-1)
			if err == nil {
				var notificationPayload model.NotificationPayload
				if err = json.Unmarshal([]byte(string(msg.Value)), &notificationPayload); err != nil {
					log.Errorf("Received message is not in NotificationPayload format %+v", err)
				}
				log.Infof("notificationPayload: %v",notificationPayload)
				request,err := services.ConstructMessage(notificationPayload)
				if(err==nil){
					for _, recipient := range strings.Split(*request.Recipient, ",") {
						contactType, err := services.GetContactType(recipient)
						if err != nil {
							log.Error(err)
						}
						if contactType == services.SMS {
							mobileNumber, err := services.GetMobileNumber(recipient)
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
							emailId, err := services.GetEmailId(recipient)
							if err == nil {
								if err := services.SendEmail(emailId, request.Subject, *request.Message); err == nil {
									log.Debugf("Email sent successfully")
	
								} else {
									log.Errorf("Error in sending Email %+v", err)
								}
							} else {
								log.Errorf("Invalid notification mobile number %+v, %+v", request, err)
							}
						}
					}
				}else{
					log.Errorf(" message can't be converted to NotificationRequestformat %+v", err)
				}
				
			} else {
				// The client will automatically try to recover from all errors.
				fmt.Printf("Consumer error: %v \n", err)
			}
			if msg != nil {
				_, err = c.CommitMessage(msg)
			}
			if err != nil {
				log.Errorf("Error in committing notify2 message %+v", err)
			}
		}
		c.Close()
	}
}
