package services

import (
	"bytes"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/divoc/portal-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
	"text/template"
)

const FacilityEntity string = "Facility"
const FacilityPendingTasks string = "facilityPendingTasks"
const FacilityUpdate string = "facilityUpdate"

func GetFacilityByCode(facilityCode string, limit int, offset int) (map[string]interface{}, error) {
	filter := map[string]interface{}{
		"facilityCode": map[string]interface{}{
			"eq": facilityCode,
		},
	}
	return kernelService.QueryRegistry(FacilityEntity, filter, limit, offset)
}

func NotifyFacilitiesPendingTasks(params operations.NotifyFacilitiesParams, claimBody *models.JWTClaimBody) middleware.Responder {
	pendingTasksTemplateString := kernelService.FlagrConfigs.NotificationTemplates[FacilityPendingTasks].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[FacilityPendingTasks].Subject
	var pendingTasksTemplate = template.Must(template.New("").Parse(pendingTasksTemplateString))

	for _, facilityNotifyRequest := range params.Body {
		searchRespone, err := kernelService.ReadRegistry("Facility", facilityNotifyRequest.FacilityID)
		if err == nil {
			facility := searchRespone["Facility"].(map[string]interface{})
			if facility != nil {
				log.Infof("Notifying facility %s", facilityNotifyRequest.FacilityID)
				buf := bytes.Buffer{}
				err := pendingTasksTemplate.Execute(&buf, facilityNotifyRequest)
				if err == nil {
					contact := facility["contact"].(string)
					email := facility["email"].(string)
					if len(contact) > 0 {
						PublishNotificationMessage("tel:"+contact, subject, buf.String())
					}
					if len(email) > 0 {
						PublishNotificationMessage("mailto:"+email, subject, buf.String())
					}
				} else {
					return operations.NewGetFacilityGroupsBadRequest()
				}
			}
		}

	}
	return operations.NewNotifyFacilitiesOK()
}

func NotifyFacilityUpdate(field string, value string, mobile string, email string) {
	facilityUpdateTemplateString := kernelService.FlagrConfigs.NotificationTemplates[FacilityUpdate].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[FacilityUpdate].Subject

	var facilityUpdateTemplate = template.Must(template.New("").Parse(facilityUpdateTemplateString))

	updateObj := map[string]interface{}{
		"field": field,
		"value": value,
	}
	buf := bytes.Buffer{}
	err := facilityUpdateTemplate.Execute(&buf, updateObj)
	if err == nil {
		if len(mobile) > 0 {
			PublishNotificationMessage("tel:"+mobile, subject, buf.String())
		}
		if len(email) > 0 {
			PublishNotificationMessage("mailto:"+email, subject, buf.String())
		}
	} else {
		log.Errorf("Failed generating facility update template message", err)
	}
}
