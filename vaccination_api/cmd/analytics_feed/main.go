package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/divoc/api/config"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"strconv"
	"time"

	"github.com/ClickHouse/clickhouse-go"
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
	log.Infof("Starting analytics collector")
	connect, err := sql.Open("clickhouse", "tcp://127.0.0.1:9000?debug=true")
	if err != nil {
		log.Fatal(err)
	}
	if err := connect.Ping(); err != nil {
		if exception, ok := err.(*clickhouse.Exception); ok {
			fmt.Printf("[%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
		} else {
			fmt.Println(err)
		}
		return
	}
	_, err = connect.Exec(`
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
  facilityPostalCode String
) engine = MergeTree() order by dt
	`)
	if err != nil {
		log.Fatal(err)
	}

	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  config.Config.Kafka.BootstrapServers,
		"group.id":           "analytics_feed",
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
			if err := processCertificateMessage(connect, string(msg.Value)); err == nil {
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

func processCertificateMessage(connect *sql.DB, msg string) error {
	var certifyMessage CertifyMessage
	if err := json.Unmarshal([]byte(msg), &certifyMessage); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return errors.New("kafka message unmarshalling failed")
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
	facilityPostalCode ) 
	VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
	)

	if err != nil {
		log.Infof("Error in preparing stmt %+v", err)
	}
	//todo collect n messages and batch write to analytics db.
	age, _ := strconv.Atoi(certifyMessage.Recipient.Age)
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
		certifyMessage.Facility.Address.Pincode,
	); err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}

	return nil
}
