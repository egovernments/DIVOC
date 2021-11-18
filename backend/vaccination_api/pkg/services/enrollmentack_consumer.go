package services

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/divoc/api/swagger_gen/models"
	models2 "github.com/divoc/api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"github.com/streadway/amqp"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

//StartEnrollmentACKConsumer : consumes enrollment_ack and updates CSV upload errors
func StartEnrollmentACKConsumer() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "enrollment_ack_certify",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Errorf("Failed connecting to kafka", err)
	}
	go func() {
		err := consumer.SubscribeTopics([]string{config.Config.Kafka.EnrollmentACKTopic}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err != nil {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
				continue
			}
			processEnrollmentAckMsg(msg.Value, *msg.TopicPartition.Topic)
			consumer.CommitMessage(msg)
		}
	}()
}

func StartEnrollmentACKConsumerOnChannel() {
	servers := config.Config.Rabbitmq.RabbitmqServers
	log.Infof("Using Rabbitmq %s", servers)
	c, err := amqp.Dial(servers + "?heartbeat=60")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer c.Close()

	ch, err := c.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()


	go func() {

		msgs, err := ConsumeFromExchangeUsingQueue( ch, config.Config.Rabbitmq.EnrollmentACKTopic,
			"enrollment_ack_certify", DEFAULT_EXCHANGE_KIND)
		if err != nil {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", err)
		} else {
			for msg := range msgs {
				processEnrollmentAckMsg(msg.Body, msg.Exchange)
				ch.Ack(msg.DeliveryTag, false)
			}
		}
	}()
}

func processEnrollmentAckMsg(content []byte, exchange string) {
	var message struct {
		Err                *string                     `json:"errMsg"`
		EnrollmentType     string                      `json:"enrollmentType"`
		VaccinationDetails models.CertificationRequest `json:"vaccinationDetails"`
	}
	if err := json.Unmarshal(content, &message); err != nil {
		log.Error("Error unmarshalling to expected format : ", err)
		return
	}
	log.Infof("Message on %s: %v \n", exchange, message)

	if message.EnrollmentType == models2.EnrollmentEnrollmentTypeWALKIN {
		certifyMsg, _ := json.Marshal(message.VaccinationDetails)
		log.Infof("Certifying recepient[preEnrollmentCode: %s]", *message.VaccinationDetails.PreEnrollmentCode)
		PublishCertifyMessage(certifyMsg, nil, nil)
	}
}
