package services

import (
	"encoding/json"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/streadway/amqp"

	"github.com/divoc/portal-api/config"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func StartEnrollmentACKConsumerOnChannel(c *amqp.Connection, ch *amqp.Channel) {
	go func() {
		defer c.Close()
		defer ch.Close()
		topic := config.Config.Rabbitmq.EnrollmentACKTopic
		msgs, err := ConsumeFromExchangeUsingQueue( ch, topic,
			DefaultQueueSuffix, DefaultExchangeKind)
		if err != nil {
			// The client will automatically try to recover from all errors.
			log.Errorf("Consumer error: %v \n", err)
		} else {
			for msg := range msgs {
				processEnrollmentAckMsg(topic, msg.Body)
				ch.Ack(msg.DeliveryTag, false)
			}
		}
	}()
}

//StartEnrollmentACKConsumer : consumes enrollment_ack and updates CSV upload errors
func StartEnrollmentACKConsumer() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "enrollment_ack",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Errorf("Failed connecting to kafka", err)
	}
	go func() {
		topic := config.Config.Kafka.EnrollmentACKTopic
		err := consumer.SubscribeTopics([]string{}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err == nil {
				processEnrollmentAckMsg(topic, msg.Value)
				consumer.CommitMessage(msg)
			} else {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
			}
		}
	}()
}

func processEnrollmentAckMsg( topic string, msgValue []byte) {
	var message struct {
		RowID *uint   `json:"rowID"`
		Err   *string `json:"errMsg"`
	}
	json.Unmarshal(msgValue, &message)
	log.Infof("Message on %s: %s \n", topic, msgValue)

	if message.RowID != nil {
		if message.Err != nil {
			db.UpdateCSVUploadError(*message.RowID, *message.Err, false)
		} else {
			db.DeleteCSVUploadError(*message.RowID)
		}
	}
}
