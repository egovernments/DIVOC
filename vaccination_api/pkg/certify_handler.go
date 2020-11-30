package pkg

import (
	"github.com/divoc/api/config"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

var producer *kafka.Producer

var messages = make(chan string)

func InitializeKafka() {
	servers := config.Config.Kafka.BootstrapServers
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": servers})
	if err != nil {
		panic(err)
	}
	log.Infof("Connected to kafka on %s", servers)

	//defer func() {
	//	log.Info("Closing the producer!")
	//	producer.Close()
	//}()

	go func() {
		topic := config.Config.Kafka.CertifyTopic
		for {
			msg := <-messages
			producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          []byte(msg),
			}, nil)
		}
	}()

	go func() {
		for e := range producer.Events() {
			log.Infof("%+v", e)
			switch ev := e.(type) {
			case *kafka.Message:
				if ev.TopicPartition.Error != nil {
					log.Infof("Delivery failed: %v\n%+v", ev.TopicPartition, ev.Value)
				} else {
					log.Infof("Delivered message to %v\n", ev.TopicPartition)
				}
			}
		}

	}()
}

func publishCertifyMessage(message []byte) {
	messages <- string(message)
	//topic := config.Config.Kafka.CertifyTopic
	//err := producer.Produce(&kafka.Message{
	//	TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
	//	Value:          message,
	//}, nil)
	//log.Infof("Error %+v", err)
}
