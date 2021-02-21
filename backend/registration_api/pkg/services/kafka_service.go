package services

import (
	"encoding/json"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/models"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

var enrollmentMessages = make(chan []byte)
var appointmentAckMessages = make(chan []byte)

func InitializeKafka() {
	servers := config.Config.Kafka.BootstrapServers
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": servers})
	if err != nil {
		panic(err)
	}

	log.Infof("Connected to kafka on %s", servers)
	StartEnrollmentConsumer()

	go func() {
		topic := config.Config.Kafka.EnrollmentTopic
		for {
			msg := <-enrollmentMessages
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          msg,
			}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
		}
	}()

	go func() {
		topic := config.Config.Kafka.AppointmentAckTopic
		for {
			msg := <-appointmentAckMessages
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          msg,
			}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
		}
	}()

}

func PublishEnrollmentMessage(enrollment []byte) {
	enrollmentMessages <- enrollment
}

func PublishAppointmentAcknowledgement(appointmentAck models.AppointmentAck) {
	if messageJson, err := json.Marshal(appointmentAck); err != nil {
		log.Errorf("Error in getting json of event %+v", appointmentAck)
	} else {
		appointmentAckMessages <- messageJson
	}
}
