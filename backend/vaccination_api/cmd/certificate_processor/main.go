package main

import (
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg"
	log "github.com/sirupsen/logrus"
)

const mobilePhonePrefix = "tel:"

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
			CertificateID string   `json:"certificateId"`
			Identity      string   `json:"identity"`
			Contact       []string `json:"contact"`
			Name          string   `json:"name"`
			Certificate   string   `json:"certificate"`
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

const CommunicationModeRabbitmq = "rabbitmq"
const CommunicationModeKafka = "kafka"
const CommunicationModeRestapi = "restapi"

func main() {
	config.Initialize()
	switch config.Config.CommunicationMode.Mode {
	case CommunicationModeRabbitmq:
		initAndConsumeFromRabbitmq()
		break
	case CommunicationModeKafka:
		initAndConsumeFromKafka()
		break
	case CommunicationModeRestapi:
		log.Errorf("Rest-API communication mode isn not supported yet")
		break
	default:
		log.Errorf("Invalid CommunicationMode %s", config.Config.CommunicationMode)
		break
	}
}

func processCertificateMessage(msg string) error {
	var certifyMessage CertifyMessage
	if err := json.Unmarshal([]byte(msg), &certifyMessage); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return errors.New("kafka message unmarshalling failed")
	}

	log.Infof("Creating the user login for the certificate access %s", certifyMessage.Recipient.Contact)
	for _, contact := range certifyMessage.Recipient.Contact {
		if strings.HasPrefix(contact, mobilePhonePrefix) {
			if err := pkg.CreateRecipientUserId(strings.TrimPrefix(contact, mobilePhonePrefix)); err != nil {
				log.Errorf("Error in setting up login for the recipient %s", contact)
				//kafka.pushMessage({"type":"createContact", "contact":contact}) //todo: can relay message via queue to create contact itself
			}
		}
	}
	return nil
}
