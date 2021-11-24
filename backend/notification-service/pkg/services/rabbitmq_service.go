package services

import (
	"github.com/divoc/notification-service/config"
	log "github.com/sirupsen/logrus"
	"github.com/streadway/amqp"
)

const DefaultRoutingKey = ""
const DefaultExchangeKind = "fanout"
const DefaultQueueSuffix = "_not"

func CreateNewConnectionAndChannel()  (*amqp.Connection, *amqp.Channel) {
	servers := config.Config.Rabbitmq.RabbitmqServers
	log.Infof("Using Rabbitmq %s", servers)
	c, err := amqp.Dial(servers + "?heartbeat=60")
	FailOnError(err, "Failed to connect to RabbitMQ")

	ch, err := c.Channel()
	FailOnError(err, "Failed to open a channel")

	return c, ch
}

func FailOnError(err error, msg string) {
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
	FailOnError(err, "Failed to declare exchange "+ exchange)

	q, err := ch.QueueDeclare(
		queue, // name
		true,                     // durable
		false,                    // delete when unused
		false,                     // exclusive
		false,                    // no-wait
		nil,                      // arguments
	)
	FailOnError(err, "Failed to declare Queue "+ queue)

	err = ch.QueueBind(
		q.Name,                                    // queue name
		"",                                        // routing key
		exchange, // exchange
		false,
		nil,
	)
	FailOnError(err, "Failed to declare Queue "+queue+" Binding with Exchange "+exchange)

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	FailOnError(err, "Failed to register a consumer on queue "+queue)
	return msgs, err
}