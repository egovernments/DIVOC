package consumers

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/services"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func StartEnrollmentConsumerWithRabbitmq() {
	c, ch := services.CreateNewConnectionAndChannel()
	topic := config.Config.Rabbitmq.EnrollmentTopic
	queue := topic + services.DefaultQueueSuffix
	go func() {
		msgs, cErr := services.ConsumeFromExchangeUsingQueue(ch, topic,
			queue, services.DefaultExchangeKind)
		if cErr != nil {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", cErr)
		} else {
			defer c.Close()
			defer ch.Close()
			for msg := range msgs {
				processEnrollmentTopicMessage(topic, msg.Body)
				ch.Ack(msg.DeliveryTag, false)
			}
		}
	}()
}

func StartEnrollmentConsumerWithKafka() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "enroll-recipient",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Errorf("Failed connecting to kafka %+v", err)
	}
	go func() {
		topic := config.Config.Kafka.EnrollmentTopic
		err := consumer.SubscribeTopics([]string{}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err != nil {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
				if msg != nil {
					_, _ = consumer.CommitMessage(msg)
				}
				continue
			}
			processEnrollmentTopicMessage(topic, msg.Value)
			_, _ = consumer.CommitMessage(msg)
		}
	}()
}

func processEnrollmentTopicMessage(topic string, msg []byte) {
	log.Info("Got the message to create new enrollment")
	var enrollment = services.EnrollmentPayload{}
	if err := json.Unmarshal(msg, &enrollment); err != nil {
		// Push to error topic
		log.Info("Unable to serialize the request body", err)
		return
	}
	log.Infof("Message on %s: %s \n", topic, string(msg))

	err := services.CreateEnrollment(&enrollment)
	services.PublishEnrollmentACK(enrollment, err)
	if err != nil {
		// Push to error topic
		log.Errorf("Error occurred while trying to create the enrollment (%v)", err)
		return
	}
	if err := services.NotifyRecipient(enrollment.Enrollment); err != nil {
		log.Error("Unable to send notification to the enrolled user", err)
	}
	return
}


