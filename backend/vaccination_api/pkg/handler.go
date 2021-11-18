package pkg

import (
	"encoding/json"
	"errors"
	"github.com/divoc/api/swagger_gen/restapi/operations/certificate_revoked"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	eventsModel "github.com/divoc/api/pkg/models"

	"github.com/divoc/api/config"
	"github.com/jinzhu/gorm"

	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/api/pkg/db"
	communicationService "github.com/divoc/api/pkg/services"
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

const CERTIFICATE_TYPE_V2 = "certifyV2"
const CERTIFICATE_TYPE_V3 = "certifyV3"

func SetupHandlers(api *operations.DivocAPI) {
	api.GetV1PingHandler = operations.GetV1PingHandlerFunc(pingResponder)

	api.LoginPostV1AuthorizeHandler = login.PostV1AuthorizeHandlerFunc(loginHandler)

	api.ConfigurationGetCurrentProgramsHandler = configuration.GetCurrentProgramsHandlerFunc(getCurrentProgramsResponder)
	api.ConfigurationGetConfigurationHandler = configuration.GetConfigurationHandlerFunc(getConfigurationResponder)

	api.IdentityPostV1IdentityVerifyHandler = identity.PostV1IdentityVerifyHandlerFunc(postIdentityHandler)
	api.VaccinationGetPreEnrollmentHandler = vaccination.GetPreEnrollmentHandlerFunc(getPreEnrollment)
	api.VaccinationGetPreEnrollmentsForFacilityHandler = vaccination.GetPreEnrollmentsForFacilityHandlerFunc(getPreEnrollmentForFacility)

	api.CertificationCertifyHandler = certification.CertifyHandlerFunc(certify)
	api.CertificationCertifyV3Handler = certification.CertifyV3HandlerFunc(certifyV3)
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
	api.CertificationUpdateCertificateHandler = certification.UpdateCertificateHandlerFunc(updateCertificate)
	api.CertificationUpdateCertificateV3Handler = certification.UpdateCertificateV3HandlerFunc(updateCertificateV3)

	api.CertificateRevokedCertificateRevokedHandler = certificate_revoked.CertificateRevokedHandlerFunc(postCertificateRevoked)
	api.CertificationGetCertificateByCertificateIDHandler = certification.GetCertificateByCertificateIDHandlerFunc(getCertificateByCertificateId)
	api.CertificationTestCertifyHandler = certification.TestCertifyHandlerFunc(testCertify)
	api.CertificationTestBulkCertifyHandler = certification.TestBulkCertifyHandlerFunc(testBulkCertify)
	api.CertificationGetTestCertifyUploadsHandler = certification.GetTestCertifyUploadsHandlerFunc(getTestCertifyUploads)
	api.CertificationGetTestCertifyUploadErrorsHandler = certification.GetTestCertifyUploadErrorsHandlerFunc(getTestCertifyUploadErrors)
}

const CertificateEntity = "VaccinationCertificate"

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

func pingResponder(params operations.GetV1PingParams) middleware.Responder {
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

func loginHandler(params login.PostV1AuthorizeParams) middleware.Responder {
	if strings.TrimSpace(params.Body.Token2fa) == "1231" {
		payload := &models.LoginResponse{
			RefreshToken: "234klj23lkj.asklsadf",
			Token:        "123456789923234234",
		}
		return login.NewPostV1AuthorizeOK().WithPayload(payload)
	}
	return login.NewPostV1AuthorizeUnauthorized()
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

func postIdentityHandler(params identity.PostV1IdentityVerifyParams, principal *models.JWTClaimBody) middleware.Responder {
	if strings.TrimSpace(params.Body.Token) != "" {
		return identity.NewPostV1IdentityVerifyOK()
	}
	return identity.NewPostV1IdentityVerifyPartialContent()
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
	limit, offset := getLimitAndOffset(params.Limit, params.Offset)
	if enrollment, err := findEnrollmentForCode(code, limit, offset); err == nil {
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
		if age, err := strconv.Atoi(request.Recipient.Age); age < 0 || err != nil{
			errorCode := "MISSING_FIELDS"
			errorMsg := "Invalid Age or DOB. Should be less than current date"
			return certification.NewCertifyBadRequest().WithPayload(&models.Error{
				Code:    &errorCode,
				Message: &errorMsg,
			})
		}

		// adding certificateType
		if request.Meta == nil {
			request.Meta = map[string]interface{}{
				"certificateType": CERTIFICATE_TYPE_V2,
			}
		} else {
			meta := request.Meta.(map[string]interface{})
			meta["certificateType"] = CERTIFICATE_TYPE_V2
		}

		if jsonRequestString, err := json.Marshal(request); err == nil {
			if request.EnrollmentType == models.EnrollmentEnrollmentTypeWALKIN {
				enrollmentMsg := createEnrollmentFromCertificationRequest(request, principal.FacilityCode)
				communicationService.PublishWalkEnrollment(enrollmentMsg)
			} else {
				communicationService.PublishCertifyMessage(jsonRequestString, nil, nil)
			}
		}
	}
	return certification.NewCertifyOK()
}

func certifyV3(params certification.CertifyV3Params, principal *models.JWTClaimBody) middleware.Responder {
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
		if age, err := strconv.Atoi(request.Recipient.Age); age < 0 || err != nil{
			errorCode := "MISSING_FIELDS"
			errorMsg := "Invalid Age or DOB. Should be less than current date"
			return certification.NewCertifyBadRequest().WithPayload(&models.Error{
				Code:    &errorCode,
				Message: &errorMsg,
			})
		}

		// adding certificateType
		if request.Meta == nil {
			request.Meta = map[string]interface{}{
				"certificateType": CERTIFICATE_TYPE_V3,
			}
		} else {
			meta := request.Meta.(map[string]interface{})
			meta["certificateType"] = CERTIFICATE_TYPE_V3
		}

		if jsonRequestString, err := json.Marshal(request); err == nil {
			if request.EnrollmentType == models.EnrollmentEnrollmentTypeWALKIN {
				enrollmentMsg := createEnrollmentFromCertificationRequest(request, principal.FacilityCode)
				communicationService.PublishWalkEnrollment(enrollmentMsg)
			} else {
				communicationService.PublishCertifyMessage(jsonRequestString, nil, nil)
			}
		}
	}
	return certification.NewCertifyOK()
}

func testCertify(params certification.TestCertifyParams, principal *models.JWTClaimBody) middleware.Responder {
	// this api can be moved to separate deployment unit if someone wants to use certification alone then
	// sign verification can be disabled and use vaccination certification generation
	for _, request := range params.Body {
		log.Infof("CertificationRequest: %+v\n", request)
		if jsonRequestString, err := json.Marshal(request); err == nil {
			communicationService.PublishTestCertifyMessage(jsonRequestString, nil, nil)
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
		communicationService.PublishEvent(eventsModel.Event{
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
func updateCertificate(params certification.UpdateCertificateParams, principal *models.JWTClaimBody) middleware.Responder {
	// this api can be moved to separate deployment unit if someone wants to use certification alone then
	// sign verification can be disabled and use vaccination certification generation
	log.Debugf("%+v\n", params.Body[0])
	for _, request := range params.Body {
		if certificateId := getCertificateIdToBeUpdated(request); certificateId != nil{
			log.Infof("Certificate update request approved %+v", request)
			if request.Meta == nil {
				request.Meta = map[string]interface{}{
					"previousCertificateId": certificateId,
					"certificateType":       CERTIFICATE_TYPE_V2,
				}
			} else {
				meta := request.Meta.(map[string]interface{})
				meta["previousCertificateId"] = certificateId
				meta["certificateType"] = CERTIFICATE_TYPE_V2
			}
			if jsonRequestString, err := json.Marshal(request); err == nil {
				communicationService.PublishCertifyMessage(jsonRequestString, nil, nil)
			}
		} else {
			log.Infof("Certificate update request rejected %+v", request)
			return certification.NewUpdateCertificatePreconditionFailed()
		}
	}
	return certification.NewUpdateCertificateOK()
}

func updateCertificateV3(params certification.UpdateCertificateV3Params, principal *models.JWTClaimBody) middleware.Responder {
	// this api can be moved to separate deployment unit if someone wants to use certification alone then
	// sign verification can be disabled and use vaccination certification generation
	log.Debugf("%+v\n", params.Body[0])
	for _, request := range params.Body {
		if certificateId := getCertificateIdToBeUpdated(request); certificateId != nil{
			log.Infof("Certificate update request approved %+v", request)
			if request.Meta == nil {
				request.Meta = map[string]interface{}{
					"previousCertificateId": certificateId,
					"certificateType":       CERTIFICATE_TYPE_V3,
				}
			} else {
				meta := request.Meta.(map[string]interface{})
				meta["previousCertificateId"] = certificateId
				meta["certificateType"] = CERTIFICATE_TYPE_V3
			}
			if jsonRequestString, err := json.Marshal(request); err == nil {
				communicationService.PublishCertifyMessage(jsonRequestString, nil, nil)
			}
		} else {
			log.Infof("Certificate update request rejected %+v", request)
			return certification.NewUpdateCertificateV3PreconditionFailed()
		}
	}
	return certification.NewUpdateCertificateV3OK()
}

func getCertificateIdToBeUpdated(request *models.CertificationRequest) *string {

	filter := map[string]interface{}{
		"preEnrollmentCode":  map[string]interface{}{
			"eq": request.PreEnrollmentCode,
		},
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter, config.Config.SearchRegistry.DefaultLimit, config.Config.SearchRegistry.DefaultOffset)
	certificates := certificateFromRegistry[CertificateEntity].([]interface{})
	if err == nil && len(certificates) > 0 {
		log.Infof("Certificates: %+v", certificates)
		if len(certificates) > 1 {
			certificates = SortCertificatesByCreateAt(certificates)
		}
		doseWiseCertificateIds := getDoseWiseCertificateIds(certificates)
		// no changes to provisional certificate if final certificate is generated
		if *request.Vaccination.Dose < *request.Vaccination.TotalDoses && len(doseWiseCertificateIds) > 1 {
			log.Error("Updating provisional certificate restricted")
			return nil
		}
		// check if certificate exists for a dose
		if certificateIds, ok := doseWiseCertificateIds[int(*request.Vaccination.Dose)]; ok && len(certificateIds) > 0 {
			// check if maximum time of correction is reached
			count := len(certificateIds)
			if count < (config.Config.Certificate.UpdateLimit + 1) {
				certificateId := doseWiseCertificateIds[int(*request.Vaccination.Dose)][count-1]
				return &certificateId
			} else {
				log.Error("Certificate update limit reached")
			}
		} else {
			log.Error("No certificate found to update")
		}
	}
	return nil
}

func getDoseWiseCertificateIds(certificates []interface{}) map[int][]string {
	doseWiseCertificateIds := map[int][]string{}
	for _, certificateObj := range certificates {
		if certificate, ok := certificateObj.(map[string]interface{}); ok {
			var res map[string]interface{}
			json.Unmarshal([]byte(certificate["certificate"].(string)), &res)
			if evidences,  found := res["evidence"].([]interface{}); found && len(evidences) > 0{
				if doseValue, found := evidences[0].(map[string]interface{})["dose"]; found {
					if doseValueFloat, ok := doseValue.(float64); ok {
						if certificateId, found := certificate["certificateId"]; found {
							doseWiseCertificateIds[int(doseValueFloat)] = append(doseWiseCertificateIds[int(doseValueFloat)], certificateId.(string))
						}
					}
				}
			}
		}
	}
	return doseWiseCertificateIds
}

func SortCertificatesByCreateAt(certificateArr []interface{}) []interface{} {
	sort.Slice(certificateArr, func(i, j int) bool {
		certificateA := certificateArr[i].(map[string]interface{})
		certificateB := certificateArr[j].(map[string]interface{})
		if certificateACreateAt, ok := certificateA["osCreatedAt"].(string); ok {
			if certificateBCreateAt, ok := certificateB["osCreatedAt"].(string); ok {
				return certificateACreateAt < certificateBCreateAt
			}
		}
		return true
	})
	return certificateArr
}

func postCertificateRevoked(params certificate_revoked.CertificateRevokedParams) middleware.Responder {
	typeId := "RevokedCertificate"
	requestBody, err := json.Marshal(params.Body)
	if err != nil {
		log.Printf("JSON marshalling error %v", err)
		return certificate_revoked.NewCertificateRevokedBadRequest()
	}

	var certificate eventsModel.Certificate
	err = json.Unmarshal(requestBody, &certificate)
	if err != nil {
		log.Printf("Error while converting requestBody to Certificate object %v", err)
		return certificate_revoked.NewCertificateRevokedBadRequest()
	}
	if len(certificate.Evidence) == 0 {
		log.Printf("Error while getting Evidence array in requestBody %v", certificate)
		return certificate_revoked.NewCertificateRevokedBadRequest()
	}

	preEnrollmentCode := certificate.CredentialSubject.RefId
	certificateId := certificate.Evidence[0].CertificateId
	dose := certificate.Evidence[0].Dose

	filter := map[string]interface{}{
		"previousCertificateId": map[string]interface{}{
			"eq": certificateId,
		},
		"dose": map[string]interface{}{
			"eq": dose,
		},
		"preEnrollmentCode": map[string]interface{}{
			"eq": preEnrollmentCode,
		},
	}
	if resp, err := services.QueryRegistry(typeId, filter, config.Config.SearchRegistry.DefaultLimit, config.Config.SearchRegistry.DefaultOffset); err == nil {
		if revokedCertificates, ok := resp[typeId].([]interface{}); ok {
			if len(revokedCertificates) > 0 {
				return certificate_revoked.NewCertificateRevokedOK()
			}
			return certificate_revoked.NewCertificateRevokedNotFound()
		}
	}
	return certificate_revoked.NewCertificateRevokedBadRequest()
}

func getCertificateByCertificateId(params certification.GetCertificateByCertificateIDParams, principal *models.JWTClaimBody) middleware.Responder {
	typeId := "VaccinationCertificate"
	filter := map[string]interface{}{

		"certificateId": map[string]interface{}{
			"eq": params.CertificateID,
		},
	}
	if response, err := services.QueryRegistry(typeId, filter, config.Config.SearchRegistry.DefaultLimit, config.Config.SearchRegistry.DefaultOffset); err != nil {
		log.Infof("Error in querying vaccination certificate %+v", err)
		return NewGenericServerError()
	} else {
		if listOfCerts, ok := response["VaccinationCertificate"].([]interface{}); ok {
			log.Infof("list %+v", listOfCerts)
			if len(listOfCerts) != 0 {
				v := listOfCerts[0]
				if body, ok := v.(map[string]interface{}); ok {
					log.Infof("cert %v", body)
					if certString, ok := body["certificate"].(string); ok {
						cert := map[string]interface{}{}
						if err := json.Unmarshal([]byte(certString), &cert); err == nil {
							body["certificate"] = cert
						} else {
							log.Errorf("Error in getting certificate %+v", err)
							return NewGenericServerError()
						}
					}
				}
				return NewGenericJSONResponse(v)
			}
			return certification.NewGetCertificateByCertificateIDNotFound()
		}
	}

	return NewGenericServerError()
}

func testBulkCertify(params certification.TestBulkCertifyParams, principal *models.JWTClaimBody) middleware.Responder {
	data := NewScanner(params.File)
	if err := validateTestBulkCertifyCSVHeaders(data.GetHeaders()); err != nil {
		log.Error("Invalid template", err.Error());
		code := "INVALID_TEMPLATE"
		message := err.Error()
		return certification.NewTestBulkCertifyBadRequest().WithPayload(&models.Error{
			Code:    &code,
			Message: &message,
		})
	}

	// Initializing CertifyUpload entity
	_, fileHeader, _ := params.HTTPRequest.FormFile("file")
	fileName := fileHeader.Filename
	preferredUsername := getUserName(params.HTTPRequest)
	uploadEntry := db.TestCertifyUploads{}
	uploadEntry.Filename = fileName
	uploadEntry.UserID = preferredUsername
	uploadEntry.TotalRecords = 0
	if err := db.CreateTestCertifyUpload(&uploadEntry); err != nil {
		code := "DATABASE_ERROR"
		message := err.Error()
		return certification.NewTestBulkCertifyBadRequest().WithPayload(&models.Error{
			Code:    &code,
			Message: &message,
		})
	}

	// Creating Certificates
	for data.Scan() {
		createTestCertificate(&data, &uploadEntry)
		log.Info(data.Text("recipientName"), " - ", data.Text("facilityName"))
	}
	defer params.File.Close()

	db.UpdateTestCertifyUpload(&uploadEntry)

	return certification.NewBulkCertifyOK()
}

func getTestCertifyUploads(params certification.GetTestCertifyUploadsParams, principal *models.JWTClaimBody) middleware.Responder {
	var result []interface{}
	preferredUsername := principal.PreferredUsername
	certifyUploads, err := db.GetTestCertifyUploadsForUser(preferredUsername)
	if err == nil {
		// get the error rows associated with it
		// if present update status as "Failed"
		for _, c := range certifyUploads {
			totalErrorRows := 0
			statuses, err := db.GetTestCertifyUploadErrorsStatusForUploadId(c.ID)
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

func getTestCertifyUploadErrors(params certification.GetTestCertifyUploadErrorsParams, principal *models.JWTClaimBody) middleware.Responder {
	uploadID := params.UploadID

	// check if user has permission to get errors
	preferredUsername := principal.PreferredUsername
	certifyUpload, err := db.GetTestCertifyUploadsForID(uint(uploadID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// certifyUpload itself not there
			// then throw 404 error
			return certification.NewGetTestCertifyUploadErrorsNotFound()
		}
		return NewGenericServerError()
	}

	// user in certifyUpload doesnt match preferredUsername
	// then throw 403 error
	if certifyUpload.UserID != preferredUsername {
		return certification.NewGetTestCertifyUploadErrorsForbidden()
	}

	certifyUploadErrors, err := db.GetTestCertifyUploadErrorsForUploadID(uploadID)
	columnHeaders := strings.Split(config.Config.Testcertificate.Upload.Columns, ",")
	if err == nil {
		return NewGenericJSONResponse(map[string]interface{}{
			"columns":   append(columnHeaders, "errors"),
			"errorRows": certifyUploadErrors,
		})
	}
	return NewGenericServerError()
}