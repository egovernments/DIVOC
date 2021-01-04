package pkg

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/db"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/go-openapi/strfmt"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

var producer *kafka.Producer

var messages = make(chan Message)
var events = make(chan []byte)

type Event struct {
	Date          time.Time   `json:"date"`
	Source        string      `json:"source"`
	TypeOfMessage string      `json:"type"`
	ExtraInfo     interface{} `json:"extra"`
}

type Message struct {
	UploadId []byte
	rowId    []byte
	payload  string
}

func InitializeKafka() {
	servers := config.Config.Kafka.BootstrapServers
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": servers})
	if err != nil {
		panic(err)
	}
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "certify_ack",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
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
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          []byte(msg.payload),
				Headers: []kafka.Header{
					{Key: "uploadId", Value: msg.UploadId},
					{Key: "rowId", Value: msg.rowId},
				},
			}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
		}
	}()

	go func() {
		topic := config.Config.Kafka.EventsTopic
		for {
			msg := <-events
			if err := producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          msg,
			}, nil); err != nil {
				log.Infof("Error while publishing message to %s topic %+v", topic, msg)
			}
		}
	}()

	go func() {
		consumer.SubscribeTopics([]string{"certify_ack"}, nil)

		for  {
			msg, err := consumer.ReadMessage(-1)
			if err == nil {
				var message map[string]string
				json.Unmarshal(msg.Value, &message)
				// check the status
				// update that status to certifyErrorRows db
				log.Infof("Message on %s: %v \n", msg.TopicPartition, message)
				rowId, e := strconv.ParseUint(message["rowId"], 10, 64)
				if e != nil {
					log.Errorf("Error occurred wile parsing rowId as int - %s", message["rowId"])
				} else {
					if message["status"] == "SUCCESS" {
						// if certificate created successfully
						// delete that row => as we no longer require that row
						db.DeleteCertifyUploadError(uint(rowId))
					} else if message["status"] == "FAILED" {
						// if certificate creation fails
						// update the status of the row to Failed
						db.UpdateCertifyUploadErrorStatus(uint(rowId), message["status"])
					}
					consumer.CommitMessage(msg)
				}
			} else {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
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

// uploadId, rowId to be specified in case if its file upload
func publishCertifyMessage(message []byte, uploadId []byte, rowId []byte) {
	messages <- Message{
		UploadId: uploadId,
		rowId:    rowId,
		payload:  string(message),
	}
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

func createCertificate(data *Scanner, uploadDetails *db.CertifyUploads, rowId int) error {

	uploadDetails.TotalRecords = uploadDetails.TotalRecords + 1

	// convert to certificate csv fields
	certifyData := convertToCertifyUploadFields(data)

	var certifyUploadErrors db.CertifyUploadErrors
	certifyUploadErrors.CertifyUploadID = uploadDetails.ID
	certifyUploadErrors.CertifyUploadFields = *certifyData
	certifyUploadErrors.Status = db.CERTIFY_UPLOAD_PROCESSING_STATUS
	db.CreateCertifyUploadError(&certifyUploadErrors)
	// validating data errors
	errorMsgs := validateErrors(certifyData)
	if len(errorMsgs) > 0 {
		certifyUploadErrors.Errors = strings.Join(errorMsgs, ",")
		certifyUploadErrors.Status = db.CERTIFY_UPLOAD_FAILED_STATUS
		e := db.UpdateCertifyUploadError(&certifyUploadErrors)
		return e
	}

	contact := []string{"tel:" + certifyData.RecipientMobileNumber}
	dob, terr := time.Parse("2006-01-02", certifyData.RecipientDOB)
	if terr != nil {
		dob2, terr := time.Parse("02-Jan-2006", certifyData.RecipientDOB)
		if terr != nil {
			log.Info("error while parsing DOB ", certifyData.RecipientDOB)
		} else {
			dob = dob2
		}
	}
	reciepient := &models.CertificationRequestRecipient{
		Name:        certifyData.RecipientName,
		Contact:     contact,
		Dob:         strfmt.Date(dob),
		Gender:      certifyData.RecipientGender,
		Nationality: certifyData.RecipientNationality,
		Identity:    certifyData.RecipientIdentity,
	}

	vaccinationDate, terr := time.Parse(time.RFC3339, certifyData.VaccinationDate)
	if terr != nil {
		log.Info("error while parsing vaccinationDate ", certifyData.VaccinationDate)
	}
	effectiveStart, terr := time.Parse("2006-01-02", certifyData.VaccinationEffectiveStart)
	if terr != nil {
		log.Info("error while parsing effectiveStart ", certifyData.VaccinationEffectiveStart)
	}
	effectiveUntil, terr := time.Parse("2006-01-02", certifyData.VaccinationEffectiveEnd)
	if terr != nil {
		log.Info("error while parsing effectiveUntil ", certifyData.VaccinationEffectiveEnd)
	}
	vaccination := &models.CertificationRequestVaccination{
		Batch:          certifyData.VaccinationBatch,
		Date:           strfmt.DateTime(vaccinationDate),
		EffectiveStart: strfmt.Date(effectiveStart),
		EffectiveUntil: strfmt.Date(effectiveUntil),
		Manufacturer:   certifyData.VaccinationManufacturer,
		Name:           certifyData.VaccinationName,
	}

	vaccinator := &models.CertificationRequestVaccinator{
		Name: certifyData.VaccinatorName,
	}

	addressline1 := certifyData.FacilityAddressLine1
	addressline2 := certifyData.FacilityAddressLine2
	district := certifyData.FacilityDistrict
	state := certifyData.FacilityState
	pincode := certifyData.FacilityPincode
	facility := &models.CertificationRequestFacility{
		Name: certifyData.FacilityName,
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
		uploadId, _ := json.Marshal(uploadDetails.ID)
		jrowId, _ := json.Marshal(certifyUploadErrors.ID)
		publishCertifyMessage(jsonRequestString, uploadId, jrowId)
	} else {
		return err
	}
	return nil
}

func validateErrors(data *db.CertifyUploadFields) []string {
	var errorMsgs []string
	if data.RecipientMobileNumber == "" {
		errorMsgs = append(errorMsgs, "RecipientMobileNumber is missing")
	}
	if data.RecipientName == "" {
		errorMsgs = append(errorMsgs, "RecipientName is missing")
	}
	return errorMsgs
}

func convertToCertifyUploadFields(data *Scanner) *db.CertifyUploadFields {
	return &db.CertifyUploadFields{
		RecipientName:             data.Text("recipientName"),
		RecipientMobileNumber:     data.Text("recipientMobileNumber"),
		RecipientDOB:              data.Text("recipientDOB"),
		RecipientGender:           data.Text("recipientGender"),
		RecipientNationality:      data.Text("recipientNationality"),
		RecipientIdentity:         data.Text("recipientIdentity"),
		VaccinationBatch:          data.Text("vaccinationBatch"),
		VaccinationDate:           data.Text("vaccinationDate"),
		VaccinationEffectiveStart: data.Text("vaccinationEffectiveStart"),
		VaccinationEffectiveEnd:   data.Text("vaccinationEffectiveEnd"),
		VaccinationManufacturer:   data.Text("vaccinationManufacturer"),
		VaccinationName:           data.Text("vaccinationName"),
		VaccinatorName:            data.Text("vaccinatorName"),
		FacilityName:              data.Text("facilityName"),
		FacilityAddressLine1:      data.Text("facilityAddressLine1"),
		FacilityAddressLine2:      data.Text("facilityAddressLine2"),
		FacilityDistrict:          data.Text("facilityDistrict"),
		FacilityState:             data.Text("facilityState"),
		FacilityPincode:           data.int64("facilityPincode"),
	}
}
