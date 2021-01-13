package services

import (
	"github.com/divoc/notification-service/config"
	log "github.com/sirupsen/logrus"
	"net/smtp"
)

func SendEmail(recipientEmail string, mailSubject string, mailBody string) error {
	if config.Config.EmailSMTP.Enable {
		from := config.Config.EmailSMTP.FromAddress
		pass := config.Config.EmailSMTP.Password

		msg := "From: " + from + "\n" +
			"To: " + recipientEmail + "\n" +
			"Subject: " + mailSubject + "\n\n" +
			mailBody

		err := smtp.SendMail("smtp.gmail.com:587",
			smtp.PlainAuth("", from, pass, "smtp.gmail.com"),
			from, []string{recipientEmail}, []byte(msg))

		if err != nil {
			log.Errorf("smtp error: %s", err)
			return err
		}
		return nil
	}
	log.Infof("EMAIL notifier disabled")
	return nil
}
