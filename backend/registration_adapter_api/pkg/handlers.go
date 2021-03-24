package pkg

import (
	"encoding/json"
	"github.com/divoc/registration-adapter-api/pkg/services"
	"github.com/divoc/registration-adapter-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime/middleware"
	"github.com/imroc/req"
	"strconv"
	"strings"
	"time"
)

const POST = "POST"
const GET = "GET"
const DELETE = "DELETE"
const DateFormat = "2006-01-02"

type HeaderStruct struct {
	Authorization string
}

func SetupHandlers(api *operations.RegistrationAdapterAPIAPI) {
	api.GenerateOTPHandler = operations.GenerateOTPHandlerFunc(generateOTP)
	api.ConfirmOTPHandler = operations.ConfirmOTPHandlerFunc(confirmOTP)
	api.CreateNewBeneficiaryHandler = operations.CreateNewBeneficiaryHandlerFunc(createBeneficiary)
	api.GetBeneficiariesHandler = operations.GetBeneficiariesHandlerFunc(getBeneficiaries)

	api.BookAppointmentHandler = operations.BookAppointmentHandlerFunc(bookAppointment)
	api.CancelAppointmentHandler = operations.CancelAppointmentHandlerFunc(cancelAppointment)

	api.GetTimeSlotsHandler = operations.GetTimeSlotsHandlerFunc(getTimeslots)
}

func generateOTP(params operations.GenerateOTPParams) middleware.Responder {
	request := map[string]interface{}{
		"phone": params.Body.Mobile,
	}
	resp, _ := services.CallRegistrationAPI(POST, "/generateOTP", nil, nil, request)
	if resp.Response().StatusCode == 200 {
		response := operations.NewGenerateOTPOK()
		response.Payload = &operations.GenerateOTPOKBody{
			Txn: services.GenerateRandomUUID(),
		}
		return response
	}
	return operations.NewGenerateOTPBadRequest()
}

func confirmOTP(params operations.ConfirmOTPParams) middleware.Responder {
	request := map[string]interface{}{
		"phone": params.Body.Mobile,
		"otp":   params.Body.Otp,
	}
	resp, _ := services.CallRegistrationAPI(POST, "/verifyOTP", nil, nil, request)
	if resp.Response().StatusCode == 200 {
		var response map[string]interface{}
		_ = json.Unmarshal(resp.Bytes(), &response)

		data := operations.NewConfirmOTPOK()
		data.Payload = &operations.ConfirmOTPOKBody{
			Token: response["token"].(string),
		}
		return data
	}
	return operations.NewConfirmOTPUnauthorized()
}

func createBeneficiary(params operations.CreateNewBeneficiaryParams) middleware.Responder {
	photoIds := services.GetPhotoIds()
	reqBody := params.Body
	photoIdStr, _ := strconv.Atoi(*reqBody.PhotoIDType)
	pincode, _ := strconv.Atoi(*reqBody.Pincode)
	yob, _ := strconv.Atoi(*reqBody.BirthYear)
	request := map[string]interface{}{
		"programId":     "1-b58ec6ec-c971-455c-ade5-7dce34ea0b09",
		"nationalId":    photoIds[photoIdStr-1]["did"].(string) + ":" + *reqBody.PhotoIDNumber,
		"name":          reqBody.Name,
		"yob":           yob,
		"gender":        reqBody.Gender,
		"email":         "",
		"confirmEmail":  "",
		"comorbidities": reqBody.Comorbidities,
		"status":        "",
		"address": map[string]interface{}{
			"addressLine1": "",
			"addressLine2": "",
			"state":        services.GetStateNameBy(*reqBody.StateID),
			"district":     services.GetDistrictNameBy(*reqBody.DistrictID),
			"pincode":      pincode,
		},
		"phone":            "",
		"beneficiaryPhone": "",
		"consent":          reqBody.Consent,
	}
	h := HeaderStruct{
		params.HTTPRequest.Header.Get("Authorization"),
	}

	authHeader := req.HeaderFromStruct(h)
	resp, _ := services.CallRegistrationAPI(POST, "/recipients", nil, authHeader, request)
	if resp.Response().StatusCode == 200 {
		var response map[string]interface{}
		_ = json.Unmarshal(resp.Bytes(), &response)

		data := operations.NewCreateNewBeneficiaryOK()
		data.Payload = &operations.CreateNewBeneficiaryOKBody{
			// no beneficiary id in response
			BeneficiaryReferenceID: "",
		}
		return data
	}
	return operations.NewConfirmOTPUnauthorized()
}

func getBeneficiaries(params operations.GetBeneficiariesParams) middleware.Responder {
	h := HeaderStruct{
		params.HTTPRequest.Header.Get("Authorization"),
	}

	authHeader := req.HeaderFromStruct(h)
	resp, _ := services.CallRegistrationAPI(GET, "/recipients", nil, authHeader, nil)
	if resp.Response().StatusCode == 200 {
		var response []map[string]interface{}
		_ = json.Unmarshal(resp.Bytes(), &response)

		data := operations.NewGetBeneficiariesOK()
		data.Payload = operations.NewGetBeneficiariesOK().Payload
		for _, resp := range response {
			centerId := ""
			date := ""
			doseNumber := "1"
			facilityId, ok := resp["enrollmentScopeId"].(string)
			if ok {
				centerId = facilityId
				appointmentDate, _ := time.Parse(DateFormat, resp["appointmentDate"].(string))
				date = appointmentDate.Format(time.RFC3339)
			}
			data.Payload = append(data.Payload, &operations.GetBeneficiariesOKBodyItems0{
				Appointment: &operations.GetBeneficiariesOKBodyItems0Appointment{
					AppointmentNumber: "",
					CenterID:          centerId,
					Date:              date,
					DoseNumber:        doseNumber,
				},
				ID:   resp["code"].(string),
				Name: resp["name"].(string),
			})
		}

		return data
	}
	return operations.NewConfirmOTPUnauthorized()
}

func bookAppointment(param operations.BookAppointmentParams) middleware.Responder {
	h := HeaderStruct{
		param.HTTPRequest.Header.Get("Authorization"),
	}

	authHeader := req.HeaderFromStruct(h)
	for _, beneficiary := range param.Body.Beneficiaries {
		request := map[string]interface{}{
			"facilitySlotId": *param.Body.SlotID,
			"enrollmentCode": beneficiary,
		}
		resp, _ := services.CallRegistrationAPI(POST, "/appointment", nil, authHeader, request)
		if resp.Response().StatusCode == 200 {

		} else {
			return operations.NewBookAppointmentUnauthorized()
		}
	}
	return operations.NewBookAppointmentOK()
}

func cancelAppointment(param operations.CancelAppointmentParams) middleware.Responder {
	h := HeaderStruct{
		param.HTTPRequest.Header.Get("Authorization"),
	}

	authHeader := req.HeaderFromStruct(h)
	for _, beneficiary := range param.Body.Beneficiaries {
		request := map[string]interface{}{
			"enrollmentCode": beneficiary,
		}
		resp, _ := services.CallRegistrationAPI(DELETE, "/appointment", nil, authHeader, request)
		if resp.Response().StatusCode == 200 {

		} else {
			return operations.NewBookAppointmentUnauthorized()
		}
	}
	return operations.NewBookAppointmentOK()
}

func getTimeslots(param operations.GetTimeSlotsParams) middleware.Responder {
	h := HeaderStruct{
		param.HTTPRequest.Header.Get("Authorization"),
	}

	authHeader := req.HeaderFromStruct(h)
	queryParam := req.Param{
		"facilityId": *param.CenterID,
		"pageNumber": 0,
		"pageSize":   14,
	}
	resp, _ := services.CallRegistrationAPI(GET, "/facility/slots", queryParam, authHeader, nil)
	if resp.Response().StatusCode == 200 {
		var response map[string][]string
		_ = json.Unmarshal(resp.Bytes(), &response)
		var slots []*operations.GetTimeSlotsOKBodyTimeslotsItems0

		for index, key := range response["keys"] {
			slotsRemaining := response["slots"][index]
			facilityDetails := strings.Split(key, "_")
			date, _ := time.Parse(DateFormat, facilityDetails[2])
			slotName := "Morning"
			if strings.HasPrefix(facilityDetails[3], "1") {
				slotName = "Afternoon"
			}
			slots = append(slots, &operations.GetTimeSlotsOKBodyTimeslotsItems0{
				AvailableCapacity: slotsRemaining,
				Date:              date.Format(time.RFC3339),
				SlotID:            key,
				SlotName:          slotName,
				Timings:           facilityDetails[3] + "-" + facilityDetails[4],
			})
		}

		data := operations.NewGetTimeSlotsOK()

		data.Payload = &operations.GetTimeSlotsOKBody{
			CenterID:  *param.CenterID,
			Timeslots: slots,
		}
		return data
	}
	return operations.NewGetTimeSlotsUnauthorized()
}
