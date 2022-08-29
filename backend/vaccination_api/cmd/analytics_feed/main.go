package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/models"
	"github.com/divoc/api/pkg/services"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"strconv"
	"sync"
	"time"

	"github.com/ClickHouse/clickhouse-go"
)

const tableNameEvents = "eventsv2"

type CertifyMessage struct {
	Facility struct {
		Address struct {
			AddressLine1 string `json:"addressLine1"`
			District     string `json:"district"`
			State        string `json:"state"`
			Pincode      string `json:"pincode"`
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
		Age         string   `json:"age"`
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
	services.InitializeKafka()
	log.Infof("Starting analytics collector")
	connect := initClickhouse()
	_, err := connect.Exec(`
		CREATE TABLE IF NOT EXISTS certificatesv1 (
  certificateId String,
  age UInt8,
  gender String,
  district String,
  batch String,
  manufacturer String,
  dt DateTime,
  vaccinationDate Date,
  effectiveStart Date,
  effectiveUntil Date,
  facilityName String,
  facilityCountryCode FixedString(2),
  facilityState String,
  facilityDistrict String,
  facilityPostalCode String,
  vaccinatorName String
) engine = MergeTree() order by dt
	`)
	if err != nil {
		log.Fatal(err)
	}
	_, err = connect.Exec(`
		CREATE TABLE IF NOT EXISTS certifiedv1 (
  certificateId String,
  preEnrollmentCode String,
  dt DateTime,
  
  age UInt8,
  gender String,
  district String,
  state String,
  
  batch String,
  vaccine String,
  manufacturer String,
  vaccinationDate DateTime,
  effectiveStart Date,
  effectiveUntil Date,
  dose UInt8,
  totalDoses UInt8,
  
  facilityName String,
  facilityCountryCode FixedString(2),
  facilityState String,
  facilityDistrict String,
  facilityPostalCode String,
  vaccinatorName String,
  
  updatedCertificate UInt8,
  previousCertificateId String
  
) engine = MergeTree() order by dt
	`)
	if err != nil {
		log.Fatal(err)
	}
	_, err = connect.Exec(fmt.Sprintf(`
CREATE TABLE IF NOT EXISTS %s (
dt DateTime,
source String,
type String,
info String
) engine = MergeTree() order by dt
`, tableNameEvents))
	if err != nil {
		log.Fatal(err)
	}
	_, err = connect.Exec(`
CREATE TABLE IF NOT EXISTS reportedSideEffectsV1 (
certificateId String,
symptom String,
response String,
dt Date
) engine = MergeTree() order by dt
`)
	if err != nil {
		log.Fatal(err)
	}
	_, err = connect.Exec(`
CREATE TABLE IF NOT EXISTS procStatusV1 (
preEnrollmentCode String,
status String,
procType String,
dt Date
) engine = MergeTree() order by dt
`)
	if err != nil {
		log.Fatal(err)
	}
	_,err = connect.Exec(`
	CREATE TABLE IF NOT EXISTS vcTransactionEventV1 (
		transactionId String,
		certificateId String,
		status String,
		dt Date
	) engine = MergeTree() order by dt
	`)
	if err !=nil {
		log.Fatal(err)
	}
	_, err = connect.Exec(`
CREATE TABLE IF NOT EXISTS logAPIV1 (
transactionId String,
url String,
requestHeaders String,
requestBody String,
requestMethod String,
statusCode UInt8,
dt DateTime
) engine = MergeTree() order by dt
`)
	if err != nil {
		log.Fatal(err)
	}

	//	_, err = connect.Exec(`
	//ALTER TABLE eventsv1 ADD COLUMN IF NOT EXISTS info String;
	//`)
	//	if err != nil {
	//		log.Fatal(err)
	//	}
	var wg sync.WaitGroup
	wg.Add(2)
	go startCertificateEventConsumer(err, connect, saveCertificateEvent, config.Config.Kafka.CertifyTopic, "earliest")
	go startCertificateEventConsumer(err, connect, saveCertifiedEventV1, config.Config.Kafka.CertifiedTopic, "latest")
	go startCertificateEventConsumer(err, connect, saveAnalyticsEvent, config.Config.Kafka.EventsTopic, "earliest")
	go startCertificateEventConsumer(err, connect, saveReportedSideEffects, config.Config.Kafka.ReportedSideEffectsTopic, "earliest")
	go startCertificateEventConsumer(err, connect, saveProcStatusEvent, config.Config.Kafka.ProcStatusTopic, "earliest")
	go startCertificateEventConsumer(err, connect, saveVcTransactionEvent, config.Config.Kafka.VcTransactionTopic,"earliest")

	wg.Wait()
}

func initClickhouse() *sql.DB {
	dbConnectionInfo := config.Config.Clickhouse.Dsn
	log.Infof("Using the db %s", dbConnectionInfo)
	connect, err := sql.Open("clickhouse", dbConnectionInfo)
	if err != nil {
		log.Fatal(err)
	}
	if err := connect.Ping(); err != nil {
		log.Errorf("Error in pinging the server %s", err)
		if exception, ok := err.(*clickhouse.Exception); ok {
			log.Errorf("[%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)

		} else {
			log.Error(err)
		}
		panic("Error in pinging the database")
	}
	log.Infof("%+v", connect)
	return connect
}

type MessageCallback func(*sql.DB, string) (string,string, models.Status, error)

func startCertificateEventConsumer(err error, connect *sql.DB, callback MessageCallback, topic string, resetOption string) {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "analytics_feed",
		"auto.offset.reset":  resetOption,
		"enable.auto.commit": "false",
	})

	if err != nil {
		panic(err)
	}

	c.SubscribeTopics([]string{topic}, nil)

	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
			if connect == nil {
				connect = initClickhouse()
				if connect == nil {
					log.Fatal("Unable to get clickhouse connection")
				}
			}
			procType,preEnrollmentCode,status,err := callback(connect, string(msg.Value)); 
			if err == nil {
				c.CommitMessage(msg)
			} else {
				log.Errorf("Error in processing the certificate %+v", err)
			}
			if(procType != "procStatus_event"){
				services.PublishProcStatus(models.ProcStatus{
					Date:              time.Now(),
					PreEnrollmentCode: preEnrollmentCode,
					ProcType:          procType,
					Status:            string(status),
				})
			}
		} else {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v \n", err)
		}
	}

	c.Close()
}

func saveCertifiedEventV1(connect *sql.DB, msg string) (string,string, models.Status, error) {
	var certifiedMessage models.CertifiedMessage
	if err := json.Unmarshal([]byte(msg), &certifiedMessage); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return "certified_event_v1",certifiedMessage.PreEnrollmentCode, models.ERROR, errors.New("kafka message unmarshalling failed")
	}
	if certifiedMessage.Certificate == "" {
		log.Infof("Ignoring invalid message %+v", msg)
		return "certified_event_v1",certifiedMessage.PreEnrollmentCode, models.SUCCESS, nil
	}

	var certificate models.Certificate
	if err := json.Unmarshal([]byte(certifiedMessage.Certificate), &certificate); err != nil {
		log.Errorf("certificate string unmarshalling error %+v", err)
		return "certified_event_v1",certifiedMessage.PreEnrollmentCode, models.ERROR, errors.New("certificate string unmarshalling failed")
	}

	updatedCertificate := 0
	if certifiedMessage.Meta.PreviousCertificateID != "" {
		updatedCertificate = 1
	}

	// push to click house - todo: batch it
	var (
		tx, _     = connect.Begin()
		stmt, err = tx.Prepare(`INSERT INTO certifiedv1 
	(  certificateId,
  preEnrollmentCode,
  dt,

  age,
  gender,
  district,
  state,
  
  batch,
  vaccine,
  manufacturer,
  vaccinationDate,
  effectiveStart,
  effectiveUntil,
  dose,
  totalDoses,
  
  facilityName,
  facilityCountryCode,
  facilityState,
  facilityDistrict,
  facilityPostalCode,
  vaccinatorName,
  
  updatedCertificate,
  previousCertificateId) 
	VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
	)

	if err != nil {
		log.Infof("Error in preparing stmt %+v", err)
	}
	//todo collect n messages and batch write to analytics db.
	credentialSubject := certificate.CredentialSubject
	age, _ := strconv.Atoi(credentialSubject.Age)
	evidence := certificate.Evidence[0]
	if _, err := stmt.Exec(
		certifiedMessage.CertificateId,
		certifiedMessage.PreEnrollmentCode,
		time.Now(),

		age,
		credentialSubject.Gender,
		credentialSubject.Address.District,
		credentialSubject.Address.AddressRegion,

		evidence.Batch,
		evidence.Vaccine,
		evidence.Manufacturer,
		evidence.Date,
		evidence.EffectiveStart,
		evidence.EffectiveUntil,
		evidence.Dose,
		evidence.TotalDoses,

		evidence.Facility.Name,
		evidence.Facility.Address.AddressCountry,
		evidence.Facility.Address.AddressRegion,
		evidence.Facility.Address.District,
		certificate.GetFacilityPostalCode(),
		evidence.Verifier.Name,

		updatedCertificate,
		certifiedMessage.Meta.PreviousCertificateID,
	); err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return "certified_event_v1",certifiedMessage.PreEnrollmentCode, models.SUCCESS, nil
}

func saveAnalyticsEvent(connect *sql.DB, msg string) (string,string, models.Status, error) {
	event := models.Event{}
	if err := json.Unmarshal([]byte(msg), &event); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return "analytics_event","", models.ERROR, errors.New("kafka message unmarshalling failed")
	}
	// push to click house - todo: batch it
	var (
		tx, _     = connect.Begin()
		stmt, err = tx.Prepare(fmt.Sprintf(`INSERT INTO %s 
	(  dt,
	source,
	type,
	info
	 ) 
	VALUES (?,?,?,?)`, tableNameEvents))
	)
	if err != nil {
		log.Infof("Error in preparing stmt %+v", err)
	}
	info, ok := event.ExtraInfo.(string)
	if !ok {
		info = ""
	}
	if _, err := stmt.Exec(
		event.Date,
		event.Source,
		event.TypeOfMessage,
		info,
	); err != nil {
		log.Errorf("Error in saving %+v", err)
	}

	defer stmt.Close()
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return "analytics_event","", models.SUCCESS, nil
}

func saveProcStatusEvent(connect *sql.DB, msg string) (string,string, models.Status, error) {
	log.Infof("Saving proc status event")
	event := models.ProcStatus{}
	if err := json.Unmarshal([]byte(msg), &event); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return "procStatus_event",event.PreEnrollmentCode, models.ERROR, errors.New("kafka message unmarshalling failed")
	}
	// push to click house - todo: batch it
	var (
		tx, _     = connect.Begin()
		stmt, err = tx.Prepare(`INSERT INTO procStatusV1 
	(  preEnrollmentCode,
	status,
	procType,dt ) 
	VALUES (?,?,?,?)`)
	)
	if err != nil {
		log.Infof("Error in preparing stmt %+v", err)
	}
	if _, err := stmt.Exec(
		event.PreEnrollmentCode,
		event.Status,
		event.ProcType,
		event.Date,
	); err != nil {
		log.Errorf("Error in saving %+v", err)
	}

	defer stmt.Close()
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return "procStatus_event",event.PreEnrollmentCode, models.SUCCESS, nil
}

func saveReportedSideEffects(connect *sql.DB, msg string) (string,string, models.Status, error) {
	event := models.ReportedSideEffectsEvent{}
	if err := json.Unmarshal([]byte(msg), &event); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return "reported_side_effects","", models.ERROR, errors.New("kafka message unmarshalling failed")
	}
	// push to click house - todo: batch it
	var (
		tx, _     = connect.Begin()
		stmt, err = tx.Prepare(`INSERT INTO reportedSideEffectsV1 
	(  certificateId,
	symptom,
	response,dt ) 
	VALUES (?,?,?,?)`)
	)
	if err != nil {
		log.Infof("Error in preparing stmt %+v", err)
	}
	if _, err := stmt.Exec(
		event.RecipientCertificateId,
		event.Symptom,
		event.Response,
		event.Date,
	); err != nil {
		log.Errorf("Error in saving %+v", err)
	}

	defer stmt.Close()
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return "reported_side_effects","", models.SUCCESS, nil
}

func saveCertificateEvent(connect *sql.DB, msg string) (string,string, models.Status, error) {
	var certifyMessage CertifyMessage
	if err := json.Unmarshal([]byte(msg), &certifyMessage); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return "certificate_event",certifyMessage.PreEnrollmentCode, models.ERROR, errors.New("kafka message unmarshalling failed")
	}
	// push to click house - todo: batch it
	var (
		tx, _     = connect.Begin()
		stmt, err = tx.Prepare(`INSERT INTO certificatesv1 
	(  certificateId,
	age,
	gender,
	district,
	batch,
	manufacturer,
	dt,
	vaccinationDate,
	effectiveStart,
	effectiveUntil,
	facilityName,
	facilityCountryCode,
	facilityState,
	facilityDistrict,
	facilityPostalCode,
	vaccinatorName) 
	VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
	)

	if err != nil {
		log.Infof("Error in preparing stmt %+v", err)
	}
	//todo collect n messages and batch write to analytics db.
	age, _ := strconv.Atoi(certifyMessage.Recipient.Age)
	if age == 0 {
		if dobTime, err := time.Parse("2006-01-02", certifyMessage.Recipient.Dob); err == nil {
			if dobTime.Year() > 1900 {
				age = time.Now().Year() - dobTime.Year()
			}
		}
	}
	if _, err := stmt.Exec(
		"",
		age,
		certifyMessage.Recipient.Gender,
		certifyMessage.Facility.Address.District,
		certifyMessage.Vaccination.Batch,
		certifyMessage.Vaccination.Manufacturer,
		time.Now(),
		certifyMessage.Vaccination.Date,
		certifyMessage.Vaccination.EffectiveStart,
		certifyMessage.Vaccination.EffectiveUntil,
		certifyMessage.Facility.Name,
		"IN",
		certifyMessage.Facility.Address.State,
		certifyMessage.Facility.Address.District,
		certifyMessage.Facility.Address.Pincode,
		certifyMessage.Vaccinator.Name,
	); err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}

	return "certificate_event",certifyMessage.PreEnrollmentCode, models.SUCCESS, nil
}

func saveVcTransactionEvent(connect *sql.DB, msg string) (string,string, models.Status, error){
	log.Info("Saving transaction event")
	response := models.TransactionResponse{}
	if err := json.Unmarshal([]byte(msg), &response); err != nil {
		log.Errorf("Kafka message unmarshalling error %v",err);
		return "transaction_event", "", models.ERROR, errors.New("kafka message unmarshalling failed")
	}
	var (
		tx,_ = connect.Begin()
		stmt, err = tx.Prepare(`INSERT INTO vcTransactionEventV1 (
			transactionId ,
			certificateId ,
			status ,
			dt
		) VALUES (?,?,?,?)`)
	)
	if err != nil {
		log.Infof("Error in preparing stmt %+v", err)
	}
	if _, err := stmt.Exec(
		response.TransactionId,
		response.CertificateId,
		response.Status,
		time.Now(),
	); err != nil {
		log.Errorf("Error in saving %+v", err)
	}
	defer stmt.Close()
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return "transaction_event", "", models.SUCCESS,nil
}
