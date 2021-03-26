package pkg

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/divoc/portal-api/pkg/utils"

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
)

const StateKey = "address.state"
const DistrictKey = "address.district"
const TypeKey = "category"
const ProgramIdKey = "programs.programId"
const ProgramStatusKey = "programs.status"
const FacilityCodeKey = "facilityCode"
const ProgramRateUpdatedAtKey = "programs.rateUpdatedAt"
const FacilityPincodekey = "address.pincode"

func SetupHandlers(api *operations.DivocPortalAPIAPI) {
	api.CreateMedicineHandler = operations.CreateMedicineHandlerFunc(createMedicineHandler)
	api.CreateProgramHandler = operations.CreateProgramHandlerFunc(createProgramHandler)
	api.PostFacilitiesHandler = operations.PostFacilitiesHandlerFunc(postFacilitiesHandler)
	api.PostVaccinatorsHandler = operations.PostVaccinatorsHandlerFunc(postVaccinatorsHandler)
	api.GetFacilitiesHandler = operations.GetFacilitiesHandlerFunc(getFacilitiesHandler)
	api.GetFacilitiesForPublicHandler = operations.GetFacilitiesForPublicHandlerFunc(getFacilitiesForPublic)
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
	api.NotifyFacilitiesHandler = operations.NotifyFacilitiesHandlerFunc(services.NotifyFacilities)
	api.UpdateFacilityUserHandler = operations.UpdateFacilityUserHandlerFunc(updateFacilityUserHandler)
	api.DeleteFacilityUserHandler = operations.DeleteFacilityUserHandlerFunc(deleteFacilityUserHandler)
	api.CreateVaccinatorHandler = operations.CreateVaccinatorHandlerFunc(createVaccinatorHandler)
	api.UpdateVaccinatorsHandler = operations.UpdateVaccinatorsHandlerFunc(updateVaccinatorsHandlerV2)
	api.GetUserFacilityHandler = operations.GetUserFacilityHandlerFunc(getUserFacilityDetails)
	api.UpdateProgramHandler = operations.UpdateProgramHandlerFunc(updateProgramsHandler)
	api.UpdateMedicineHandler = operations.UpdateMedicineHandlerFunc(updateMedicineHandler)
	api.ConfigureSlotFacilityHandler = operations.ConfigureSlotFacilityHandlerFunc(createSlotForProgramFacilityHandler)
	api.GetFacilityProgramScheduleHandler = operations.GetFacilityProgramScheduleHandlerFunc(getFacilityProgramScheduleHandler)
	api.UpdateFacilityProgramScheduleHandler = operations.UpdateFacilityProgramScheduleHandlerFunc(updateFacilityProgramScheduleHandler)
	api.GetProgramsForPublicHandler = operations.GetProgramsForPublicHandlerFunc(getProgramsForPublic)
	api.GetFacilitySchedulesHandler = operations.GetFacilitySchedulesHandlerFunc(getFacilitySchedules)
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
		filter := map[string]interface{}{}
		response, err := kernelService.QueryRegistry(entityTypeId, filter, 100, 0)
		if err != nil {
			log.Errorf("Error in querying registry", err)
			return model.NewGenericServerError()
		}
		results := enrichResponseWithProgramDetails(response[entityTypeId])
		return model.NewGenericJSONResponse(results)
	} else if HasResourceRole(portalClientId, "controller", principal) {
		if params.FacilityCode == nil {
			return NewGenericForbiddenError()
		} else {
			filter["facilityIds"] = map[string]interface{}{
				"contains": params.FacilityCode,
			}
		}
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
			"contains": params.Name,
		}
	}
	limit, offset := getLimitAndOffset(params.Limit, params.Offset)
	response, err := kernelService.QueryRegistry(entityTypeId, filter, limit, offset)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return model.NewGenericServerError()
	}
	responseArr := response[entityTypeId]
	results := enrichResponseWithProgramDetails(responseArr)
	return model.NewGenericJSONResponse(results)
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
		values := strings.Split(*param, ",")
		filter[filterKey] = map[string]interface{}{
			"or": values,
		}
	}
}

func getLimitAndOffset(limitValue *float64, offsetValue *float64) (int, int) {
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

func getFacilitiesForPublic(params operations.GetFacilitiesForPublicParams) middleware.Responder {
	entityType := "Facility"
	filter := make(map[string]interface{})
	if params.Pincode != nil {
		filter[FacilityPincodekey] = map[string]interface{}{
			"startsWith": *params.Pincode,
		}
	}
	limit, offset := getLimitAndOffset(params.Limit, params.Offset)
	response, err := kernelService.QueryRegistry(entityType, filter, limit, offset)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return model.NewGenericServerError()
	}
	facilitiesRespStr, err := json.Marshal(response[entityType])
	if err != nil {
		log.Errorf("Error reading registry response", err)
		return model.NewGenericServerError()
	}

	var facilities []models.PublicFacility
	if err := json.Unmarshal(facilitiesRespStr, &facilities); err != nil {
		log.Errorf("Error parsing registry response", err)
		return model.NewGenericServerError()
	}
	facilitySlots := make([]interface{}, 0)
	for _, facility := range facilities {
		filter = map[string]interface{}{
			"facilityId": map[string]interface{}{
				"eq": facility.Osid,
			},
		}
		facilitySlotsResponse, err2 := kernelService.QueryRegistry("FacilityProgramSlot", filter, limit, offset)
		facilitySchedules := facilitySlotsResponse["FacilityProgramSlot"].([]interface{})
		if err2 == nil && len(facilitySchedules) > 0 {
			for _, facilitySchedule := range facilitySchedules {
				facilitySlots = append(facilitySlots, facilitySchedule)
			}
		}
	}
	responseData := map[string]interface{}{
		"facilities":         facilities,
		"facilitiesSchedule": facilitySlots,
	}
	return model.NewGenericJSONResponse(responseData)
}

func getFacilitiesHandler(params operations.GetFacilitiesParams, principal *models.JWTClaimBody) middleware.Responder {
	entityTypeId := "Facility"
	filter := createFilterObject(params)
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
	results := enrichResponseWithProgramDetails(responseArr)
	return model.NewGenericJSONResponse(results)
}

func createMedicineHandler(params operations.CreateMedicineParams, principal *models.JWTClaimBody) middleware.Responder {
	if !utils.ValidateMedicineIntervals(params.Body) {
		return operations.NewCreateMedicineBadRequest()
	}
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
	if !utils.ValidateProgramDates(params.Body) {
		return operations.NewCreateProgramBadRequest()
	}
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
	if !utils.ValidateProgramDates(&params.Body.ProgramRequest) {
		return operations.NewUpdateProgramBadRequest()
	}
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
	if !utils.ValidateMedicineIntervals(&params.Body.Medicine) {
		return operations.NewUpdateMedicineBadRequest()
	}
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

	ProcessCSV(preEnrollmentCSV, &data)
	defer params.File.Close()
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

	ProcessCSV(facilityCSV, &data)
	defer params.File.Close()
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

	ProcessCSV(vaccinatorCSV, &data)
	defer params.File.Close()
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
	var users []*models.FacilityUser
	var err error
	if HasResourceRole(portalClientId, "facility-admin", principal) {
		users, err = GetFacilityUsers(params.HTTPRequest.Header.Get("Authorization"))
	} else if HasResourceRole(portalClientId, "controller", principal) && params.FacilityCode != nil {
		users, err = GetUsersByFacilityCode(*params.FacilityCode)
	} else {
		return operations.NewCreateFacilityUsersBadRequest()
	}
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
		searchResponse, err := kernelService.ReadRegistry("Facility", updateRequest.Osid)
		if err == nil {
			facility := searchResponse["Facility"].(map[string]interface{})
			if facility != nil {
				updatedFacility := updateFacilityProgramsData(facility, updateRequest)
				addressOsid := (facility["address"].(map[string]interface{}))["osid"]
				if updateRequest.Address != nil {
					updatedFacility["address"] = map[string]interface{}{
						"osid":         addressOsid,
						"addressLine1": *updateRequest.Address.AddressLine1,
						"addressLine2": *updateRequest.Address.AddressLine2,
						"district":     *updateRequest.Address.District,
						"state":        *updateRequest.Address.State,
						"pincode":      *updateRequest.Address.Pincode,
					}
				}
				utils.SetMapValueIfNotEmpty(updatedFacility, "facilityName", updateRequest.FacilityName)
				utils.SetMapValueIfNotEmpty(updatedFacility, "geoLocation", updateRequest.GeoLocation)
				utils.SetMapValueIfNotEmpty(updatedFacility, "websiteUrl", updateRequest.WebsiteURL)
				utils.SetMapValueIfNotEmpty(updatedFacility, "email", updateRequest.Email)
				utils.SetMapValueIfNotEmpty(updatedFacility, "contact", updateRequest.Contact)
				utils.SetMapValueIfNotEmpty(updatedFacility, "operatingHourStart", updateRequest.OperatingHourStart)
				utils.SetMapValueIfNotEmpty(updatedFacility, "operatingHourEnd", updateRequest.OperatingHourEnd)
				utils.SetMapValueIfNotEmpty(updatedFacility, "category", updateRequest.Category)
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

	mkSchedule := func(p models.FacilityUpdateRequestItems0ProgramsItems0Schedule) map[string]interface{} {
		s := map[string]interface{}{}
		utils.SetMapValueIfNotEmpty(s, "startTime", p.StartTime)
		utils.SetMapValueIfNotEmpty(s, "endTime", p.EndTime)
		if len(p.Days) > 0 {
			s["days"] = p.Days
		}
		return s
	}

	mkProgram := func(p *models.FacilityUpdateRequestItems0ProgramsItems0) map[string]interface{} {
		newP := map[string]interface{}{
			"programId":       p.ID,
			"status":          p.Status,
			"rate":            p.Rate,
			"statusUpdatedAt": time.Now().Format(time.RFC3339),
			"rateUpdatedAt":   time.Now().Format(time.RFC3339),
		}
		if p.Schedule != nil {
			newP["schedule"] = mkSchedule(*p.Schedule)
		}
		return newP
	}

	currentPrograms, ok := facility["programs"].([]interface{})
	if !ok {
		currentPrograms = []interface{}{}
	}
	var newPrograms []map[string]interface{}
	var programsTobeUpdated []map[string]interface{}

	for _, obj := range currentPrograms {
		facilityProgram := obj.(map[string]interface{})
		programsTobeUpdated = append(programsTobeUpdated, facilityProgram)
	}

	for _, updateProgram := range updateRequest.Programs {
		existingProgram := false
		for _, facilityProgram := range programsTobeUpdated {
			if updateProgram.ID == facilityProgram["programId"].(string) {

				var facilityContact string
				if facility["contact"] != nil {
					facilityContact = facility["contact"].(string)
				}
				var facilityEmail string
				if facility["email"] != nil {
					facilityEmail = facility["email"].(string)
				}

				if updateProgram.Status != "" && updateProgram.Status != facilityProgram["status"].(string) {
					facilityProgram["status"] = updateProgram.Status
					facilityProgram["statusUpdatedAt"] = time.Now().Format(time.RFC3339)
					services.NotifyFacilityUpdate("status", updateProgram.Status, facilityContact, facilityEmail)
				}
				if updateProgram.Rate != 0 && updateProgram.Rate != facilityProgram["rate"].(float64) {
					facilityProgram["rate"] = updateProgram.Rate
					facilityProgram["rateUpdatedAt"] = time.Now().Format(time.RFC3339)
					services.NotifyFacilityUpdate("rate", utils.ToString(updateProgram.Rate), facilityContact, facilityEmail)
				}
				if updateProgram.Schedule != nil {
					facilityProgram["schedule"] = mkSchedule(*updateProgram.Schedule)
				}
				existingProgram = true
				break
			}
		}
		if !existingProgram {
			newPrograms = append(newPrograms, mkProgram(updateProgram))
		}
	}
	return map[string]interface{}{
		"osid":     updateRequest.Osid,
		"programs": append(programsTobeUpdated, newPrograms...),
	}
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

	var facilityCode string
	if HasResourceRole(portalClientId, "facility-admin", principal) {
		facilityCode = principal.FacilityCode
	} else if HasResourceRole(portalClientId, "controller", principal) {
		facilityCode = params.Body.FacilityCode
	}
	if facilityCode == "" {
		return NewGenericForbiddenError()
	}

	err := UpdateFacilityUser(&params.Body.FacilityUser, params.HTTPRequest.Header.Get("Authorization"), facilityCode)
	if err != nil {
		log.Error(err)
		return operations.NewUpdateFacilityUserBadRequest()
	}
	return operations.NewUpdateFacilityUserOK()
}

func getFacilityUploadHandler(params operations.GetFacilityUploadsParams, principal *models.JWTClaimBody) middleware.Responder {
	preferredUsername := principal.PreferredUsername
	facilityUploads, err := db.GetUploadsForUser(preferredUsername, "Facility")
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
	_, err := kernelService.CreateNewRegistry(vaccinator, "Vaccinator")
	if err != nil {
		log.Error(err)
		return operations.NewCreateVaccinatorBadRequest()
	}
	return operations.NewCreateVaccinatorOK()
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
				e := utils.ConvertStructToInterface(updateRequest, &updateVaccinator)
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
								"programId":          updateProgram.ProgramID,
								"status":             updateProgram.Status,
								"certified":          updateProgram.Certified,
								"statusUpdatedAt":    time.Now().Format(time.RFC3339),
								"certifiedUpdatedAt": time.Now().Format(time.RFC3339),
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
		results := enrichResponseWithProgramDetails(responseArr)
		return model.NewGenericJSONResponse(results)
	} else {
		return NewGenericForbiddenError()
	}
}

func enrichResponseWithProgramDetails(response interface{}) []interface{} {
	responseArr := response.([]interface{})
	if responseArr == nil || len(responseArr) == 0 {
		return []interface{}{}
	}
	limit, offset := getLimitAndOffset(nil, nil)
	var results []interface{}

	for _, objects := range responseArr {
		obj := objects.(map[string]interface{})
		if programs, ok := obj["programs"].([]interface{}); ok {
			updatedPrograms := []interface{}{}
			if programs != nil && len(programs) > 0 {
				for _, obj := range programs {
					program := obj.(map[string]interface{})
					id := program["programId"].(string)
					response, err := getProgramById(id, limit, offset)
					if err != nil {
						log.Errorf("Error in querying registry to get program for id %d %+v", id, err)
					} else {
						responseArr := response["Program"].([]interface{})
						if len(responseArr) != 0 {
							program["name"] = responseArr[0].(map[string]interface{})["name"]
							updatedPrograms = append(updatedPrograms, program)
						}
					}
				}
				obj["programs"] = updatedPrograms
			}
			results = append(results, obj)
		}
	}
	return results
}

func getProgramById(osid string, limit int, offset int) (map[string]interface{}, error) {
	filter := map[string]interface{}{
		"osid": map[string]interface{}{
			"eq": osid,
		},
	}
	return kernelService.QueryRegistry("Program", filter, limit, offset)
}

func createSlotForProgramFacilityHandler(params operations.ConfigureSlotFacilityParams, principal *models.JWTClaimBody) middleware.Responder {
	responder, e := validateIfUserHasPermissionsForFacilityProgram(params.FacilityID, params.ProgramID, principal)
	if e {
		return responder
	}

	var appointmentSchedule []*models.FacilityAppointmentSchedule
	var walkInSchedule []*models.FacilityWalkInSchedule

	if params.Body.AppointmentSchedule != nil {
		appointmentSchedule = params.Body.AppointmentSchedule
	} else {
		appointmentSchedule = make([]*models.FacilityAppointmentSchedule, 0)
	}

	if params.Body.WalkInSchedule != nil {
		walkInSchedule = params.Body.WalkInSchedule
	} else {
		walkInSchedule = make([]*models.FacilityWalkInSchedule, 0)
	}

	facilityProgramSlot := models.FacilityConfigureSlot{
		FacilityID:          params.FacilityID,
		ProgramID:           params.ProgramID,
		AppointmentSchedule: appointmentSchedule,
		WalkInSchedule:      walkInSchedule,
	}
	_, err := kernelService.CreateNewRegistry(facilityProgramSlot, "FacilityProgramSlot")
	if err != nil {
		log.Error(err)
		return operations.NewConfigureSlotFacilityBadRequest()
	}
	return operations.NewConfigureSlotFacilityOK()
}

func validateIfUserHasPermissionsForFacilityProgram(facilityId string, programId string, principal *models.JWTClaimBody) (middleware.Responder, bool) {
	resp, e := kernelService.ReadRegistry("Facility", facilityId)
	if e != nil {
		log.Infof("Facility for given osid doesn't exist %d", facilityId)
		return operations.NewConfigureSlotFacilityBadRequest(), true
	}
	facility, ok := resp["Facility"].(map[string]interface{})
	if !ok {
		log.Errorf("Error reading registry response", e)
		return model.NewGenericServerError(), true
	}
	if facility["facilityCode"] != principal.FacilityCode {
		log.Infof("User doesnt belong to the facility which is being updated")
		return operations.NewConfigureSlotFacilityUnauthorized(), true
	}

	currentPrograms, ok := facility["programs"].([]interface{})
	if !ok {
		log.Infof("No programs exist for given facility %s", principal.FacilityCode)
		return operations.NewConfigureSlotFacilityBadRequest(), true
	}
	hasGivenProgram := false
	for _, p := range currentPrograms {
		prg, ok := p.(map[string]interface{})
		if !ok {
			log.Errorf("Error converting program to interface", e)
			return model.NewGenericServerError(), true
		}
		if prg["programId"] == programId {
			hasGivenProgram = true
		}
	}
	if !hasGivenProgram {
		log.Infof("Given program %s doesn't exist for facility %s", programId, principal.FacilityCode)
		return operations.NewConfigureSlotFacilityBadRequest(), true
	}
	return nil, false
}

func getFacilityProgramScheduleHandler(params operations.GetFacilityProgramScheduleParams, principal *models.JWTClaimBody) middleware.Responder {
	appointmentScheduleKey := "appointmentSchedule"
	responder, e := validateIfUserHasPermissionsForFacilityProgram(params.FacilityID, params.ProgramID, principal)
	if e {
		return responder
	}
	response, err := getFacilityProgramSchedule(params.FacilityID, params.ProgramID)

	// sort the appointment schedules
	appointmentSchedules := response[appointmentScheduleKey].([]interface{})
	sort.Slice(appointmentSchedules, func(i, j int) bool {
		return appointmentSchedules[i].(map[string]interface{})["startTime"].(string) < appointmentSchedules[j].(map[string]interface{})["startTime"].(string)
	})
	response[appointmentScheduleKey] = appointmentSchedules
	if err != nil {
		return operations.NewGetFacilityProgramScheduleNotFound()
	}
	return model.NewGenericJSONResponse(response)
}

func updateFacilityProgramScheduleHandler(params operations.UpdateFacilityProgramScheduleParams, principal *models.JWTClaimBody) middleware.Responder {

	responder, e := validateIfUserHasPermissionsForFacilityProgram(params.FacilityID, params.ProgramID, principal)
	if e {
		return responder
	}

	objectId := "FacilityProgramSlot"
	response, err := getFacilityProgramSchedule(params.FacilityID, params.ProgramID)
	if err != nil {
		operations.NewUpdateFacilityProgramScheduleBadRequest()
	}
	osid := response["osid"].(string)

	requestBody, err := json.Marshal(params.Body)
	if err != nil {
		return operations.NewUpdateFacilityProgramScheduleBadRequest()
	}
	requestMap := make(map[string]interface{})
	err = json.Unmarshal(requestBody, &requestMap)
	if err != nil {
		log.Info(err)
		return NewGenericServerError()
	}
	requestMap["osid"] = osid

	resp, err := kernelService.UpdateRegistry(objectId, requestMap)
	if err != nil {
		log.Error(err)
		return operations.NewUpdateFacilityProgramScheduleBadRequest()
	} else {
		log.Print(resp)
		return operations.NewUpdateFacilityProgramScheduleOK()
	}

}

func getProgramsForPublic(params operations.GetProgramsForPublicParams) middleware.Responder {
	entityType := "Program"
	filter := make(map[string]interface{})
	if params.Status != nil {
		filter["status"] = map[string]interface{}{
			"eq": params.Status,
		}
	}
	response, err := kernelService.QueryRegistry(entityType, filter, 100, 0)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return model.NewGenericServerError()
	}
	return model.NewGenericJSONResponse(response[entityType])
}

func getFacilitySchedules(params operations.GetFacilitySchedulesParams, principal *models.JWTClaimBody) middleware.Responder {
	response, err := getAllFacilitySchedules(params.FacilityID)
	if err != nil {
		return operations.NewGetFacilitySchedulesNotFound()
	}
	return model.NewGenericJSONResponse(response)
}