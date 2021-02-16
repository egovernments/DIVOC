package pkg

import (
	"encoding/json"
	"github.com/divoc/registration-api/pkg/services"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
	"time"
)

func SetupHandlers(api *operations.RegistrationAPIAPI) {
	api.EnrollRecipientHandler = operations.EnrollRecipientHandlerFunc(enrollRecipient)
	api.GenerateOTPHandler = operations.GenerateOTPHandlerFunc(generateOTP)
	api.VerifyOTPHandler = operations.VerifyOTPHandlerFunc(verifyOTP)
}

func enrollRecipient(params operations.EnrollRecipientParams) middleware.Responder{
	if recipientData, err := json.Marshal(params.Body); err == nil {
		log.Info("Received Recipient data to enroll", string(recipientData), params.Body)
		services.PublishEnrollmentMessage(recipientData)
	}
	return operations.NewEnrollRecipientOK()
}

func generateOTP(params operations.GenerateOTPParams) middleware.Responder {
	phone := params.Body.Phone
	if phone == "" {
		return operations.NewGenerateOTPNoContent()
	}
	otp, err := services.GetValue(phone)
	if err == nil {
		// send SMS to the phone
		return operations.NewGenerateOTPOK()
	} else {
		otp = utils.GenerateOTP()
		err := services.SetValue(phone, otp, time.Minute * 5)
		if err == nil {
			return operations.NewGenerateOTPOK()
		}
	}
	return nil
}

func verifyOTP(params operations.VerifyOTPParams) middleware.Responder {
	phone := params.Body.Phone
	receivedOTP := params.Body.Otp
	if receivedOTP == "" {
		return operations.NewVerifyOTPNoContent()
	}

	otp, err := services.GetValue(phone)
	if otp != receivedOTP {
		return operations.NewVerifyOTPUnauthorized()
	}
	if err == nil {
		token, err := services.CreateRecipientToken(phone)
		if err != nil {
			log.Error("Unable to create the jwt token ", err)
			return operations.NewVerifyOTPUnauthorized()
		}
		log.Info("Generated Token ", token)
		response := operations.VerifyOTPOKBody {
			Token: token,
		}
		return operations.NewVerifyOTPOK().WithPayload(&response)
	}
	return operations.NewVerifyOTPUnauthorized()
}
