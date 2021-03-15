package pkg

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	eventsModel "github.com/divoc/api/pkg/models"

	"github.com/divoc/api/config"
	"github.com/jinzhu/gorm"

	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/api/pkg/db"
	kafkaService "github.com/divoc/api/pkg/services"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/api/swagger_gen/restapi/operations"
	"github.com/divoc/api/swagger_gen/restapi/operations/certification"
	"github.com/divoc/api/swagger_gen/restapi/operations/configuration"
	"github.com/divoc/api/swagger_gen/restapi/operations/identity"
	"github.com/divoc/api/swagger_gen/restapi/operations/login"
	"github.com/divoc/api/swagger_gen/restapi/operations/report_side_effects"
	"github.com/divoc/api/swagger_gen/restapi/operations/side_effects"
	"github.com/divoc/api/swagger_gen/restapi/operations/vaccination"
	"github.com/divoc/kernel_library/services"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
)

const FacilityEntity = "Facility"

func SetupHandlers(api *operations.DivocAPI) {
	api.GetPingHandler = operations.GetPingHandlerFunc(pingResponder)

	api.LoginPostAuthorizeHandler = login.PostAuthorizeHandlerFunc(loginHandler)

	api.ConfigurationGetCurrentProgramsHandler = configuration.GetCurrentProgramsHandlerFunc(getCurrentProgramsResponder)
	api.ConfigurationGetConfigurationHandler = configuration.GetConfigurationHandlerFunc(getConfigurationResponder)

	api.IdentityPostIdentityVerifyHandler = identity.PostIdentityVerifyHandlerFunc(postIdentityHandler)
	api.VaccinationGetPreEnrollmentHandler = vaccination.GetPreEnrollmentHandlerFunc(getPreEnrollment)
	api.VaccinationGetPreEnrollmentsForFacilityHandler = vaccination.GetPreEnrollmentsForFacilityHandlerFunc(getPreEnrollmentForFacility)

	api.CertificationCertifyHandler = certification.CertifyHandlerFunc(certify)
	api.VaccinationGetLoggedInUserInfoHandler = vaccination.GetLoggedInUserInfoHandlerFunc(getLoggedInUserInfo)
	api.ConfigurationGetVaccinatorsHandler = configuration.GetVaccinatorsHandlerFunc(getVaccinators)
	api.GetCertificateHandler = operations.GetCertificateHandlerFunc(getCertificate)
	api.VaccinationGetLoggedInUserInfoHandler = vaccination.GetLoggedInUserInfoHandlerFunc(vaccinationGetLoggedInUserInfoHandler)
	api.SideEffectsGetSideEffectsMetadataHandler = side_effects.GetSideEffectsMetadataHandlerFunc(getSideEffects)
	api.CertificationBulkCertifyHandler = certification.BulkCertifyHandlerFunc(bulkCertify)
	api.EventsHandler = operations.EventsHandlerFunc(eventsHandler)
	api.CertificationGetCertifyUploadsHandler = certification.GetCertifyUploadsHandlerFunc(getCertifyUploads)
	api.ReportSideEffectsCreateReportedSideEffectsHandler = report_side_effects.CreateReportedSideEffectsHandlerFunc(createReportedSideEffects)
	api.CertificationGetCertifyUploadErrorsHandler = certification.GetCertifyUploadErrorsHandlerFunc(getCertifyUploadErrors)
}

type GenericResponse struct {
	statusCode int
}

type GenericJsonResponse struct {
	body interface{}
}

func (o *GenericResponse) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {
	rw.Header().Del(runtime.HeaderContentType) //Remove Content-Type on empty responses
	rw.WriteHeader(o.statusCode)
}

func NewGenericJSONResponse(body interface{}) middleware.Responder {
	return &GenericJsonResponse{body: body}
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

func NewGenericServerError() middleware.Responder {
	return &GenericResponse{statusCode: 500}
}

func vaccinationGetLoggedInUserInfoHandler(params vaccination.GetLoggedInUserInfoParams, principal *models.JWTClaimBody) middleware.Responder {
	if scopeId, err := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization")); err != nil {
		log.Errorf("Error while getting vaccinators %+v", err)
		return NewGenericServerError()
	} else {
		userInfo := getUserInfo(scopeId)
		return NewGenericJSONResponse(userInfo)
	}
}

func getCertificate(params operations.GetCertificateParams, principal *models.JWTClaimBody) middleware.Responder {
	typeId := "VaccinationCertificate"
	filter := map[string]interface{}{

		"mobile": map[string]interface{}{
			"eq": principal.PreferredUsername,
		},
	}
	if response, err := services.QueryRegistry(typeId, filter, config.Config.SearchRegistry.DefaultLimit, config.Config.SearchRegistry.DefaultOffset); err != nil {
		log.Infof("Error in querying vaccination certificate %+v", err)
		return NewGenericServerError()
	} else {
		if listOfCerts, ok := response["VaccinationCertificate"].([]interface{}); ok {
			log.Infof("list %+v", listOfCerts)
			result := []interface{}{}
			for _, v := range listOfCerts {
				if body, ok := v.(map[string]interface{}); ok {
					log.Infof("cert %v", body)
					if certString, ok := body["certificate"].(string); ok {
						cert := map[string]interface{}{}
						if err := json.Unmarshal([]byte(certString), &cert); err == nil {
							body["certificate"] = cert
						} else {
							log.Errorf("Error in getting certificate %+v", err)
						}
					}
				}
				result = append(result, v)
			}
			go publishSimpleEvent(principal.PreferredUsername, "download")
			return NewGenericJSONResponse(result)
		}
	}

	return NewGenericServerError()
}

func pingResponder(params operations.GetPingParams) middleware.Responder {
	return operations.NewGetPingOK()
}

func getLoggedInUserInfo(params vaccination.GetLoggedInUserInfoParams, principal *models.JWTClaimBody) middleware.Responder {
	payload := &models.UserInfo{
		FirstName: "Ram",
		LastName:  "Lal",
		Mobile:    "9876543210",
		Roles:     []string{"vaccinator", "operator"},
	}
	return vaccination.NewGetLoggedInUserInfoOK().WithPayload(payload)
}

func loginHandler(params login.PostAuthorizeParams) middleware.Responder {
	if strings.TrimSpace(params.Body.Token2fa) == "1231" {
		payload := &models.LoginResponse{
			RefreshToken: "234klj23lkj.asklsadf",
			Token:        "123456789923234234",
		}
		return login.NewPostAuthorizeOK().WithPayload(payload)
	}
	return login.NewPostAuthorizeUnauthorized()
}

func getVaccinators(params configuration.GetVaccinatorsParams, principal *models.JWTClaimBody) middleware.Responder {
	if scopeId, err := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization")); err != nil {
		log.Errorf("Error while getting vaccinators %+v", err)
		return NewGenericServerError()
	} else {
		limit, offset := getLimitAndOffset(params.Limit, params.Offset)
		vaccinators := getVaccinatorsForFacility(scopeId, limit, offset)
		return NewGenericJSONResponse(vaccinators)
	}
}

func getCurrentProgramsResponder(params configuration.GetCurrentProgramsParams, principal *models.JWTClaimBody) middleware.Responder {
	if facilityCode, err := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization")); err != nil {
		log.Errorf("Error while getting vaccinators %+v", err)
		return NewGenericServerError()
	} else {
		if facilities := getFacilityByCode(facilityCode); len(facilities) > 0 {
			var programNames []string
			for _, facilityObj := range facilities {
				facility := facilityObj.(map[string]interface{})
				for _, programObject := range facility["programs"].([]interface{}) {
					program := programObject.(map[string]interface{})
					if strings.EqualFold(program["status"].(string), "active") {
						programNames = append(programNames, program["programId"].(string))
					}
				}
			}
			var programsFor []*models.Program
			if len(programNames) > 0 {
				for _, id := range programNames {
					program := findProgramsById(id)
					if program != nil {
						programsFor = append(programsFor, program[0])
					}
				}
			}
			return configuration.NewGetCurrentProgramsOK().WithPayload(programsFor)
		} else {
			log.Errorf("Facility not found: %s", facilityCode)
			return NewGenericServerError()
		}
	}
}

func getFacilityByCode(facilityCode string) []interface{} {
	filter := map[string]interface{}{
		"facilityCode": map[string]interface{}{
			"eq": facilityCode,
		},
	}
	if programs, err := services.QueryRegistry(FacilityEntity, filter, config.Config.SearchRegistry.DefaultLimit, config.Config.SearchRegistry.DefaultOffset); err == nil {
		return programs[FacilityEntity].([]interface{})
	}
	return nil
}

func getConfigurationResponder(params configuration.GetConfigurationParams, principal *models.JWTClaimBody) middleware.Responder {
	payload := &models.ApplicationConfiguration{
		Navigation: nil,
		Styles:     map[string]string{"a": "a"},
		Validation: []string{"a", "b", "c", "d", "e"},
	}
	return configuration.NewGetConfigurationOK().WithPayload(payload)
}

func postIdentityHandler(params identity.PostIdentityVerifyParams, principal *models.JWTClaimBody) middleware.Responder {
	if strings.TrimSpace(params.Body.Token) != "" {
		return identity.NewPostIdentityVerifyOK()
	}
	return identity.NewPostIdentityVerifyPartialContent()
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

func getPreEnrollment(params vaccination.GetPreEnrollmentParams, principal *models.JWTClaimBody) middleware.Responder {
	code := params.PreEnrollmentCode
	scopeId, err := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization"))
	if err != nil {
		return NewGenericServerError()
	}
	limit, offset := getLimitAndOffset(params.Limit, params.Offset)
	if enrollment, err := findEnrollmentScopeAndCode(scopeId, code, limit, offset); err == nil {
		return vaccination.NewGetPreEnrollmentOK().WithPayload(enrollment)
	}
	return NewGenericServerError()
}

func getPreEnrollmentForFacility(params vaccination.GetPreEnrollmentsForFacilityParams, principal *models.JWTClaimBody) middleware.Responder {
	scopeId, err := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization"))
	if err != nil {
		return NewGenericServerError()
	}
	if enrollments, err := findEnrollmentsForScope(scopeId, params); err == nil {
		return vaccination.NewGetPreEnrollmentsForFacilityOK().WithPayload(enrollments)
	}
	return NewGenericServerError()
}

func certify(params certification.CertifyParams, principal *models.JWTClaimBody) middleware.Responder {
	// this api can be moved to separate deployment unit if someone wants to use certification alone then
	// sign verification can be disabled and use vaccination certification generation
	for _, request := range params.Body {
		log.Infof("CertificationRequest: %+v\n", request)
		if request.Recipient.Age == "" && request.Recipient.Dob == nil {
			errorCode := "MISSING_FIELDS"
			errorMsg := "Age and DOB both are missing. Atleast one should be present"
			return certification.NewCertifyBadRequest().WithPayload(&models.Error{
				Code:    &errorCode,
				Message: &errorMsg,
			})
		}
		if request.Recipient.Age == "" {
			request.Recipient.Age = calcAge(*(request.Recipient.Dob))
		}

		if jsonRequestString, err := json.Marshal(request); err == nil {
			if request.EnrollmentType == "walkin" {
				enrollmentMsg := createEnrollmentFromCertificationRequest(request, principal.FacilityCode, jsonRequestString)
				kafkaService.PublishWalkEnrollment(enrollmentMsg, nil, nil)
			} else {
				kafkaService.PublishCertifyMessage(jsonRequestString, nil, nil)
			}
		}
	}
	return certification.NewCertifyOK()
}

func bulkCertify(params certification.BulkCertifyParams, principal *models.JWTClaimBody) middleware.Responder {
	data := NewScanner(params.File)
	if err := validateBulkCertifyCSVHeaders(data.GetHeaders()); err != nil {
		code := "INVALID_TEMPLATE"
		message := err.Error()
		return certification.NewBulkCertifyBadRequest().WithPayload(&models.Error{
			Code:    &code,
			Message: &message,
		})
	}

	// Initializing CertifyUpload entity
	_, fileHeader, _ := params.HTTPRequest.FormFile("file")
	fileName := fileHeader.Filename
	preferredUsername := getUserName(params.HTTPRequest)
	uploadEntry := db.CertifyUploads{}
	uploadEntry.Filename = fileName
	uploadEntry.UserID = preferredUsername
	uploadEntry.TotalRecords = 0
	if err := db.CreateCertifyUpload(&uploadEntry); err != nil {
		code := "DATABASE_ERROR"
		message := err.Error()
		return certification.NewBulkCertifyBadRequest().WithPayload(&models.Error{
			Code:    &code,
			Message: &message,
		})
	}

	// Creating Certificates
	for data.Scan() {
		createCertificate(&data, &uploadEntry)
		log.Info(data.Text("recipientName"), " - ", data.Text("facilityName"))
	}
	defer params.File.Close()

	db.UpdateCertifyUpload(&uploadEntry)

	return certification.NewBulkCertifyOK()
}

func eventsHandler(params operations.EventsParams) middleware.Responder {
	preferredUsername := getUserName(params.HTTPRequest)
	for _, e := range params.Body {
		kafkaService.PublishEvent(eventsModel.Event{
			Date:          time.Time(e.Date),
			Source:        preferredUsername,
			TypeOfMessage: e.Type,
			ExtraInfo:     e.Extra,
		})
	}
	return operations.NewEventsOK()
}

func getUserName(params *http.Request) string {
	preferredUsername := ""
	claimBody := auth.ExtractClaimBodyFromHeader(params)
	if claimBody != nil {
		preferredUsername = claimBody.PreferredUsername
	}
	return preferredUsername
}

func getCertifyUploads(params certification.GetCertifyUploadsParams, principal *models.JWTClaimBody) middleware.Responder {
	var result []interface{}
	preferredUsername := principal.PreferredUsername
	certifyUploads, err := db.GetCertifyUploadsForUser(preferredUsername)
	if err == nil {
		// get the error rows associated with it
		// if present update status as "Failed"
		for _, c := range certifyUploads {
			totalErrorRows := 0
			statuses, err := db.GetCertifyUploadErrorsStatusForUploadId(c.ID)
			if err == nil {
				for _, status := range statuses {
					if status == db.CERTIFY_UPLOAD_FAILED_STATUS {
						totalErrorRows = totalErrorRows + 1
					}
				}
			}
			overallStatus := getOverallStatus(statuses)

			// construct return value and append
			var cmap map[string]interface{}
			if jc, e := json.Marshal(c); e == nil {
				if e = json.Unmarshal(jc, &cmap); e == nil {
					cmap["Status"] = overallStatus
					cmap["TotalErrorRows"] = totalErrorRows
				}
			}
			result = append(result, cmap)

		}
		return NewGenericJSONResponse(result)
	}
	return NewGenericServerError()
}

func getOverallStatus(statuses []string) string {
	if contains(statuses, db.CERTIFY_UPLOAD_PROCESSING_STATUS) {
		return db.CERTIFY_UPLOAD_PROCESSING_STATUS
	} else if contains(statuses, db.CERTIFY_UPLOAD_FAILED_STATUS) {
		return db.CERTIFY_UPLOAD_FAILED_STATUS
	} else {
		return db.CERTIFY_UPLOAD_SUCCESS_STATUS
	}
}

func getCertifyUploadErrors(params certification.GetCertifyUploadErrorsParams, principal *models.JWTClaimBody) middleware.Responder {
	uploadID := params.UploadID

	// check if user has permission to get errors
	preferredUsername := principal.PreferredUsername
	certifyUpload, err := db.GetCertifyUploadsForID(uint(uploadID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// certifyUpload itself not there
			// then throw 404 error
			return certification.NewGetCertifyUploadErrorsNotFound()
		}
		return NewGenericServerError()
	}

	// user in certifyUpload doesnt match preferredUsername
	// then throw 403 error
	if certifyUpload.UserID != preferredUsername {
		return certification.NewGetCertifyUploadErrorsForbidden()
	}

	certifyUploadErrors, err := db.GetCertifyUploadErrorsForUploadID(uploadID)
	columnHeaders := strings.Split(config.Config.Certificate.Upload.Columns, ",")
	if err == nil {
		return NewGenericJSONResponse(map[string]interface{}{
			"columns":   append(columnHeaders, "errors"),
			"errorRows": certifyUploadErrors,
		})
	}
	return NewGenericServerError()
}
