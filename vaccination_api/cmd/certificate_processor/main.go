package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"time"
)

type VaccinationCertificateRequest struct {
	ID     string `json:"id"`
	Ver    string `json:"ver"`
	Ets    string `json:"ets"`
	Params struct {
		Did   string `json:"did"`
		Key   string `json:"key"`
		Msgid string `json:"msgid"`
	} `json:"params"`
	Request struct {
		VaccinationCertificate struct {
			CertificateID string                 `json:"certificateId"`
			Identity      string                 `json:"identity"`
			Contact       []string               `json:"contact"`
			Name          string                 `json:"name"`
			Certificate   map[string]interface{} `json:"certificate"`
		} `json:"VaccinationCertificate"`
	} `json:"request"`
}

type CertifyMessage struct {
	Facility struct {
		Address struct {
			AddressLine1 string `json:"addressLine1"`
			District     string `json:"district"`
			State        string `json:"state"`
		} `json:"address"`
		Name string `json:"name"`
	} `json:"facility"`
	PreEnrollmentCode string `json:"preEnrollmentCode"`
	Recipient         struct {
		Dob         string   `json:"dob"`
		Gender      string   `json:"gender"`
		Identity    string   `json:"identity"`
		Name        string   `json:"name"`
		Nationality string   `json:"nationality"`
		Contact     []string `json:"contact"`
	} `json:"recipient"`
	Vaccination struct {
		Batch          string    `json:"batch"`
		Date           time.Time `json:"date"`
		EffectiveStart string    `json:"effectiveStart"`
		EffectiveUntil string    `json:"effectiveUntil"`
		Manufacturer   string    `json:"manufacturer"`
		Name           string    `json:"name"`
	} `json:"vaccination"`
	Vaccinator struct {
		Name string `json:"name"`
	} `json:"vaccinator"`
}

func main() {
	config.Initialize()
	log.Infof("Starting certificate processor")
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": config.Config.Kafka.BootstrapServers,
		"group.id":          "certificate_processor",
		"auto.offset.reset": "earliest",
		"enable.auto.commit":"false",
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

			}
		} else {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}

	c.Close()
}

func processCertificateMessage(msg string) error {
	var certifyMessage CertifyMessage
	if err := json.Unmarshal([]byte(msg), &certifyMessage); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return errors.New("kafka message unmarshalling failed")
	}
	certificate := VaccinationCertificateRequest{
		ID:  "open-saber.registry.create",
		Ver: config.Config.Registry.ApiVersion,
		Ets: "",
		Params: struct {
			Did   string `json:"did"`
			Key   string `json:"key"`
			Msgid string `json:"msgid"`
		}{},
		Request: struct {
			VaccinationCertificate struct {
				CertificateID string                 `json:"certificateId"`
				Identity      string                 `json:"identity"`
				Contact       []string               `json:"contact"`
				Name          string                 `json:"name"`
				Certificate   map[string]interface{} `json:"certificate"`
			} `json:"VaccinationCertificate"`
		}{
			VaccinationCertificate: struct {
				CertificateID string                 `json:"certificateId"`
				Identity      string                 `json:"identity"`
				Contact       []string               `json:"contact"`
				Name          string                 `json:"name"`
				Certificate   map[string]interface{} `json:"certificate"`
			}{
				CertificateID: generateUniqueCertificateId(certifyMessage),
				Identity:      certifyMessage.Recipient.Identity,
				Contact:       certifyMessage.Recipient.Contact,
				Name:          certifyMessage.Recipient.Name,
				Certificate:   map[string]interface{}{},
			},
		},
	}
	if response, err := req.Post(config.Config.Registry.Url+"/"+config.Config.Registry.AddOperationId, req.BodyJSON(certificate)); err != nil {
		log.Errorf("Error storing vacciantion certificate %+v", err)
		return errors.New("error storing vacciantion certificate")
	} else {
		log.Infof("Create vaccination certificate response %+v", response.String())
		var registryResponse pkg.RegistryResponse
		if err := response.ToJSON(&registryResponse); err != nil {
			log.Errorf("Error in decoding json from registry after creating vaccination certificate")
			return errors.New("error in decoding json from registry after creating vaccination certificate")
		} else {
			if registryResponse.Params.Status != "SUCCESSFUL" {
				log.Errorf("Error while storing the certificate %+v for %+v", registryResponse, certifyMessage.Recipient.Identity)
				errors.New("error while storing the certificate")
			} else {
				log.Infof("Created vaccination certificate")
			}

		}
	}
	return nil
}

func generateUniqueCertificateId(message CertifyMessage) string {
	return "123123123" //todo: create random id based on set of rules
}
