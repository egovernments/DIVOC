package pkg

import (
	"encoding/json"
	"time"

	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/db"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/go-openapi/strfmt"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

var producer *kafka.Producer

var messages = make(chan string)
var events = make(chan []byte)

type Event struct {
	Date time.Time `json:"date"`
	Source string `json:"source"`
	TypeOfMessage string `json:"type"`
	ExtraInfo interface{}  `json:"extra"`
}

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
			msg := <- messages
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          []byte(msg),
			}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
		}
	}()

	go func() {
		topic := config.Config.Kafka.EventsTopic
		for {
			msg := <- events
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          msg,
			}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
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
}

func publishSimpleEvent(source string, event string) {
	publishEvent(Event{
		Date:          time.Now(),
		Source:        source,
		TypeOfMessage: "download",
	})
}

func publishEvent(event Event) {
	if messageJson, err := json.Marshal(event); err != nil {
		log.Errorf("Error in getting json of event %+v", event)
	} else {
		events <- messageJson
	}
}

func createCertificate(data *Scanner, certifyUploads *db.CertifyUploads) error {
	//recipientName,recipientMobileNumber,recipientDOB,recipientGender,recipientNationality,recipientIdentity,
	//vaccinationBatch,vaccinationDate,vaccinationEffectiveStart,vaccinationEffectiveEnd,vaccinationManufacturer,vaccinationName,
	//vaccinatorName,
	//facilityName,facilityAddressLine1,facilityAddressLine2,facilityDistict,facilityState,facilityPincode

	certifyUploads.TotalRecords = certifyUploads.TotalRecords + 1

	// mandatory fields check
	mobileNumber := data.Text("recipientMobileNumber")
	if mobileNumber == "" {
		certifyUploads.TotalErrorRows = certifyUploads.TotalErrorRows + 1
		return nil
	}
	recipientName := data.Text("recipientName")
	if recipientName == "" {
		certifyUploads.TotalErrorRows = certifyUploads.TotalErrorRows + 1
		return nil
	}

	contact := []string{"tel:" + mobileNumber}
	dob, terr := time.Parse("2006-01-02", data.Text("recipientDOB"))
	if terr != nil {
		dob2, terr := time.Parse("02-Jan-2006", data.Text("recipientDOB"))
		if terr != nil {
			log.Info("error while parsing DOB ", data.Text("recipientDOB"))
		} else {
			dob = dob2
		}
	}
	reciepient := &models.CertificationRequestRecipient{
		Name:        recipientName,
		Contact:     contact,
		Dob:         strfmt.Date(dob),
		Gender:      data.Text("recipientGender"),
		Nationality: data.Text("recipientNationality"),
		Identity:    data.Text("recipientIdentity"),
	}

	vaccinationDate, terr := time.Parse(time.RFC3339, data.Text("vaccinationDate"))
	if terr != nil {
		log.Info("error while parsing vaccinationDate ", data.Text("vaccinationDate"))
	}
	effectiveStart, terr := time.Parse("2006-01-02", data.Text("vaccinationEffectiveStart"))
	if terr != nil {
		log.Info("error while parsing effectiveStart ", data.Text("vaccinationEffectiveStart"))
	}
	effectiveUntil, terr := time.Parse("2006-01-02", data.Text("vaccinationEffectiveEnd"))
	if terr != nil {
		log.Info("error while parsing effectiveUntil ", data.Text("vaccinationEffectiveEnd"))
	}
	vaccination := &models.CertificationRequestVaccination{
		Batch:          data.Text("vaccinationBatch"),
		Date:           strfmt.DateTime(vaccinationDate),
		EffectiveStart: strfmt.Date(effectiveStart),
		EffectiveUntil: strfmt.Date(effectiveUntil),
		Manufacturer:   data.Text("vaccinationManufacturer"),
		Name:           data.Text("vaccinationName"),
	}

	vaccinator := &models.CertificationRequestVaccinator{
		Name: data.Text("vaccinatorName"),
	}

	addressline1 := data.Text("facilityAddressLine1")
	addressline2 := data.Text("facilityAddressLine2")
	district := data.Text("facilityDistict")
	state := data.Text("facilityState")
	pincode := data.int64("facilityPincode")
	facility := &models.CertificationRequestFacility{
		Name: data.Text("facilityName"),
		Address: &models.CertificationRequestFacilityAddress{
			AddressLine1: addressline1,
			AddressLine2: addressline2,
			District:     district,
			State:        state,
			Pincode:      pincode,
		},
	}

	certificate := models.CertificationRequest{
		Facility:    facility,
		Recipient:   reciepient,
		Vaccination: vaccination,
		Vaccinator:  vaccinator,
	}
	if jsonRequestString, err := json.Marshal(certificate); err == nil {
		log.Infof("Certificate request %+v", string(jsonRequestString))
		publishCertifyMessage(jsonRequestString)
	} else {
		return err
	}
	return nil
}
