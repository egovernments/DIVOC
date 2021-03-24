package services

import (
	"bytes"
	"encoding/json"
	"text/template"

	errors2 "github.com/pkg/errors"

	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	models2 "github.com/divoc/registration-api/pkg/models"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/models"
	"github.com/go-openapi/errors"
	log "github.com/sirupsen/logrus"
)

func CreateEnrollment(enrollmentPayload *EnrollmentPayload, position int) (string, error) {

	maxEnrollmentCreationAllowed := 0
	if enrollmentPayload.EnrollmentType == models.EnrollmentEnrollmentTypeWALKIN {
		maxEnrollmentCreationAllowed = config.Config.EnrollmentCreation.MaxWalkEnrollmentCreationAllowed
	} else {
		maxEnrollmentCreationAllowed = config.Config.EnrollmentCreation.MaxEnrollmentCreationAllowed
	}

	if position > maxEnrollmentCreationAllowed {
		failedErrorMessage := "Maximum enrollment creation limit is reached"
		log.Info(failedErrorMessage)
		return "", errors.New(400, failedErrorMessage)
	}

	enrollment := enrollmentPayload.Enrollment
	enrollment.Code = utils.GenerateEnrollmentCode(enrollment.Phone, position)
	exists, err := KeyExists(enrollment.Code)
	if err != nil {
		return "", err
	}
	if exists == 0 {
		if enrollmentPayload.EnrollmentType == models.EnrollmentEnrollmentTypeWALKIN {
			enrollmentPayload.Enrollment = enrollment
			return CreateWalkInEnrollment(enrollmentPayload)
		}
		registryResponse, err := kernelService.CreateNewRegistry(enrollment, "Enrollment")
		if err != nil {
			return "", err
		}
		result := registryResponse.Result["Enrollment"].(map[string]interface{})["osid"]
		return result.(string), nil
	}
	return CreateEnrollment(enrollmentPayload, position+1)
}

func CreateWalkInEnrollment(enrollmentPayload *EnrollmentPayload) (string, error) {
	marshal, err := json.Marshal(&enrollmentPayload.Enrollment)
	enrollment := map[string]interface{}{
		"enrollmentScopeId": enrollmentPayload.EnrollmentScopeId,
		"certified":         true,
		"programId":         enrollmentPayload.Appointments[0].ProgramID,
	}
	err = json.Unmarshal(marshal, &enrollment)

	registryResponse, err := kernelService.CreateNewRegistry(enrollment, "Enrollment")
	if err != nil {
		return "", err
	}
	result := registryResponse.Result["Enrollment"].(map[string]interface{})["osid"]
	return result.(string), nil
}

func EnrichFacilityDetails(enrollments []map[string]interface{}) {
	for _, enrollment := range enrollments {
		if enrollment["appointments"] == nil {
			continue
		}
		appointments := enrollment["appointments"].([]interface{})

		// No appointment means no need to show the facility details
		for _, appointment := range appointments {
			if facilityCode, ok := appointment.(map[string]interface{})["enrollmentScopeId"].(string); ok && facilityCode != "" && len(facilityCode) > 0 {
				minifiedFacilityDetails := GetMinifiedFacilityDetails(facilityCode)
				appointment.(map[string]interface{})["facilityDetails"] = minifiedFacilityDetails
			}
		}
	}
}

func NotifyRecipient(enrollment *models.Enrollment) error {
	EnrollmentRegistered := "enrollmentRegistered"
	enrollmentTemplateString := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Subject

	var enrollmentTemplate = template.Must(template.New("").Parse(enrollmentTemplateString))

	recipient := "sms:" + enrollment.Phone
	message := "Your enrollment code for vaccination is " + enrollment.Code
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

func NotifyAppointmentBooked(appointmentNotification models2.AppointmentNotification) error {
	appointmentBooked := "appointmentBooked"
	appointmentBookedTemplateString := kernelService.FlagrConfigs.NotificationTemplates[appointmentBooked].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[appointmentBooked].Subject

	var appointmentBookedTemplate = template.Must(template.New("").Parse(appointmentBookedTemplateString))

	recipient := "sms:" + appointmentNotification.RecipientPhone
	log.Infof("Sending SMS %s %s", recipient, appointmentNotification)
	buf := bytes.Buffer{}
	err := appointmentBookedTemplate.Execute(&buf, appointmentNotification)
	if err == nil {
		if len(appointmentNotification.RecipientPhone) > 0 {
			PublishNotificationMessage("tel:"+appointmentNotification.RecipientPhone, subject, buf.String())
		}
		if len(appointmentNotification.RecipientEmail) > 0 {
			PublishNotificationMessage("mailto:"+appointmentNotification.RecipientEmail, subject, buf.String())
		}
	} else {
		log.Errorf("Error occurred while parsing the message (%v)", err)
		return err
	}
	return nil
}

func NotifyAppointmentCancelled(appointmentNotification models2.AppointmentNotification) error {
	appointmentCancelled := "appointmentCancelled"
	appointmentBookedTemplateString := kernelService.FlagrConfigs.NotificationTemplates[appointmentCancelled].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[appointmentCancelled].Subject

	var appointmentBookedTemplate = template.Must(template.New("").Parse(appointmentBookedTemplateString))

	recipient := "sms:" + appointmentNotification.RecipientPhone
	log.Infof("Sending SMS %s %s", recipient, appointmentNotification)
	buf := bytes.Buffer{}
	err := appointmentBookedTemplate.Execute(&buf, appointmentNotification)
	if err == nil {
		if len(appointmentNotification.RecipientPhone) > 0 {
			PublishNotificationMessage("tel:"+appointmentNotification.RecipientPhone, subject, buf.String())
		}
		if len(appointmentNotification.RecipientEmail) > 0 {
			PublishNotificationMessage("mailto:"+appointmentNotification.RecipientEmail, subject, buf.String())
		}
	} else {
		log.Errorf("Error occurred while parsing the message (%v)", err)
		return err
	}
	return nil
}

func NotifyDeletedRecipient(enrollmentCode string, enrollment map[string]string) error {
	EnrollmentRegistered := "enrollmentDeleted"
	enrollmentTemplateString := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Subject

	var enrollmentTemplate = template.Must(template.New("").Parse(enrollmentTemplateString))
	enrollment["enrollmentCode"] = enrollmentCode
	phone := enrollment["phone"]
	buf := bytes.Buffer{}
	err := enrollmentTemplate.Execute(&buf, enrollment)
	if err == nil {
		if len(phone) > 0 {
			PublishNotificationMessage("tel:"+phone, subject, buf.String())
		}
	} else {
		log.Errorf("Error occurred while parsing the message (%v)", err)
		return err
	}
	return nil
}

func ValidateEnrollment(enrollmentPayload EnrollmentPayload) error {
	enrollmentArr, err := FetchEnrollments(enrollmentPayload.Phone)
	if err != nil {
		return err
	}
	var enrollments []models.Enrollment
	if err := json.Unmarshal(enrollmentArr, &enrollments); err != nil {
		log.Errorf("Error occurred while trying to unmarshal the array of enrollments (%v)", err)
		return err
	}
	if duplicates := FilterEnrollments(enrollments, func(e models.Enrollment) bool {
		return (e.Name == enrollmentPayload.Name && e.Yob == enrollmentPayload.Yob) || (*e.NationalID == *enrollmentPayload.NationalID)
	}); len(duplicates) > 0 {
		return errors2.New("Enrollment with same details [Name-YOB or national ID] already exists")
	}
	return nil
}

func FilterEnrollments(enrollments []models.Enrollment, criteria func(e models.Enrollment) bool) []models.Enrollment {
	var res []models.Enrollment
	for _, e := range enrollments {
		if criteria(e) {
			res = append(res, e)
		}
	}
	return res
}

func FetchEnrollments(mobile string) ([]byte, error){
	filter := map[string]interface{}{}
	filter["phone"] = map[string]interface{}{
		"eq": mobile,
	}
	responseFromRegistry, err := kernelService.QueryRegistry("Enrollment", filter, 100, 0)
	if err != nil {
		log.Error("Error occurred while querying Enrollment registry ", err)
		return nil, err
	}
	enrollmentArr, err := json.Marshal(responseFromRegistry["Enrollment"]);
	if err != nil {
		log.Errorf("Error occurred while trying to marshal the array of enrollments (%v)", err)
		return nil, err
	}
	return enrollmentArr, nil
}

type EnrollmentPayload struct {
	RowID              uint   `json:"rowID"`
	EnrollmentScopeId  string `json:"enrollmentScopeId"`
	VaccinationDetails []byte `json:"vaccinationDetails"`
	*models.Enrollment
}
