package pkg

import (
	"encoding/json"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/models"
	"github.com/divoc/registration-api/pkg/services"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
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
	otp := utils.GenerateOTP()
	cacheOtp, err := json.Marshal(models.CacheOTP{Otp: otp, VerifyAttemptCount: 0})
	err = services.SetValue(phone, string(cacheOtp))
	if err == nil {
		// Send SMS
		return operations.NewGenerateOTPOK()
	}
	log.Info("Something went wrong ", err)
	return operations.NewGenerateOTPNoContent()
}

func verifyOTP(params operations.VerifyOTPParams) middleware.Responder {
	phone := params.Body.Phone
	receivedOTP := params.Body.Otp
	if receivedOTP == "" {
		return operations.NewVerifyOTPNoContent()
	}
	value, err := services.GetValue(phone)
	if value == "" || err != nil {
		return operations.NewVerifyOTPUnauthorized()
	}

	cacheOTP := models.CacheOTP{}
	json.Unmarshal([]byte(value), &cacheOTP)
	if cacheOTP.VerifyAttemptCount > config.Config.Auth.MAXOtpVerifyAttempts {
		return operations.NewVerifyOTPTooManyRequests()
	}
	if cacheOTP.Otp != receivedOTP {
		return operations.NewVerifyOTPUnauthorized()
	}

	cacheOTP.VerifyAttemptCount+=1
	cacheOtp, err := json.Marshal(cacheOTP)
	err = services.SetValue(phone, string(cacheOtp))

	if err == nil {
		token, err := services.CreateRecipientToken(phone)
		if err != nil {
			log.Error("Unable to create the jwt token ", err)
			return operations.NewVerifyOTPUnauthorized()
		}
		response := operations.VerifyOTPOKBody {
			Token: token,
		}
		return operations.NewVerifyOTPOK().WithPayload(&response)
	}
	return operations.NewVerifyOTPUnauthorized()
}
