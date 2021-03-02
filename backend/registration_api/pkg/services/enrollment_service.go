package services

import (
	"bytes"
	"encoding/json"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/models"
	"github.com/go-openapi/errors"
	log "github.com/sirupsen/logrus"
	"text/template"
	"time"
)

func CreateEnrollment(enrollment *models.Enrollment, position int) error {
	maxEnrollmentCreationAllowed := config.Config.EnrollmentCreation.MaxEnrollmentCreationAllowed

	if position > maxEnrollmentCreationAllowed {
		failedErrorMessage := "Maximum enrollment creation limit is reached"
		log.Info(failedErrorMessage)
		return errors.New(400, failedErrorMessage)
	}

	enrollment.Code = utils.GenerateEnrollmentCode(enrollment.Phone, position)
	exists, err := KeyExists(enrollment.Code)
	if err == nil && exists == 0 {
		err := kernelService.CreateNewRegistry(enrollment, "Enrollment")
		return err
	} else {
		return CreateEnrollment(enrollment, position+1)
	}
}

func EnrichFacilityDetails(enrollments []map[string]interface{}) {
	for _, enrollment := range enrollments {
		facilityDetails := make(map[string]interface{})
		if enrollment["appointments"] == nil {
			continue
		}
		appointments := enrollment["appointments"].([]interface{})

		// No appointment means no need to show the facility details
		for _, appointment := range appointments {
			facilityCode := appointment.(map[string]interface{})["enrollmentScopeId"]
			if facilityCode != nil && len(facilityCode.(string)) > 0 {
				redisKey := facilityCode.(string) + "-info"
				value, err := GetValue(redisKey)
				if err := json.Unmarshal([]byte(value), &facilityDetails); err != nil {
					log.Errorf("Error in marshalling json %+v", err)
				}
				if err != nil || len(facilityDetails) == 0 {
					log.Errorf("Unable to get the value in Cache (%v)", err)
					filter := map[string]interface{}{}
					filter["facilityCode"] = map[string]interface{}{
						"eq": facilityCode,
					}
					if responseFromRegistry, err := kernelService.QueryRegistry("Facility", filter, 100, 0); err == nil {
						facility := responseFromRegistry["Facility"].([]interface{})[0].(map[string]interface{})
						facilityDetails["facilityName"] = facility["facilityName"]
						facilityAddress := facility["address"].(map[string]interface{})
						facilityDetails["state"] = facilityAddress["state"]
						facilityDetails["pincode"] = facilityAddress["pincode"]
						facilityDetails["district"] = facilityAddress["district"]
						appointment.(map[string]interface{})["facilityDetails"] = facilityDetails
						if facilityDetailsBytes, err := json.Marshal(facilityDetails); err != nil {
							log.Errorf("Error in Marshaling the facility details %+v", err)
						} else {
							err:=SetValue(redisKey, facilityDetailsBytes, time.Duration(config.Config.Redis.CacheTTL))
							if err != nil {
								log.Errorf("Unable to set the value in Cache (%v)", err)
							}
						}
					} else {
						log.Errorf("Error occurred while fetching the details of facility (%v)", err)
					}
				} else {
					appointment.(map[string]interface{})["facilityDetails"] = facilityDetails
				}
			}

		}
	}
}

func NotifyRecipient(enrollment models.Enrollment) error {
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
