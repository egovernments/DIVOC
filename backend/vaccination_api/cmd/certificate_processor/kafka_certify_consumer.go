package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func initAndConsumeFromKafka() {
	config.Initialize()
	log.Infof("Starting certificate processor")
	log.Infof("Using kafka %s", config.Config.Kafka.BootstrapServers)
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "certificate_processor",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})

	if err != nil {
		panic(err)
	}

	c.SubscribeTopics([]string{config.Config.Kafka.CertifyTopic}, nil)

	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
			//valid := validate.AgainstSchema()
			//if !valid {
			//push to back up queue -- todo what do we do with these requests?
			//}
			//message := signCertificate(message)
			if err := processCertificateMessage(string(msg.Value)); err == nil {
				c.CommitMessage(msg)
			} else {
				log.Errorf("Error in processing the certificate %+v", err)
			}
		} else {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", err)
		}
	}

	c.Close()
}
