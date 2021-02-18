package pkg

import (
	"encoding/json"
	"github.com/divoc/kernel_library/model"
	kernelService "github.com/divoc/kernel_library/services"
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
	api.GetRecipientsHandler = operations.GetRecipientsHandlerFunc(getRecipients)
}

func getRecipients(params operations.GetRecipientsParams) middleware.Responder {
	recipientToken := params.HTTPRequest.Header.Get("recipientToken")
	if recipientToken == "" {
		log.Error("Recipient Token is empty")
		return operations.NewGetRecipientsUnauthorized()
	}
	phone, err := services.VerifyRecipientToken(recipientToken)
	if err != nil {
		log.Error("Error occurred while verifying the token ", err)
		return operations.NewGetRecipientsUnauthorized()
	}
	filter := map[string]interface{}{}
	filter["phone"] = map[string]interface{}{
		"eq": phone,
	}
	responseFromRegistry, err := kernelService.QueryRegistry("Enrollment", filter, 100, 0)
	if err != nil {
		log.Error("Error occurred while querying Enrollment registry ", err)
		return operations.NewGetRecipientsInternalServerError()
	}
	return model.NewGenericJSONResponse(responseFromRegistry["Enrollment"])
}

func enrollRecipient(params operations.EnrollRecipientParams) middleware.Responder{
	recipientToken := params.HTTPRequest.Header.Get("recipientToken")
	if recipientToken == "" {
		log.Error("Recipient Token is empty")
		return operations.NewEnrollRecipientUnauthorized()
	}
	phone, err := services.VerifyRecipientToken(recipientToken)
	if err != nil {
		log.Error("Error occurred while verifying the token ", err)
		return operations.NewEnrollRecipientUnauthorized()
	}
	params.Body.Phone = phone
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
