package services

import (
	"bytes"
	"text/template"

	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
)

const PreEnrollmentRegistered = "preEnrollmentRegistered"

func NotifyRecipient(enrollment models.Enrollment) error {
	preEnrollmentTemplateString := kernelService.AppConfigs.NotificationTemplates[PreEnrollmentRegistered].Message
	subject := kernelService.AppConfigs.NotificationTemplates[PreEnrollmentRegistered].Subject

	var preEnrollmentTemplate = template.Must(template.New("").Parse(preEnrollmentTemplateString))

	recipient := "sms:" + enrollment.Phone
	message := "Your pre enrollment for vaccination is " + enrollment.Code
	log.Infof("Sending SMS %s %s", recipient, message)
	buf := bytes.Buffer{}
	err := preEnrollmentTemplate.Execute(&buf, enrollment)
	if err == nil {
		if len(enrollment.Phone) > 0 {
			PublishNotificationMessage("tel:"+enrollment.Phone, subject, buf.String())
		}
		if len(enrollment.Email) > 0 {
			PublishNotificationMessage("mailto:"+enrollment.Email, subject, buf.String())
		}
	} else {
		return err
	}
	return nil
}
