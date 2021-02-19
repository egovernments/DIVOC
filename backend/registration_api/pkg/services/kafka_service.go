package services

import (
	"github.com/divoc/registration-api/config"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

var enrollmentMessages = make(chan []byte)

func InitializeKafka() {
	servers := config.Config.Kafka.BootstrapServers
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": servers})
	if err != nil {
		panic(err)
	}

	log.Infof("Connected to kafka on %s", servers)
	StartEnrollmentConsumer()
	StartRecipientsAppointmentConsumer()
	go func() {
		topic := config.Config.Kafka.EnrollmentTopic
		for {
			msg:= <-enrollmentMessages
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value: msg,
			}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
		}
	}()

}

func PublishEnrollmentMessage(enrollment []byte) {
	enrollmentMessages <- enrollment
}
