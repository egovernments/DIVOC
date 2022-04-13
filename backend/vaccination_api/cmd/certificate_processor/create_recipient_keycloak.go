package main

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/divoc/api/pkg"
	"github.com/divoc/api/pkg/models"
	log "github.com/sirupsen/logrus"
)

func processCertificateMessage(msg string) (string, models.Status, error) {
	var certifyMessage CertifyMessage
	var preEnrollmentCode string
	if err := json.Unmarshal([]byte(msg), &certifyMessage); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return "", models.ERROR, errors.New("kafka message unmarshalling failed")
	}
	preEnrollmentCode = certifyMessage.PreEnrollmentCode
	log.Infof("Creating the user login for the certificate access %s", certifyMessage.Recipient.Contact)
	var status models.Status
	for _, contact := range certifyMessage.Recipient.Contact {
		if strings.HasPrefix(contact, mobilePhonePrefix) {
			var err error
			if status, err = pkg.CreateRecipientUserId(strings.TrimPrefix(contact, mobilePhonePrefix)); err != nil {
				log.Errorf("Error in setting up login for the recipient %s", contact)
				//kafka.pushMessage({"type":"createContact", "contact":contact}) //todo: can relay message via queue to create contact itself
			}
		}
	}
	return preEnrollmentCode, status, nil
}
