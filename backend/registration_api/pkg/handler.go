package pkg

import (
	"encoding/json"
	"github.com/divoc/registration-api/pkg/services"
	"github.com/divoc/registration-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
)

func SetupHandlers(api *operations.RegistrationAPIAPI) {
	api.EnrollRecipientHandler = operations.EnrollRecipientHandlerFunc(enrollRecipient)
}

func enrollRecipient(params operations.EnrollRecipientParams) middleware.Responder{
	if recipientData, err := json.Marshal(params.Body); err == nil {
		log.Info("Received Recipient data to enroll", string(recipientData), params.Body)
		services.PublishEnrollmentMessage(recipientData)
	}
	return operations.NewEnrollRecipientOK()
}
