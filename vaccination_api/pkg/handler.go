package pkg

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/jinzhu/gorm"
	"net/http"
	"strings"
	"time"

	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/api/pkg/db"
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
		"@type": map[string]interface{}{
			"eq": typeId,
		},
		"contact": map[string]interface{}{
			"contains": "tel:" + params.Phone,
		},
	}
	if response, err := services.QueryRegistry(typeId, filter); err != nil {
		log.Infof("Error in querying vaccination certificate %+v", err)
		return NewGenericServerError()
	} else {
		if listOfCerts, ok := response["VaccinationCertificate"].([]interface{}); ok {
			log.Infof("list %+v", listOfCerts)
			result := []interface{}{}
			for _, v := range listOfCerts {
				if body, ok := v.(map[string]interface{}); ok {
					log.Infof("cert ", body)
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
		vaccinators := getVaccinatorsForFacility(scopeId)
		return NewGenericJSONResponse(vaccinators)
	}
}

func getCurrentProgramsResponder(params configuration.GetCurrentProgramsParams, principal *models.JWTClaimBody) middleware.Responder {
	if scopeId, err := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization")); err != nil {
		log.Errorf("Error while getting vaccinators %+v", err)
		return NewGenericServerError()
	} else {
		programsFor := findProgramsForFacility(scopeId)
		return configuration.NewGetCurrentProgramsOK().WithPayload(programsFor)
	}
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

func getPreEnrollment(params vaccination.GetPreEnrollmentParams, principal *models.JWTClaimBody) middleware.Responder {
	code := params.PreEnrollmentCode
	scopeId, err := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization"))
	if err != nil {
		return NewGenericServerError()
	}
	if enrollment, err := findEnrollmentScopeAndCode(scopeId, code); err == nil {
		return vaccination.NewGetPreEnrollmentOK().WithPayload(enrollment)
	}
	return NewGenericServerError()
}

func getPreEnrollmentForFacility(params vaccination.GetPreEnrollmentsForFacilityParams, principal *models.JWTClaimBody) middleware.Responder {
	scopeId, err := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization"))
	if err != nil {
		return NewGenericServerError()
	}
	if enrollments, err := findEnrollmentsForScope(scopeId); err == nil {
		return vaccination.NewGetPreEnrollmentsForFacilityOK().WithPayload(enrollments)
	}
	return NewGenericServerError()
}

func certify(params certification.CertifyParams, principal *models.JWTClaimBody) middleware.Responder {
	// this api can be moved to separate deployment unit if someone wants to use certification alone then
	// sign verification can be disabled and use vaccination certification generation
	fmt.Printf("%+v\n", params.Body[0])
	for _, request := range params.Body {
		if jsonRequestString, err := json.Marshal(request); err == nil {
			publishCertifyMessage(jsonRequestString)
		}
	}
	return certification.NewCertifyOK()
}

func bulkCertify(params certification.BulkCertifyParams, principal *models.JWTClaimBody) middleware.Responder {
	columns := strings.Split(config.Config.Certificate.Upload.Columns, ",")

	data := NewScanner(params.File)

	// csv template validation
	csvHeaders := data.GetHeaders()
	for _, c := range columns {
		if !contains(csvHeaders, c) {
			code := "INVALID_TEMPLATE"
			message := c + " column doesn't exist in uploaded csv file"
			error := &models.Error{
				Code:    &code,
				Message: &message,
			}
			return certification.NewBulkCertifyBadRequest().WithPayload(error)
		}
	}

	// Initializing CertifyUpload entity
	_, fileHeader, _ := params.HTTPRequest.FormFile("file")
	fileName := fileHeader.Filename
	preferredUsername := getUserName(params.HTTPRequest)
	uploadEntry := db.CertifyUploads{}
	uploadEntry.Filename = fileName
	uploadEntry.UserID = preferredUsername
	uploadEntry.Status = "Processing"
	uploadEntry.TotalRecords = 0
	uploadEntry.TotalErrorRows = 0
	db.CreateCertifyUpload(&uploadEntry)

	// Creating Certificates
	for data.Scan() {
		createCertificate(&data, &uploadEntry)
		log.Info(data.Text("recipientName"), " - ", data.Text("facilityName"))
	}
	defer params.File.Close()

	if uploadEntry.TotalErrorRows > 0 {
		uploadEntry.Status = "Failed"
	} else {
		uploadEntry.Status = "Success"
	}

	db.UpdateCertifyUpload(&uploadEntry)

	return certification.NewBulkCertifyOK()
}

func eventsHandler(params operations.EventsParams) middleware.Responder {
	preferredUsername := getUserName(params.HTTPRequest)
	for _, e := range params.Body {
		publishEvent(Event{
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
	preferredUsername := principal.PreferredUsername
	certifyUploads, err := db.GetCertifyUploadsForUser(preferredUsername)
	if err == nil {
		return NewGenericJSONResponse(certifyUploads)
	}
	return NewGenericServerError()
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
		return NewGenericJSONResponse(map[string]interface{} {
			"columns": append(columnHeaders, "errors"),
			"errorRows": certifyUploadErrors,
		})
	}
	return NewGenericServerError()
}
