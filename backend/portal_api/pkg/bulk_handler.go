package pkg

import (
	"bytes"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/pkg/services"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"text/template"
)

const FacilityRegistered = "facilityRegistered"

func sendFacilityRegisteredNotification(facility models.Facility) {

	facilityRegisteredTemplateString := kernelService.AppConfigs.NotificationTemplates[FacilityRegistered].Message
	subject := kernelService.AppConfigs.NotificationTemplates[FacilityRegistered].Subject

	var facilityRegisteredTemplate = template.Must(template.New("").Parse(facilityRegisteredTemplateString))

	buf := bytes.Buffer{}
	err := facilityRegisteredTemplate.Execute(&buf, facility)
	if err == nil {
		services.PublishNotificationMessage("mailto:"+facility.Email, subject, buf.String())
	} else {
		log.Errorf("Failed generating notification template", err)
	}
}
