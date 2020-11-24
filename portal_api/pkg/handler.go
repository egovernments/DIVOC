package pkg

import (
	"encoding/json"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/divoc/portal-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
	"net/http"
	"strconv"
	"strings"
)

type GenericResponse struct {
	statusCode int
}

func (o *GenericResponse) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {
	rw.Header().Del(runtime.HeaderContentType) //Remove Content-Type on empty responses
	rw.WriteHeader(o.statusCode)
}

func NewGenericStatusOk() middleware.Responder {
	return &GenericResponse{statusCode: 200}
}

func NewGenericServerError() middleware.Responder {
	return &GenericResponse{statusCode: 500}
}
func SetupHandlers(api *operations.DivocPortalAPIAPI) {
	api.CreateMedicineHandler = operations.CreateMedicineHandlerFunc(createMedicineHandler)
	api.CreateProgramHandler = operations.CreateProgramHandlerFunc(createProgramHandler)
	api.PostFacilitiesHandler = operations.PostFacilitiesHandlerFunc(postFacilitiesHandler)
	api.PostVaccinatorsHandler = operations.PostVaccinatorsHandlerFunc(postVaccinatorsHandler)
	api.GetFacilitiesHandler = operations.GetFacilitiesHandlerFunc(getFacilitiesHandler)
	api.GetVaccinatorsHandler = operations.GetVaccinatorsHandlerFunc(getVaccinatorsHandler)
	api.GetMedicinesHandler = operations.GetMedicinesHandlerFunc(getMedicinesHandler)
	api.GetProgramsHandler = operations.GetProgramsHandlerFunc(getProgramsHandler)
}

func getProgramsHandler(params operations.GetProgramsParams, principal interface{}) middleware.Responder {
	return NewGenericStatusOk()
}
func getMedicinesHandler(params operations.GetMedicinesParams, principal interface{}) middleware.Responder {
	return NewGenericStatusOk()
}

func getVaccinatorsHandler(params operations.GetVaccinatorsParams, principal interface{}) middleware.Responder {
	return NewGenericStatusOk()
}

func getFacilitiesHandler(params operations.GetFacilitiesParams, principal interface{}) middleware.Responder {
	return NewGenericStatusOk()
}

func createMedicineHandler(params operations.CreateMedicineParams, principal interface{}) middleware.Responder {
	log.Infof("Create medicine %+v", params.Body)
	objectId:="Medicine"
	requestBody, err := json.Marshal(params.Body)
	if err != nil {
		return operations.NewCreateMedicineBadRequest()
	}
	requestMap := make(map[string]interface{})
	err = json.Unmarshal(requestBody, &requestMap)
	if err != nil {
		log.Info(err)
		return NewGenericServerError()
	}
	return makeRegistryCreateRequest(requestMap, objectId)
}

func createProgramHandler(params operations.CreateProgramParams, principal interface{}) middleware.Responder {
	log.Infof("Create Program %+v", params.Body)
	objectId:="Program"
	requestBody, err := json.Marshal(params.Body)
	if err != nil {
		return operations.NewCreateProgramBadRequest()
	}
	requestMap := make(map[string]interface{})
	err = json.Unmarshal(requestBody, &requestMap)
	if err != nil {
		log.Info(err)
		return NewGenericServerError()
	}
	return makeRegistryCreateRequest(requestMap, objectId)
}
func postFacilitiesHandler(params operations.PostFacilitiesParams, principal interface{}) middleware.Responder {
	data := NewScanner(params.File)
	defer params.File.Close()
	for data.Scan() {
		createFacility(&data)
		log.Info(data.Text("serialNum"), data.Text("facilityName"))
	}

	return operations.NewPostFacilitiesOK()
}

func createFacility(data *Scanner) error {
	//serialNum, facilityCode,facilityName,contact,operatingHourStart, operatingHourEnd, category, type, status,
	//admins,addressLine1,addressLine2, district, state, pincode, geoLocationLat, geoLocationLon
	serialNum, err := strconv.ParseInt(data.Text("serialNum"), 10, 64)
	if err != nil {
		return err
	}
	addressline1 := data.Text("addressLine1")
	addressline2 := data.Text("addressLine2")
	district := data.Text("district")
	state := data.Text("state")
	pincode := data.int64("pincode")
	facility := models.Facility{
		SerialNum: serialNum,
		FacilityCode: data.Text("facilityCode"),
		FacilityName: data.Text("facilityName"),
		Contact: data.Text("contact"),
		OperatingHourStart: data.int64("operatingHourStart"),
		OperatingHourEnd: data.int64("operatingHourEnd"),
		Category: data.Text("category"),
		Type: data.Text("type"),
		Status: data.Text("status"),
		Admins: strings.Split(data.Text("admins"), ","),
		Address: &models.Address{
			AddressLine1: &addressline1,
			AddressLine2: &addressline2,
			District: &district,
			State: &state,
			Pincode: &pincode,
		},
	}
	makeRegistryCreateRequest(facility, "Facility")
	return nil
}

func postVaccinatorsHandler(params operations.PostVaccinatorsParams, principal interface{}) middleware.Responder {
	return operations.NewPostVaccinatorsOK()
}


func registryUrl(operationId string) string {
	url := config.Config.Registry.Url + "/" + operationId
	return url
}