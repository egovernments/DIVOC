package pkg

import (
	"encoding/json"
	"github.com/divoc/kernel_library/model"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/pkg/services"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/divoc/portal-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

const StateKey = "address.state"
const DistrictKey = "address.district"
const TypeKey = "category"
const ProgramIdKey = "programs.id"
const ProgramStatusKey = "programs.status"

func SetupHandlers(api *operations.DivocPortalAPIAPI) {
	api.CreateMedicineHandler = operations.CreateMedicineHandlerFunc(createMedicineHandler)
	api.CreateProgramHandler = operations.CreateProgramHandlerFunc(createProgramHandler)
	api.PostFacilitiesHandler = operations.PostFacilitiesHandlerFunc(postFacilitiesHandler)
	api.PostVaccinatorsHandler = operations.PostVaccinatorsHandlerFunc(postVaccinatorsHandler)
	api.GetFacilitiesHandler = operations.GetFacilitiesHandlerFunc(getFacilitiesHandler)
	api.GetVaccinatorsHandler = operations.GetVaccinatorsHandlerFunc(getVaccinatorsHandler)
	api.GetMedicinesHandler = operations.GetMedicinesHandlerFunc(getMedicinesHandler)
	api.GetProgramsHandler = operations.GetProgramsHandlerFunc(getProgramsHandler)
	api.PostEnrollmentsHandler = operations.PostEnrollmentsHandlerFunc(postEnrollmentsHandler)
	api.CreateFacilityUsersHandler = operations.CreateFacilityUsersHandlerFunc(createFacilityUserHandler)
	api.GetFacilityUsersHandler = operations.GetFacilityUsersHandlerFunc(getFacilityUserHandler)
	api.GetFacilityGroupsHandler = operations.GetFacilityGroupsHandlerFunc(getFacilityGroupHandler)
	api.GetEnrollmentsHandler = operations.GetEnrollmentsHandlerFunc(getEnrollmentsHandler)
	api.UpdateFacilitiesHandler = operations.UpdateFacilitiesHandlerFunc(updateFacilitiesHandler)
	api.GetAnalyticsHandler = operations.GetAnalyticsHandlerFunc(getAnalyticsHandler)
	api.GetPublicAnalyticsHandler = operations.GetPublicAnalyticsHandlerFunc(getPublicAnalyticsHandler)
	api.GetFacilityUploadsHandler = operations.GetFacilityUploadsHandlerFunc(getFacilityUploadHandler)
	api.GetFacilityUploadsErrorsHandler = operations.GetFacilityUploadsErrorsHandlerFunc(getFacilityUploadErrorsHandler)
	api.GetEnrollmentUploadHistoryHandler = operations.GetEnrollmentUploadHistoryHandlerFunc(getEnrollmentUploadHandler)
	api.GetEnrollmentsUploadsErrorsHandler = operations.GetEnrollmentsUploadsErrorsHandlerFunc(getPreEnrollmentUploadErrorsHandler)
	api.GetVaccinatorsUploadHistoryHandler = operations.GetVaccinatorsUploadHistoryHandlerFunc(getVaccinatorUploadHandler)
	api.GetVaccinatorsUploadsErrorsHandler = operations.GetVaccinatorsUploadsErrorsHandlerFunc(getVaccinatorUploadErrorsHandler)
	api.NotifyFacilitiesHandler = operations.NotifyFacilitiesHandlerFunc(services.NotifyFacilitiesPendingTasks)
	api.UpdateFacilityUserHandler = operations.UpdateFacilityUserHandlerFunc(updateFacilityUserHandler)
	api.DeleteFacilityUserHandler = operations.DeleteFacilityUserHandlerFunc(deleteFacilityUserHandler)
	api.CreateVaccinatorHandler = operations.CreateVaccinatorHandlerFunc(createVaccinatorHandler)
}

type GenericResponse struct {
	statusCode int
}

type GenericJsonResponse struct {
	body interface{}
}

func (o *GenericJsonResponse) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	bytes, err := json.Marshal(o.body)
	if err != nil {
		rw.WriteHeader(500)
		rw.Write([]byte("JSON Marshalling error"))
	}
	rw.WriteHeader(200)
	rw.Write(bytes)
}

func (o *GenericResponse) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {
	rw.Header().Del(runtime.HeaderContentType) //Remove Content-Type on empty responses
	rw.WriteHeader(o.statusCode)
}

func NewGenericStatusOk() middleware.Responder {
	return &GenericResponse{statusCode: 200}
}

func NewGenericJSONResponse(body interface{}) middleware.Responder {
	return &GenericJsonResponse{body: body}
}

func NewGenericServerError() middleware.Responder {
	return &GenericResponse{statusCode: 500}
}

func NewGenericNotFoundError() middleware.Responder {
	return &GenericResponse{statusCode: 404}
}

func NewGenericForbiddenError() middleware.Responder {
	return &GenericResponse{statusCode: 403}
}

func getEnrollmentsHandler(params operations.GetEnrollmentsParams, principal *models.JWTClaimBody) middleware.Responder {
	return kernelService.GetEntityType("Enrollment")
}

func getProgramsHandler(params operations.GetProgramsParams, principal *models.JWTClaimBody) middleware.Responder {
	return kernelService.GetEntityType("Program")
}

func getMedicinesHandler(params operations.GetMedicinesParams, principal *models.JWTClaimBody) middleware.Responder {
	return kernelService.GetEntityType("Medicine")
}

func getVaccinatorsHandler(params operations.GetVaccinatorsParams, principal *models.JWTClaimBody) middleware.Responder {
	if HasResourceRole(portalClientId, "admin", principal) {
		return kernelService.GetEntityType("Vaccinator")
	}
	facilityCode := principal.FacilityCode
	if facilityCode == "" {
		log.Errorf("Error facility code not mapped for the login %s", principal.PreferredUsername)
		return NewGenericServerError()
	}
	if vaccinators, err := kernelService.GetVaccinatorsForTheFacility(facilityCode); err != nil {
		log.Errorf("Error in getting vaccinators list")
		return NewGenericServerError()
	} else {
		return NewGenericJSONResponse(vaccinators)
	}
}

func createFilterObject(params operations.GetFacilitiesParams) map[string]interface{} {
	filter := map[string]interface{}{}
	if params.State != nil && !strings.EqualFold(*params.State, "ALL") {
		states := strings.Split(strings.ToLower(*params.State), ",")

		filter[StateKey] = map[string]interface{}{
			"or": states,
		}
	}
	if params.District != nil && !strings.EqualFold(*params.District, "ALL") {
		districts := strings.Split(strings.ToLower(*params.District), ",")

		filter[DistrictKey] = map[string]interface{}{
			"or": districts,
		}
	}
	if params.Type != nil && !strings.EqualFold(*params.Type, "ALL") {
		types := strings.Split(strings.ToLower(*params.Type), ",")

		filter[TypeKey] = map[string]interface{}{
			"or": types,
		}
	}
	if params.ProgramID != nil && !strings.EqualFold(*params.ProgramID, "ALL") {
		programIds := strings.Split(strings.ToLower(*params.ProgramID), ",")

		filter[ProgramIdKey] = map[string]interface{}{
			"or": programIds,
		}
	}
	if params.ProgramStatus != nil && !strings.EqualFold(*params.ProgramStatus, "ALL") {
		programStatus := strings.Split(strings.ToLower(*params.ProgramStatus), ",")

		filter[ProgramStatusKey] = map[string]interface{}{
			"or": programStatus,
		}
	}

	return filter
}

func getFacilitiesHandler(params operations.GetFacilitiesParams, principal *models.JWTClaimBody) middleware.Responder {
	entityTypeId := "Facility"
	filter := createFilterObject(params)
	response, err := kernelService.QueryRegistry(entityTypeId, filter)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return model.NewGenericServerError()
	}
	//if program status is inactive, query registry to get all entities without having program id.
	// Bcz initially a facility will not have a program id mapped
	responseArr := response[entityTypeId]
	if params.ProgramID != nil && params.ProgramStatus != nil && strings.Contains(strings.ToLower(*params.ProgramStatus), "inactive") {
		filter[ProgramIdKey] = map[string]interface{}{
			"neq": params.ProgramID,
		}
		delete(filter, ProgramStatusKey)
		response, err = kernelService.QueryRegistry(entityTypeId, filter)
		if err != nil {
			log.Errorf("Error in querying registry", err)
			return model.NewGenericServerError()
		}
		resp := response[entityTypeId]
		if resp != nil {
			responseArr = append(responseArr.([]interface{}), resp.([]interface{})...)
		}
	}
	return model.NewGenericJSONResponse(responseArr)
}

func createMedicineHandler(params operations.CreateMedicineParams, principal *models.JWTClaimBody) middleware.Responder {
	log.Infof("Create medicine %+v", params.Body)
	objectId := "Medicine"
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
	return kernelService.MakeRegistryCreateRequest(requestMap, objectId)
}

func createProgramHandler(params operations.CreateProgramParams, principal *models.JWTClaimBody) middleware.Responder {
	log.Infof("Create Program %+v", params.Body)
	objectId := "Program"
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
	return kernelService.MakeRegistryCreateRequest(requestMap, objectId)
}

func postEnrollmentsHandler(params operations.PostEnrollmentsParams, principal *models.JWTClaimBody) middleware.Responder {
	columns := strings.Split(config.Config.PreEnrollment.Upload.Columns, ",")
	log.Println(columns)
	data := NewScanner(params.File)
	_, fileHeader, _ := params.HTTPRequest.FormFile("file")
	fileName := fileHeader.Filename
	preferredUsername := principal.PreferredUsername
	preEnrollmentCSV := CSVUpload{PreEnrollmentCSV{
		CSVMetadata{
			Columns:  columns,
			Data:     &data,
			FileName: fileName,
			UserName: preferredUsername,
		},
	}}
	headerErrors := preEnrollmentCSV.ValidateHeaders()
	if headerErrors != nil {
		return operations.NewPostEnrollmentsBadRequest().WithPayload(headerErrors)
	}

	processError := ProcessCSV(preEnrollmentCSV, &data)
	defer params.File.Close()

	if processError != nil {
		return operations.NewPostEnrollmentsBadRequest().WithPayload(processError)
	}

	return operations.NewPostEnrollmentsOK()
}

func postFacilitiesHandler(params operations.PostFacilitiesParams, principal *models.JWTClaimBody) middleware.Responder {

	columns := strings.Split(config.Config.Facility.Upload.Columns, ",")
	data := NewScanner(params.File)
	_, fileHeader, _ := params.HTTPRequest.FormFile("file")
	fileName := fileHeader.Filename
	preferredUsername := principal.PreferredUsername
	facilityCSV := CSVUpload{FacilityCSV{
		CSVMetadata{
			Columns:  columns,
			Data:     &data,
			FileName: fileName,
			UserName: preferredUsername,
		},
	}}

	headerErrors := facilityCSV.ValidateHeaders()
	if headerErrors != nil {
		return operations.NewPostFacilitiesBadRequest().WithPayload(headerErrors)
	}

	processError := ProcessCSV(facilityCSV, &data)
	defer params.File.Close()

	if processError != nil {
		return operations.NewPostFacilitiesBadRequest().WithPayload(processError)
	}

	return operations.NewPostFacilitiesOK()
}

func postVaccinatorsHandler(params operations.PostVaccinatorsParams, principal *models.JWTClaimBody) middleware.Responder {

	columns := strings.Split(config.Config.Vaccinator.Upload.Columns, ",")
	log.Println(columns)
	data := NewScanner(params.File)
	_, fileHeader, _ := params.HTTPRequest.FormFile("file")
	fileName := fileHeader.Filename
	preferredUsername := principal.PreferredUsername
	vaccinatorCSV := CSVUpload{VaccinatorCSV{
		CSVMetadata{
			Columns:  columns,
			Data:     &data,
			FileName: fileName,
			UserName: preferredUsername,
		},
	}}
	headerErrors := vaccinatorCSV.ValidateHeaders()
	if headerErrors != nil {
		return operations.NewPostVaccinatorsBadRequest().WithPayload(headerErrors)
	}

	processError := ProcessCSV(vaccinatorCSV, &data)
	defer params.File.Close()

	if processError != nil {
		return operations.NewPostVaccinatorsBadRequest().WithPayload(processError)
	}

	return operations.NewPostVaccinatorsOK()
}

func createFacilityUserHandler(params operations.CreateFacilityUsersParams, principal *models.JWTClaimBody) middleware.Responder {
	err := CreateFacilityUser(params.Body, params.HTTPRequest.Header.Get("Authorization"))
	if err != nil {
		log.Error(err)
		return operations.NewCreateFacilityUsersBadRequest()
	}
	return operations.NewCreateFacilityUsersOK()
}

func getFacilityUserHandler(params operations.GetFacilityUsersParams, principal *models.JWTClaimBody) middleware.Responder {
	users, err := GetFacilityUsers(params.HTTPRequest.Header.Get("Authorization"))
	if err != nil {
		log.Error(err)
		return operations.NewCreateFacilityUsersBadRequest()
	}
	return &operations.GetFacilityUsersOK{Payload: users}
}

func getFacilityGroupHandler(params operations.GetFacilityGroupsParams, principal *models.JWTClaimBody) middleware.Responder {
	groups, err := GetFacilityGroups()
	if err != nil {
		log.Error(err)
		return operations.NewGetFacilityGroupsBadRequest()
	}
	return &operations.GetFacilityGroupsOK{Payload: groups}
}

func updateFacilitiesHandler(params operations.UpdateFacilitiesParams, principal *models.JWTClaimBody) middleware.Responder {
	for _, updateRequest := range params.Body {
		requestBody, err := json.Marshal(updateRequest)
		if err != nil {
			return operations.NewUpdateFacilitiesBadRequest()
		}
		requestMap := make(map[string]interface{})
		err = json.Unmarshal(requestBody, &requestMap)
		resp, err := kernelService.UpdateRegistry("Facility", requestMap)
		if err != nil {
			log.Error(err)
		} else {
			log.Print(resp)
		}
	}
	return operations.NewUpdateFacilitiesOK()
}

func getAnalyticsHandler(params operations.GetAnalyticsParams, principal *models.JWTClaimBody) middleware.Responder {
	return NewGenericJSONResponse(getAnalyticsInfo())
}

func getPublicAnalyticsHandler(params operations.GetPublicAnalyticsParams) middleware.Responder {
	return NewGenericJSONResponse(getPublicAnalyticsInfo())
}

func updateFacilityUserHandler(params operations.UpdateFacilityUserParams, principal *models.JWTClaimBody) middleware.Responder {
	if params.Body.ID == "" {
		log.Error("userId is not present in the body")
		return operations.NewUpdateFacilityUserBadRequest()
	}
	err := UpdateFacilityUser(params.Body, params.HTTPRequest.Header.Get("Authorization"))
	if err != nil {
		log.Error(err)
		return operations.NewUpdateFacilityUserBadRequest()
	}
	return operations.NewUpdateFacilityUserOK()
}

func getFacilityUploadHandler(params operations.GetFacilityUploadsParams, principal *models.JWTClaimBody) middleware.Responder {
	preferredUsername := principal.PreferredUsername
	facilityUploads, err := db.GetFacilityUploadsForUser(preferredUsername)
	if err == nil {
		return NewGenericJSONResponse(facilityUploads)
	}
	return NewGenericServerError()
}

func getFacilityUploadErrorsHandler(params operations.GetFacilityUploadsErrorsParams, principal *models.JWTClaimBody) middleware.Responder {
	uploadID := params.UploadID
	preferredUsername := principal.PreferredUsername
	columns := strings.Split(config.Config.Facility.Upload.Columns, ",")

	facilityUpload := GetCSVUpload{
		UploadType: "Facility",
		UserId:     preferredUsername,
		Columns:    columns,
	}
	return facilityUpload.GetCSVUploadErrors(uploadID)
}

func getEnrollmentUploadHandler(params operations.GetEnrollmentUploadHistoryParams, principal *models.JWTClaimBody) middleware.Responder {
	preferredUsername := principal.PreferredUsername
	columns := strings.Split(config.Config.Facility.Upload.Columns, ",")

	preEnrollmentUpload := GetCSVUpload{
		UploadType: "PreEnrollment",
		UserId:     preferredUsername,
		Columns:    columns,
	}
	csvUpload, err := preEnrollmentUpload.GetCSVUploadsForUser()
	if err == nil {
		return NewGenericJSONResponse(csvUpload)
	}
	return NewGenericServerError()
}

func getPreEnrollmentUploadErrorsHandler(params operations.GetEnrollmentsUploadsErrorsParams, principal *models.JWTClaimBody) middleware.Responder {
	uploadID := params.UploadID
	preferredUsername := principal.PreferredUsername
	columns := strings.Split(config.Config.PreEnrollment.Upload.Columns, ",")

	preEnrollmentUpload := GetCSVUpload{
		UploadType: "PreEnrollment",
		UserId:     preferredUsername,
		Columns:    columns,
	}
	return preEnrollmentUpload.GetCSVUploadErrors(uploadID)
}

func getVaccinatorUploadHandler(params operations.GetVaccinatorsUploadHistoryParams, principal *models.JWTClaimBody) middleware.Responder {
	preferredUsername := principal.PreferredUsername
	columns := strings.Split(config.Config.Vaccinator.Upload.Columns, ",")

	vaccinatorUpload := GetCSVUpload{
		UploadType: "Vaccinator",
		UserId:     preferredUsername,
		Columns:    columns,
	}
	csvUpload, err := vaccinatorUpload.GetCSVUploadsForUser()
	if err == nil {
		return NewGenericJSONResponse(csvUpload)
	}
	return NewGenericServerError()
}

func getVaccinatorUploadErrorsHandler(params operations.GetVaccinatorsUploadsErrorsParams, principal *models.JWTClaimBody) middleware.Responder {
	uploadID := params.UploadID
	preferredUsername := principal.PreferredUsername
	columns := strings.Split(config.Config.Vaccinator.Upload.Columns, ",")

	vaccinatorUpload := GetCSVUpload{
		UploadType: "Vaccinator",
		UserId:     preferredUsername,
		Columns:    columns,
	}
	return vaccinatorUpload.GetCSVUploadErrors(uploadID)
}

func deleteFacilityUserHandler(params operations.DeleteFacilityUserParams, principal *models.JWTClaimBody) middleware.Responder {
	err := DeleteFacilityUser(params.UserID)
	if err != nil {
		log.Error(err)
		return operations.NewDeleteFacilityUserBadRequest()
	}
	return operations.NewDeleteFacilityUserOK()
}

func createVaccinatorHandler(params operations.CreateVaccinatorParams, principal *models.JWTClaimBody) middleware.Responder {
	err := kernelService.CreateNewRegistry(params.Body, "Vaccinator")
	if err != nil {
		log.Error(err)
		return operations.NewCreateVaccinatorBadRequest()
	}
	return operations.NewCreateVaccinatorOK()
}
