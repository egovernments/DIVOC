package pkg

import (
	"github.com/divoc/notification-service/swagger_gen/models"
	"github.com/divoc/notification-service/swagger_gen/restapi/operations"
	"github.com/divoc/notification-service/swagger_gen/restapi/operations/notification"
	"github.com/go-openapi/runtime/middleware"
)

func SetupHandlers(api *operations.NotificationServiceAPI) {
	api.NotificationPostNotificationHandler = notification.PostNotificationHandlerFunc(postNotificationHandler)

}

func postNotificationHandler(notification.PostNotificationParams, *models.JWTClaimBody) middleware.Responder {
	return notification.NewPostNotificationOK()
}
