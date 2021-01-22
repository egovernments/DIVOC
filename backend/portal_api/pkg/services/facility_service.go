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

const pendingTasksTemplateString = `
Your facility is still pending to complete certain tasks ({{.PendingTasks}}). Please do the needful.
`

var pendingTasksTemplate = template.Must(template.New("").Parse(pendingTasksTemplateString))

const facilityUpdateTemplateString = `
Your facility's' {{.field}} is been updated to {{.value}}.
`

var facilityUpdateTemplate = template.Must(template.New("").Parse(facilityUpdateTemplateString))

func GetFacilityByCode(facilityCode string) (map[string]interface{}, error) {
	filter := map[string]interface{}{
		"facilityCode": map[string]interface{}{
			"eq": facilityCode,
		},
	}
	return kernelService.QueryRegistry(FacilityEntity, filter)
}

func NotifyFacilitiesPendingTasks(params operations.NotifyFacilitiesParams, claimBody *models.JWTClaimBody) middleware.Responder {
	for _, facilityNotifyRequest := range params.Body {
		log.Infof("Notifying facility %s", facilityNotifyRequest.FacilityID)
		buf := bytes.Buffer{}
		err := pendingTasksTemplate.Execute(&buf, facilityNotifyRequest)
		if err == nil {
			subject := "DIVOC - Facility Pending Tasks"
			if len(facilityNotifyRequest.Contact) > 0 {
				PublishNotificationMessage("tel:"+facilityNotifyRequest.Contact, subject, buf.String())
			}
			if len(facilityNotifyRequest.Email) > 0 {
				PublishNotificationMessage("mailto:"+facilityNotifyRequest.Email, subject, buf.String())
			}
		} else {
			return operations.NewGetFacilityGroupsBadRequest()
		}
	}
	return operations.NewNotifyFacilitiesOK()
}

func NotifyFacilityUpdate(field string, value string, mobile string, email string) {
	updateObj := map[string]interface{}{
		"field": field,
		"value": value,
	}
	buf := bytes.Buffer{}
	err := facilityUpdateTemplate.Execute(&buf, updateObj)
	if err == nil {
		subject := "DIVOC - Facility Update"
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
