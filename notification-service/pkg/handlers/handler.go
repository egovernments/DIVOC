package handlers

import (
	"github.com/divoc/notification-service/pkg/services"
	"github.com/divoc/notification-service/swagger_gen/restapi/operations"
	"github.com/divoc/notification-service/swagger_gen/restapi/operations/notification"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
	"strings"
)

const MobileNumberPrefix = "tel:"

func SetupHandlers(api *operations.NotificationServiceAPI) {
	api.NotificationPostNotificationHandler = notification.PostNotificationHandlerFunc(postNotificationHandler)

}

func postNotificationHandler(params notification.PostNotificationParams) middleware.Responder {
	requestBody := params.Body

	if strings.Contains(*requestBody.Recepient, MobileNumberPrefix) {
		if response, err := services.SendSMS(strings.Split(*requestBody.Recepient, MobileNumberPrefix)[1], *requestBody.Message); err == nil {
			log.Infof("Successfully sent SMS %+v", response)
		} else {
			log.Errorf("Failed sending SMS %+v", err)
		}

	}
	return notification.NewPostNotificationOK()
}
