package services

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/db"
	"github.com/divoc/api/pkg/models"
	"github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
	"github.com/streadway/amqp"
	"strconv"
)

const DefaultRoutingKey = ""
const DefaultExchangeKind = "fanout"

func CreateNewConnectionAndChannel()  (*amqp.Connection, *amqp.Channel) {
	servers := config.Config.Rabbitmq.RabbitmqServers
	log.Infof("Using Rabbitmq %s", servers)
	c, err := amqp.Dial(servers + "?heartbeat=60")
	failOnError(err, "Failed to connect to RabbitMQ")

	ch, err := c.Channel()
	failOnError(err, "Failed to open a channel")

	return c, ch
}

func InitializeRabbitmq() {
	StartEnrollmentACKConsumerOnChannel()
	startCertificateRevocationConsumerOnChannel(CreateNewConnectionAndChannel())
	startCertifyAckConsumerOnChannel(CreateNewConnectionAndChannel())

	startCertifyTopicProducerOnChannel(CreateNewConnectionAndChannel())
	startEnrollmentProducerOnChannel(CreateNewConnectionAndChannel())
	StartEventProducerOnChannel(CreateNewConnectionAndChannel())
	startReportedSideEffectsTopicProducer(CreateNewConnectionAndChannel())
	//Unlike kafka_service, we'll not be logging producer events
}

func startCertifyTopicProducerOnChannel(c *amqp.Connection, ch *amqp.Channel ) {
	go func() {
		topic := config.Config.Rabbitmq.CertifyTopic
		defer c.Close()
		defer ch.Close()
		for {
			msg := <-messages
			publishMsg(ch, topic, DefaultRoutingKey, msg)
		}
	}()
}

func startEnrollmentProducerOnChannel(c *amqp.Connection, ch *amqp.Channel) {
	go func() {
		topic := config.Config.Rabbitmq.EnrollmentTopic
		defer c.Close()
		defer ch.Close()
		for {
			msg := <-enrollmentMessages
			publishMsg(ch, topic, DefaultRoutingKey, msg)
		}
	}()
}

func startReportedSideEffectsTopicProducer(c *amqp.Connection, ch *amqp.Channel) {
	go func() {
		topic := config.Config.Rabbitmq.ReportedSideEffectsTopic
		defer c.Close()
		defer ch.Close()
		for {
			msg := <-reportedSideEffects
			publishMsgContent(ch, topic, DefaultRoutingKey, msg,
				amqp.Table(make(map[string]interface{})))
		}
	}()
}

func startCertifyAckConsumerOnChannel(c *amqp.Connection, ch *amqp.Channel) {
	go func() {
		certifyAckMsgs, cErr := ConsumeFromExchangeUsingQueue(ch, config.Config.Rabbitmq.CertifyAck,
			"certify_ack", DefaultExchangeKind)
		defer c.Close()
		defer ch.Close()
		if cErr != nil {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", cErr)
		} else {
			for msg := range certifyAckMsgs {
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
		}
	}()
}

func StartEventProducerOnChannel(c *amqp.Connection, ch *amqp.Channel) {
	go func() {
		topic := config.Config.Rabbitmq.EventsTopic
		defer c.Close()
		defer ch.Close()
		for {
			msg := <-events
			publishMsgContent(ch, topic, DefaultRoutingKey, msg,
				amqp.Table(make(map[string]interface{})))
		}
	}()
}

func startCertificateRevocationConsumerOnChannel(c *amqp.Connection, ch *amqp.Channel) {
	go func() {
		certifiedMsgs, cErr := ConsumeFromExchangeUsingQueue( ch, config.Config.Rabbitmq.CertifiedTopic,
			"certificate_revocation", DefaultExchangeKind)
		defer c.Close()
		defer ch.Close()
		if cErr != nil {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", cErr)
		} else {
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
		}
	}()
}

func publishMsg(pubChannel *amqp.Channel, exchange string, routingKey string,
	msg Message) (err error) {

	headers := make(map[string]interface{})
	headers["UploadId"] = msg.UploadId
	headers["rowId"] = msg.rowId

	return publishMsgContent(pubChannel, exchange, routingKey, []byte(msg.payload),
		amqp.Table(headers))
}

func publishMsgContent(pubChannel *amqp.Channel, exchange string, routingKey string,
	content []byte, headers amqp.Table) (err error) {

	pubErr := pubChannel.Publish(exchange, routingKey, false, false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(content),
			Headers:     headers,
		});
	failOnError(pubErr, "Error while publishing message to "+ exchange)
	return err
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
		panic(err)
	}
}

func ConsumeFromExchangeUsingQueue(ch *amqp.Channel,
	exchange string, queue string, exchangeKind string) (<-chan amqp.Delivery, error) {
	err := ch.ExchangeDeclare(
		exchange, // name
		exchangeKind,                                  // type
		true,                                      // durable
		false,                                     // auto-deleted
		false,                                     // internal
		false,                                     // no-wait
		nil,                                       // arguments
	)
	failOnError(err, "Failed to declare exchange "+ exchange)

	q, err := ch.QueueDeclare(
		queue, // name
		true,                     // durable
		false,                    // delete when unused
		false,                     // exclusive
		false,                    // no-wait
		nil,                      // arguments
	)
	failOnError(err, "Failed to declare Queue "+ queue)

	err = ch.QueueBind(
		q.Name,                                    // queue name
		"",                                        // routing key
		exchange, // exchange
		false,
		nil,
	)
	failOnError(err, "Failed to declare Queue "+queue+" Binding with Exchange "+exchange)

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer on queue "+queue)
	return msgs, err
}