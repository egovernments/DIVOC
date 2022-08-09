package services

import (
	log "github.com/sirupsen/logrus"
	kernelService "github.com/divoc/kernel_library/services"
	"bytes"
	model "github.com/divoc/notification-service/pkg/models"
	"github.com/divoc/notification-service/swagger_gen/models"
	"text/template"
)

func ConstructMessage(request model.NotificationPayload) (models.NotificationRequest,error ){

	log.Infof("NotificationPayload %v", request)
	TemplateString := kernelService.AppConfigs.NotificationTemplates[request.Template].Message
	Subject := kernelService.AppConfigs.NotificationTemplates[request.Template].Subject

	Template := template.Must(template.New("").Parse(TemplateString))

	recipient :=  request.Recipient

	buf := bytes.Buffer{}
	err := Template.Execute(&buf,request.Payload)
	message := buf.String()
	if(err==nil){
		notificationRequest := models.NotificationRequest{
			Recipient: &recipient,
			Subject: Subject,
			Message: &message,
		}
		log.Infof("notificationRequest: %v",notificationRequest)
		return notificationRequest,nil
	} else {
		log.Infof("Error in constructing notificationRequest: %v",err)
		return models.NotificationRequest{},err
	}
	
}