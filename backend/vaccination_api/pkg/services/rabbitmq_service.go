package services

import (
	"encoding/json"
	"strconv"

	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/db"
	"github.com/divoc/api/pkg/models"
	"github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
	"github.com/streadway/amqp"
)

const DEFAULT_ROUTING_KEY = ""

func InitializeRabbitmq() {
	// TODO: Standardize the rabbitmq connection and channel creation from standard url, user and pwd config
	servers := config.Config.Rabbitmq.RabbitmqServers
	log.Infof("Using Rabbitmq %s", servers)
	c, err := amqp.Dial(servers + "?heartbeat=60")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer c.Close()

	ch, err := c.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	StartEnrollmentACKConsumerOnChannel()
	startCertificateRevocationConsumerOnChannel(ch)

	go func() {
		topic := config.Config.Rabbitmq.CertifyTopic
		for {
			msg := <-messages
			publishMsg(ch, topic, DEFAULT_ROUTING_KEY, msg)
		}
	}()

	go func() {
		topic := config.Config.Rabbitmq.EnrollmentTopic
		for {
			msg := <-enrollmentMessages
			publishMsg(ch, topic, DEFAULT_ROUTING_KEY, msg)
		}
	}()

	StartEventProducerOnChannel(ch)

	go func() {
		topic := config.Config.Rabbitmq.ReportedSideEffectsTopic
		for {
			msg := <-reportedSideEffects
			publishMsgContent(ch, topic, DEFAULT_ROUTING_KEY, msg,
				amqp.Table(make(map[string]interface{})))
		}
	}()

	go func() {
		msgs, err := ch.Consume(
			config.Config.Rabbitmq.CertifyAck, // queue
			"",                                // consumer
			true,                              // auto-ack
			false,                             // exclusive
			false,                             // no-local
			false,                             // no-wait
			nil,                               // args
		)
		failOnError(err, "Failed to register a consumer for CertifyAck")

		if err == nil {
			for msg := range msgs {
				var message map[string]string
				json.Unmarshal(msg.Body, &message)
				// check the status
				// update that status to certifyErrorRows db
				log.Infof("Message on %s: %v \n", msg.Exchange, message)
				if message["rowId"] == "" {
					// ignoring rows which doesnt have rowId
					ch.Ack(msg.DeliveryTag, false)
				} else {
					rowId, e := strconv.ParseUint(message["rowId"], 10, 64)
					if e != nil {
						ch.Reject(msg.DeliveryTag, true)
						log.Errorf("Error occurred wile parsing rowId as int - %s", message["rowId"])
					} else {
						if message["status"] == "SUCCESS" {
							// if certificate created successfully
							// delete that row => as we no longer require that row
							db.DeleteCertifyUploadError(uint(rowId))
						} else if message["status"] == "FAILED" {
							// if certificate creation fails
							// update the status of the row to Failed
							db.UpdateCertifyUploadErrorStatusAndErrorMsg(uint(rowId), db.CERTIFY_UPLOAD_FAILED_STATUS, message["errorMsg"])
						}
						ch.Ack(msg.DeliveryTag, false)
					}
				}
			}
		} else {
			// The client will automatically try to recover from all errors.
			log.Infof("Consumer error: %v \n", err)
		}
	}()
	//Unlike kafka_service, we'll not be logging producer events
}

func StartEventProducerOnChannel(ch *amqp.Channel) {
	go func() {
		topic := config.Config.Rabbitmq.EventsTopic
		for {
			msg := <-events
			publishMsgContent(ch, topic, DEFAULT_ROUTING_KEY, msg,
				amqp.Table(make(map[string]interface{})))
		}
	}()
}

func startCertificateRevocationConsumerOnChannel(ch *amqp.Channel) {
	go func() {

		certifiedMsgs, err := ch.Consume(
			config.Config.Rabbitmq.Certified, // queue
			"",                               // consumer
			true,                             // auto-ack
			false,                            // exclusive
			false,                            // no-local
			false,                            // no-wait
			nil,                              // args
		)
		failOnError(err, "Failed to register a consumer for Certified")

		if err == nil {
			for msg := range certifiedMsgs {
				var message models.CertifiedMessage
				if err := json.Unmarshal(msg.Body, &message); err == nil {
					// check the status
					// update that status to certifyErrorRows db
					if message.Meta.PreviousCertificateID != "" {
						log.Infof("Message on %s: %v \n", msg.Exchange, message)
						revokedCertificate := map[string]interface{}{
							"preEnrollmentCode":     message.PreEnrollmentCode,
							"certificateId":         message.CertificateId,
							"dose":                  message.Dose,
							"previousCertificateId": message.Meta.PreviousCertificateID,
						}
						_, err := services.CreateNewRegistry(revokedCertificate, "RevokedCertificate")
						if err != nil {
							log.Error("Failed saving revoked certificate %+v", err)
						}
					}
				}
				ch.Ack(msg.DeliveryTag, false)
			}
		} else {
			// The client will automatically try to recover from all errors.
			log.Infof("Consumer error: %v \n", err)
		}
	}()
}

func publishMsg(pubChannel *amqp.Channel, exchange string, routingKey string,
	msg Message) (err error) {

	headers := make(map[string]interface{})
	//TODO : push below entries into header
	// headers := {
	// 	"UploadId": msg.UploadId,
	// 	"rowId":    msg.rowId,
	// }

	return publishMsgContent(pubChannel, exchange, routingKey, []byte(msg.payload),
		amqp.Table(headers))
}

func publishMsgContent(pubChannel *amqp.Channel, exchange string, routingKey string,
	content []byte, headers amqp.Table) (err error) {

	if err := pubChannel.Publish(exchange, routingKey, false, false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(content),
			Headers:     headers,
		}); err != nil {
		log.Errorf("Error while publishing message to %s", exchange)
	}

	return err
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
		panic(err)
	}
}
