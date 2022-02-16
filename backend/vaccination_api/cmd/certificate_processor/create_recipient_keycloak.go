package main

import (
	"encoding/json"
	"errors"
	"github.com/divoc/api/pkg"
	log "github.com/sirupsen/logrus"
	"strings"
)

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
