package handlers

import (
	"github.com/divoc/notification-service/pkg/services"
	"github.com/divoc/notification-service/swagger_gen/restapi/operations"
	"github.com/divoc/notification-service/swagger_gen/restapi/operations/notification"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
)

func SetupHandlers(api *operations.NotificationServiceAPI) {
	api.NotificationPostNotificationHandler = notification.PostNotificationHandlerFunc(postNotificationHandler)

}

func postNotificationHandler(params notification.PostNotificationParams) middleware.Responder {
	requestBody := params.Body

	if mobileNumber, err := services.GetMobileNumber(*requestBody.Recipient); err == nil {
		if response, err := services.SendSMS(mobileNumber, *requestBody.Message); err == nil {
			log.Infof("Successfully sent SMS %+v", response)
		} else {
			log.Errorf("Failed sending SMS %+v", err)
		}
	}
	if emailId, err := services.GetEmailId(*requestBody.Recipient); err == nil {
		if err := services.SendEmail(emailId, requestBody.Subject, *requestBody.Message); err == nil {
			log.Infof("Successfully sent Email %+v")
		} else {
			log.Errorf("Failed sending email %+v", err)
		}
	}
	return notification.NewPostNotificationOK()
}
