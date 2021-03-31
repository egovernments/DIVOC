package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"

	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	models2 "github.com/divoc/registration-api/pkg/models"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/models"
	"github.com/go-openapi/errors"
	log "github.com/sirupsen/logrus"
)

var DuplicateEnrollmentCriteria = map[string]func(e1, e2 models.Enrollment) bool {
	"Identity Number": func(e1, e2 models.Enrollment) bool {return *e1.Identity == *e2.Identity},
	"Name and Age": func(e1, e2 models.Enrollment) bool {return e1.Name == e2.Name && e1.Yob == e2.Yob},
}

func CreateEnrollment(enrollmentPayload *EnrollmentPayload) (string, error) {

	enrollmentArr, err := FetchEnrollments(enrollmentPayload.Phone)
	if err != nil {
		return "", err
	}
	var enrollments []enrollment
	if err := json.Unmarshal(enrollmentArr, &enrollments); err != nil {
		log.Errorf("Error occurred while trying to unmarshal the array of enrollments (%v)", err)
		return "", err
	}

	dupEnrollment, err := FindDuplicate(*enrollmentPayload, enrollments)
	if err != nil {
		log.Error("Error finding duplicates ", err)
		return "", err
	}

	if dupEnrollment != nil {
		enrollmentPayload.OverrideEnrollmentCode(dupEnrollment.Duplicate.Code)
		duplicateErr := fmt.Errorf("enrollment with same %s already exists", dupEnrollment.Criteria)
		if enrollmentPayload.EnrollmentType != models.EnrollmentEnrollmentTypePREENRL {
			log.Error("Duplicates Found : ", duplicateErr)
			return "", duplicateErr
		}
		if shouldAutoBookAppointment(enrollmentPayload) {
			return "", BookAppointment(enrollmentPayload.Code, enrollmentPayload.Appointments[0].EnrollmentScopeID, enrollmentPayload.Appointments[0].ProgramID)
		}
		return "", duplicateErr
	}

	// no duplicates, not walk-in, error with enrollment limit reached
	if enrollmentPayload.EnrollmentType != models.EnrollmentEnrollmentTypeWALKIN && len(enrollments) >= config.Config.EnrollmentCreation.MaxEnrollmentCreationAllowed {
		errMsg := "Maximum enrollment creation limit is reached"
		log.Error(errMsg)
		return "", errors.New(400, errMsg)
	}

	// no duplicates, after maxEnrollment check
	enrollmentPayload.Code = func() string {
		existingCodes := map[string]bool{}
		for _ , e := range enrollments {
			existingCodes[e.Code] = true
		}
		i := 1
		for {
			newCode := utils.GenerateEnrollmentCode(enrollmentPayload.Phone, i)
			if !existingCodes[newCode] {
				log.Info("New Code : ", newCode)
				return newCode
			}
			i++
		}
	}()
	registryResponse, err := kernelService.CreateNewRegistry(enrollmentPayload.Enrollment, "Enrollment")
	if err != nil {
		return "", nil
	}
	result := registryResponse.Result["Enrollment"].(map[string]interface{})["osid"]
	enrollmentPayload.OverrideEnrollmentCode(enrollmentPayload.Code)
	if shouldAutoBookAppointment(enrollmentPayload) {
		return result.(string), BookAppointment(enrollmentPayload.Code, enrollmentPayload.Appointments[0].EnrollmentScopeID, enrollmentPayload.Appointments[0].ProgramID)
	}
	return result.(string), nil
}

func BookAppointment(enrollmentCode, facilityID, programID string) error {
	log.Info("Will book appointment at this point")
	return nil
}

func shouldAutoBookAppointment(enrollmentPayload *EnrollmentPayload) bool {
	return enrollmentPayload.EnrollmentType == models.EnrollmentEnrollmentTypePREENRL && len(enrollmentPayload.Appointments) > 0 && enrollmentPayload.Appointments[0].EnrollmentScopeID != ""
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

func FindDuplicate(enrollmentPayload EnrollmentPayload, enrollments []enrollment) (*DuplicateEnrollment, error) {
	searchDuplicateEnrollment := func (enrollments []enrollment, target models.Enrollment, criteria func(e1, e2 models.Enrollment) bool) *enrollment {
		for _, e := range enrollments {
			if criteria(e.Enrollment, target) {
				return &e
			}
		}
		return nil
	}

	for fields, criteria := range DuplicateEnrollmentCriteria {
		if duplicate := searchDuplicateEnrollment(enrollments, *enrollmentPayload.Enrollment, criteria); duplicate != nil {
			return &DuplicateEnrollment{
				Duplicate: duplicate,
				Criteria: fields,
			}, nil
		}
	}
	return nil, nil
}

func GetEnrollmentInfoIfValid(enrollmentCode string, phone string) map[string]string {
	values, err := GetHashValues(enrollmentCode)
	if err == nil {
		if val, ok := values["phone"]; ok && val == phone {
			return values
		}
	}
	return nil
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
	VaccinationDetails map[string]interface{} `json:"vaccinationDetails"`
	*models.Enrollment
}

func (ep EnrollmentPayload) OverrideEnrollmentCode(code string) {
	if len(ep.VaccinationDetails) > 0 && ep.EnrollmentType == models.EnrollmentEnrollmentTypeWALKIN {
		ep.VaccinationDetails["preEnrollmentCode"] = code
	}
}

type DuplicateEnrollment struct {
	Duplicate	*enrollment
	Criteria	string
}

type enrollment struct {
	Osid	string	`json:"osid"`
	models.Enrollment
}
