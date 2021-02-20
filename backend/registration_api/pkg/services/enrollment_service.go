package services

import (
	"bytes"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"text/template"
)

func CreateEnrollment(enrollment models.Enrollment, currentRetryCount int) error {
	enrollment.Code = utils.GenerateEnrollmentCode(enrollment.Phone)
	err := kernelService.CreateNewRegistry(enrollment, "Enrollment")
	// If the generated Code is not unique, try again
	// code + programId should be unique
	if err != nil && currentRetryCount <= config.Config.EnrollmentCreation.MaxRetryCount {
		return CreateEnrollment(enrollment, currentRetryCount+1)
	}
	return err
}

func NotifyRecipient(enrollment models.Enrollment) error {
	EnrollmentRegistered := "enrollmentRegistered"
	enrollmentTemplateString := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Subject

	var enrollmentTemplate = template.Must(template.New("").Parse(enrollmentTemplateString))

	recipient := "sms:" + enrollment.Phone
	message := "Your pre enrollment for vaccination is " + enrollment.Code
	log.Infof("Sending SMS %s %s", recipient, message)
	buf := bytes.Buffer{}
	err := enrollmentTemplate.Execute(&buf, enrollment)
	if err == nil {
		if len(enrollment.Phone) > 0 {
			PublishNotificationMessage("tel:"+enrollment.Phone, subject, buf.String())
		}
		if len(enrollment.Email) > 0 {
			PublishNotificationMessage("mailto:"+enrollment.Email, subject, buf.String())
		}
	} else {
		log.Errorf("Error occurred while parsing the message (%v)", err)
		return err
	}
	return nil
}

func NotifyAppointmentBooked(enrollment models.Enrollment) error {
	AppointmentBooked := "appointmentBooked"
	appointmentBookedTemplateString := kernelService.FlagrConfigs.NotificationTemplates[AppointmentBooked].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[AppointmentBooked].Subject

	var appointmentBookedTemplate = template.Must(template.New("").Parse(appointmentBookedTemplateString))

	recipient := "sms:" + enrollment.Phone
	log.Infof("Sending SMS %s %s", recipient, enrollment)
	buf := bytes.Buffer{}
	err := appointmentBookedTemplate.Execute(&buf, enrollment)
	if err == nil {
		if len(enrollment.Phone) > 0 {
			PublishNotificationMessage("tel:"+enrollment.Email, subject, buf.String())
		}
		if len(enrollment.Email) > 0 {
			PublishNotificationMessage("mailto:"+enrollment.Email, subject, buf.String())
		}
	} else {
		log.Errorf("Error occurred while parsing the message (%v)", err)
		return err
	}
	return nil
}