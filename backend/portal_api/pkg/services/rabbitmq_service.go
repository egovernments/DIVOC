package services

import (
	"github.com/divoc/portal-api/config"
	log "github.com/sirupsen/logrus"
	"github.com/streadway/amqp"
)

const DefaultRoutingKey = ""
const DefaultExchangeKind = "fanout"
const DefaultQueueSuffix = "_por"

func createNewConnectionAndChannel()  (*amqp.Connection, *amqp.Channel) {
	servers := config.Config.Rabbitmq.RabbitmqServers
	log.Infof("Using Rabbitmq %s", servers)
	c, err := amqp.Dial(servers + "?heartbeat=60")
	failOnError(err, "Failed to connect to RabbitMQ")

	ch, err := c.Channel()
	failOnError(err, "Failed to open a channel")

	return c, ch
}

func InitializeRabbitmq() {
	StartEnrollmentACKConsumerOnChannel(createNewConnectionAndChannel())
	StartNotifyTopicProducerOnChannel(createNewConnectionAndChannel())
	StartEnrollmentTopicProducerOnChannel(createNewConnectionAndChannel())
}

func StartEnrollmentTopicProducerOnChannel(c *amqp.Connection, ch *amqp.Channel) {
	go func() {
		topic := config.Config.Rabbitmq.EnrollmentTopic
		defer c.Close()
		defer ch.Close()
		for {
			msg := <-enrollmentMessages
			publishMsgContent(ch, topic, DefaultRoutingKey, msg,
				amqp.Table(make(map[string]interface{})))
		}
	}()
}

func StartNotifyTopicProducerOnChannel(c *amqp.Connection, ch *amqp.Channel) {
	go func() {
		topic := config.Config.Rabbitmq.NotifyTopic
		defer c.Close()
		defer ch.Close()
		for {
			msg := <-notifications
			publishMsgContent(ch, topic, DefaultRoutingKey, msg,
				amqp.Table(make(map[string]interface{})))
		}
	}()
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
