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
