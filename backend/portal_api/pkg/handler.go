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
	"time"
)

const StateKey = "address.state"
const DistrictKey = "address.district"
const TypeKey = "category"
const ProgramIdKey = "programs.programId"
const ProgramStatusKey = "programs.status"
const FacilityCodeKey = "facilityCode"
const ProgramRateUpdatedAtKey = "programs.rateUpdatedAt"

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
	api.UpdateVaccinatorsHandler = operations.UpdateVaccinatorsHandlerFunc(updateVaccinatorsHandlerV2)
	api.GetUserFacilityHandler = operations.GetUserFacilityHandlerFunc(getUserFacilityDetails)
	api.UpdateProgramHandler = operations.UpdateProgramHandlerFunc(updateProgramsHandler)
	api.UpdateMedicineHandler = operations.UpdateMedicineHandlerFunc(updateMedicineHandler)
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
	entityTypeId := "Vaccinator"
	filter := map[string]interface{}{}

	if HasResourceRole(portalClientId, "admin", principal) {
		return kernelService.GetEntityType(entityTypeId)
	} else if HasResourceRole(portalClientId, "facility-admin", principal) {
		if params.FacilityCode != nil && !strings.EqualFold(*params.FacilityCode, "ALL") {
			filter["facilityIds"] = map[string]interface{}{
				"contains": params.FacilityCode,
			}
		} else if params.FacilityCode == nil {
			if principal.FacilityCode == "" {
				log.Errorf("Error facility code not mapped for the login %s", principal.PreferredUsername)
				return NewGenericServerError()
			}
			filter["facilityIds"] = map[string]interface{}{
				"contains": principal.FacilityCode,
			}
		}
	} else {
		// for others uses adding facilityCode from principal
		if principal.FacilityCode == "" {
			log.Errorf("Error facility code not mapped for the login %s", principal.PreferredUsername)
			return NewGenericServerError()
		}
		filter["facilityIds"] = map[string]interface{}{
			"contains": principal.FacilityCode,
		}
	}

	if params.Name != nil && !strings.EqualFold(*params.Name, "ALL") {
		filter["name"] = map[string]interface{}{
			"startsWith": params.Name,
		}
	}
	limit, offset := getLimitAndOffset(params.Limit, params.Offset)
	response, err := kernelService.QueryRegistry(entityTypeId, filter, limit, offset)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return model.NewGenericServerError()
	}
	responseArr := response[entityTypeId]
	return model.NewGenericJSONResponse(responseArr)
}

func createFilterObject(params operations.GetFacilitiesParams) map[string]interface{} {
	filter := map[string]interface{}{}
	addQueryParamToFilter(params.State, filter, StateKey)
	addQueryParamToFilter(params.District, filter, DistrictKey)
	addQueryParamToFilter(params.Type, filter, TypeKey)
	addQueryParamToFilter(params.ProgramID, filter, ProgramIdKey)
	addQueryParamToFilter(params.ProgramStatus, filter, ProgramStatusKey)
	if params.RateUpdatedFrom != nil && params.RateUpdatedTo != nil {
		filter[ProgramRateUpdatedAtKey] = map[string]interface{}{
			"between": []string{*params.RateUpdatedFrom, *params.RateUpdatedTo},
		}
	}
	return filter
}

func addQueryParamToFilter(param *string, filter map[string]interface{}, filterKey string) {
	if param != nil && !strings.EqualFold(*param, "ALL") {
		values := strings.Split(strings.ToLower(*param), ",")
		filter[filterKey] = map[string]interface{}{
			"or": values,
		}
	}
}

func getLimitAndOffset(limitValue *float64, offsetValue *float64) (int, int){
	limit := config.Config.SearchRegistry.DefaultLimit
	offset := config.Config.SearchRegistry.DefaultOffset
	if limitValue != nil {
		limit = int(*limitValue)
	}
	if offsetValue != nil {
		offset = int(*offsetValue)
	}
	return limit, offset
}

func getFacilitiesHandler(params operations.GetFacilitiesParams, principal *models.JWTClaimBody) middleware.Responder {
	entityTypeId := "Facility"
	filter := createFilterObject(params)
	if HasResourceRole(portalClientId, "facility-admin", principal) {
		filter[FacilityCodeKey] = map[string]interface{}{
			"eq": principal.FacilityCode,
		}
	}
	limit, offset := getLimitAndOffset(params.Limit, params.Offset)
	response, err := kernelService.QueryRegistry(entityTypeId, filter, limit, offset)
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
		response, err = kernelService.QueryRegistry(entityTypeId, filter, limit, offset)
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


func updateProgramsHandler(params operations.UpdateProgramParams, principal *models.JWTClaimBody) middleware.Responder {
	log.Infof("Update Program %+v", params.Body)
	objectId := "Program"
	requestBody, err := json.Marshal(params.Body)
	if err != nil {
		return operations.NewUpdateProgramBadRequest()
	}
	requestMap := make(map[string]interface{})
	err = json.Unmarshal(requestBody, &requestMap)
	if err != nil {
		log.Info(err)
		return NewGenericServerError()
	}
	resp, err := kernelService.UpdateRegistry(objectId, requestMap)
	if err != nil {
		log.Error(err)
		return operations.NewUpdateProgramBadRequest()
	} else {
		log.Print(resp)
		return NewGenericStatusOk()
	}
}


func updateMedicineHandler(params operations.UpdateMedicineParams, principal *models.JWTClaimBody) middleware.Responder {
	log.Infof("Update Medicine %+v", params.Body)
	objectId := "Medicine"
	requestBody, err := json.Marshal(params.Body)
	if err != nil {
		return operations.NewUpdateMedicineBadRequest()
	}
	requestMap := make(map[string]interface{})
	err = json.Unmarshal(requestBody, &requestMap)
	if err != nil {
		log.Info(err)
		return NewGenericServerError()
	}
	resp, err := kernelService.UpdateRegistry(objectId, requestMap)
	if err != nil {
		log.Error(err)
		return operations.NewUpdateMedicineBadRequest()
	} else {
		log.Print(resp)
		return NewGenericStatusOk()
	}
}

func postEnrollmentsHandler(params operations.PostEnrollmentsParams, principal *models.JWTClaimBody) middleware.Responder {
	columns := strings.Split(config.Config.PreEnrollment.Upload.Columns, ",")
	log.Println(columns)
	data := NewScanner(params.File)
	_, fileHeader, _ := params.HTTPRequest.FormFile("file")
	fileName := fileHeader.Filename
	preferredUsername := principal.PreferredUsername
	preEnrollmentCSV := CSVUpload{PreEnrollmentCSV{
		CSVMetadata: CSVMetadata{
			Columns:  columns,
			Data:     &data,
			FileName: fileName,
			UserName: preferredUsername,
		},
		ProgramId: *params.ProgramID,
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
		if updateRequest.Osid == "" {
			log.Errorf("Facility update request without OSID %v", updateRequest)
			continue
		}
		searchRespone, err := kernelService.ReadRegistry("Facility", updateRequest.Osid)
		if err == nil {
			facility := searchRespone["Facility"].(map[string]interface{})
			if facility != nil {
				updatedFacility := updateFacilityProgramsData(facility, updateRequest)
				resp, err := kernelService.UpdateRegistry("Facility", updatedFacility)
				if err != nil {
					log.Error(err)
				} else {
					log.Print(resp)
				}
			}
		} else {
			log.Errorf("Finding facility for id %s failed", updateRequest.Osid, err)
		}
	}
	return operations.NewUpdateFacilitiesOK()
}

func updateFacilityProgramsData(facility map[string]interface{}, updateRequest *models.FacilityUpdateRequestItems0) map[string]interface{} {
	currentPrograms := facility["programs"].([]interface{})
	var programsTobeUpdated []map[string]interface{}
	updateFacility := map[string]interface{}{
		"osid":     updateRequest.Osid,
		"programs": []interface{}{},
	}
	if len(currentPrograms) == 0 {
		for _, program := range updateRequest.Programs {
			programsTobeUpdated = append(programsTobeUpdated, map[string]interface{}{
				"programId":       program.ID,
				"status":          program.Status,
				"rate":            program.Rate,
				"statusUpdatedAt": time.Now().Format(time.RFC3339),
				"rateUpdatedAt":   time.Now().Format(time.RFC3339),
			})
		}
	} else {
		for _, obj := range currentPrograms {
			facilityProgram := obj.(map[string]interface{})
			programsTobeUpdated = append(programsTobeUpdated, facilityProgram)
		}
		for _, updateProgram := range updateRequest.Programs {
			existingProgram := false
			for _, facilityProgram := range programsTobeUpdated {
				if updateProgram.ID == facilityProgram["programId"].(string) {
					if updateProgram.Status != "" && updateProgram.Status != facilityProgram["status"].(string) {
						facilityProgram["status"] = updateProgram.Status
						facilityProgram["statusUpdatedAt"] = time.Now().Format(time.RFC3339)
						services.NotifyFacilityUpdate("status", updateProgram.Status,
							facility["contact"].(string), facility["email"].(string))
					}
					if updateProgram.Rate != 0 && updateProgram.Rate != facilityProgram["rate"].(float64) {
						facilityProgram["rate"] = updateProgram.Rate
						facilityProgram["rateUpdatedAt"] = time.Now().Format(time.RFC3339)
						services.NotifyFacilityUpdate("rate", ToString(updateProgram.Rate),
							facility["contact"].(string), facility["email"].(string))
					}
					existingProgram = true
					break
				}
			}
			if !existingProgram {
				programsTobeUpdated = append(programsTobeUpdated, map[string]interface{}{
					"programId":       updateProgram.ID,
					"status":          updateProgram.Status,
					"rate":            updateProgram.Rate,
					"statusUpdatedAt": time.Now().Format(time.RFC3339),
					"rateUpdatedAt":   time.Now().Format(time.RFC3339),
				})
			}
		}

	}
	updateFacility["programs"] = programsTobeUpdated
	return updateFacility
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
	facilityCode := principal.FacilityCode
	vaccinator := params.Body
	vaccinator.FacilityIds = []string{facilityCode}
	err := kernelService.CreateNewRegistry(vaccinator, "Vaccinator")
	if err != nil {
		log.Error(err)
		return operations.NewCreateVaccinatorBadRequest()
	}
	return operations.NewCreateVaccinatorOK()
}

func updateVaccinatorsHandler(params operations.UpdateVaccinatorsParams, principal *models.JWTClaimBody) middleware.Responder {
	for _, updateRequest := range params.Body {
		requestBody, err := json.Marshal(updateRequest)
		if err != nil {
			log.Error(err)
			return operations.NewUpdateVaccinatorsBadRequest()
		}
		requestMap := make(map[string]interface{})
		err = json.Unmarshal(requestBody, &requestMap)
		if requestMap["facilityIds"] == nil {
			delete(requestMap, "facilityIds")
		}
		if requestMap["programs"] == nil {
			delete(requestMap, "programs")
		}
		resp, err := kernelService.UpdateRegistry("Vaccinator", requestMap)
		if err != nil {
			log.Error(err)
			return operations.NewUpdateVaccinatorsBadRequest()
		} else {
			log.Print(resp)
		}
	}
	return operations.NewUpdateVaccinatorsOK()
}

func updateVaccinatorsHandlerV2(params operations.UpdateVaccinatorsParams, principal *models.JWTClaimBody) middleware.Responder {
	for _, updateRequest := range params.Body {
		if *updateRequest.Osid == "" {
			log.Errorf("Vaccinator update request without OSID %v", updateRequest)
			return operations.NewUpdateVaccinatorsBadRequest()
		}

		searchResponse, err := kernelService.ReadRegistry("Vaccinator", *updateRequest.Osid)
		if err == nil {
			vaccinator := searchResponse["Vaccinator"].(map[string]interface{})
			if vaccinator != nil {
				currentPrograms := vaccinator["programs"].([]interface{})
				var programsTobeUpdated []map[string]interface{}
				var updateVaccinator map[string]interface{}
				e := convertStructToInterface(updateRequest, &updateVaccinator)
				if e != nil {
					log.Errorf("Error which converting to Interface %+v", updateRequest)
					return NewGenericServerError()
				}
				if len(currentPrograms) == 0 {
					for _, program := range updateRequest.Programs {
						programsTobeUpdated = append(programsTobeUpdated, map[string]interface{}{
							"programId":          program.ProgramID,
							"status":             program.Status,
							"certified":          program.Certified,
							"statusUpdatedAt":    time.Now().Format(time.RFC3339),
							"certifiedUpdatedAt": time.Now().Format(time.RFC3339),
						})
					}
				} else {
					for _, obj := range currentPrograms {
						vaccinatorProgram := obj.(map[string]interface{})
						programsTobeUpdated = append(programsTobeUpdated, vaccinatorProgram)
					}
					for _, updateProgram := range updateRequest.Programs {
						existingProgram := false
						for _, vaccinatorProgram := range programsTobeUpdated {
							if updateProgram.ProgramID == vaccinatorProgram["programId"].(string) {
								if updateProgram.Status != "" && updateProgram.Status != vaccinatorProgram["status"].(string) {
									vaccinatorProgram["status"] = updateProgram.Status
									vaccinatorProgram["statusUpdatedAt"] = time.Now().Format(time.RFC3339)
								}
								if updateProgram.Certified != vaccinatorProgram["certified"].(bool) {
									vaccinatorProgram["certified"] = updateProgram.Certified
									vaccinatorProgram["certifiedUpdatedAt"] = time.Now().Format(time.RFC3339)
								}
								existingProgram = true
							}
						}
						if !existingProgram {
							programsTobeUpdated = append(programsTobeUpdated, map[string]interface{}{
								"programId":            updateProgram.ProgramID,
								"status":               updateProgram.Status,
								"certified":            updateProgram.Certified,
								"statusUpdatedAt":      time.Now().Format(time.RFC3339),
								"certifiedUpdatedAt":   time.Now().Format(time.RFC3339),
							})
						}
					}

				}
				updateVaccinator["programs"] = programsTobeUpdated
				resp, err := kernelService.UpdateRegistry("Vaccinator", updateVaccinator)
				if err != nil {
					log.Error(err)
				} else {
					log.Print(resp)
				}
			}
		} else {
			log.Errorf("Finding Vaccinator for id %s failed", updateRequest.Osid, err)
			return operations.NewUpdateVaccinatorsBadRequest()
		}
	}
	return operations.NewUpdateVaccinatorsOK()
}

func getUserFacilityDetails(params operations.GetUserFacilityParams, claimBody *models.JWTClaimBody) middleware.Responder {
	entityTypeId := "Facility"
	if claimBody != nil {
		limit, offset := getLimitAndOffset(nil, nil)
		response, err := services.GetFacilityByCode(claimBody.FacilityCode, limit, offset)
		if err != nil {
			log.Errorf("Error in querying registry", err)
			return model.NewGenericServerError()
		}
		responseArr := response[entityTypeId]
		return model.NewGenericJSONResponse(responseArr)
	} else {
		return NewGenericForbiddenError()
	}
}
