package services

import (
	"bytes"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/pkg/models"
	log "github.com/sirupsen/logrus"
	"text/template"
)

const preEnrollmentTemplateString = `
{{.Name}}, you have been registered to receive C-19 vaccine. Please proceed to the nearest vaccination center:
Location: 
Please show the Pre Enrollment Code: {{.Code}} to the center admin.
`

var preEnrollmentTemplate = template.Must(template.New("").Parse(preEnrollmentTemplateString))

const EnrollmentEntity = "Enrollment"

func markPreEnrolledUserCertified(preEnrollmentCode string, phone string, name string) {
	filter := map[string]interface{}{
		"code": map[string]interface{}{
			"eq": preEnrollmentCode,
		},
		"phone": map[string]interface{}{
			"eq": phone,
		},
		"name": map[string]interface{}{
			"eq": name,
		},
	}
	enrollmentResponse, err := kernelService.QueryRegistry(EnrollmentEntity, filter)
	if err == nil {
		enrollments := enrollmentResponse[EnrollmentEntity].([]interface{})
		if len(enrollments) > 0 {
			enrollment, ok := enrollments[0].(map[string]interface{})
			if ok {
				enrollment["certified"] = true
				response, err := kernelService.UpdateRegistry(EnrollmentEntity, enrollment)
				if err == nil {
					log.Debugf("Updated enrollment registry successfully %v", response)
				} else {
					log.Error("Failed updating enrollment registry", err)
				}
			}
		} else {
			log.Error("Enrollment not found for query %v", filter)
		}

	} else {
		log.Error("Failed querying enrollments registry", filter, err)
	}
}

func NotifyRecipient(enrollment models.Enrollment) error {
	//TODO : fetch facility and add facility info to message
	recipient := "sms:" + enrollment.Phone
	message := "Your pre enrollment for vaccination is " + enrollment.Code
	log.Infof("Sending SMS %s %s", recipient, message)
	buf := bytes.Buffer{}
	err := preEnrollmentTemplate.Execute(&buf, enrollment)
	if err == nil {
		subject := "DIVOC - Pre-Enrollment"
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
