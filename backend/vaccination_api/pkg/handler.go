package pkg

import (
	"encoding/json"
	"errors"
	"fmt"
	eventsModel "github.com/divoc/api/pkg/models"
	"github.com/divoc/api/swagger_gen/restapi/operations/certificate_revoked"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/divoc/api/config"
	"github.com/jinzhu/gorm"

	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/api/pkg/db"
	models2 "github.com/divoc/api/pkg/models"
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

func SetupHandlers(api *operations.DivocAPI) {
	api.GetV1PingHandler = operations.GetV1PingHandlerFunc(pingResponder)

	api.LoginPostAuthorizeHandler = login.PostAuthorizeHandlerFunc(loginHandler)

	api.ConfigurationGetCurrentProgramsHandler = configuration.GetCurrentProgramsHandlerFunc(getCurrentProgramsResponder)
	api.ConfigurationGetConfigurationHandler = configuration.GetConfigurationHandlerFunc(getConfigurationResponder)

	api.IdentityPostV1IdentityVerifyHandler = identity.PostV1IdentityVerifyHandlerFunc(postIdentityHandler)
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

	api.CertificationCertifyV2Handler = certification.CertifyV2HandlerFunc(certifyV2)
	api.CertificationUpdateCertificateHandler = certification.UpdateCertificateHandlerFunc(updateCertificate)
	api.CertificateRevokedCertificateRevokedHandler = certificate_revoked.CertificateRevokedHandlerFunc(postCertificateRevoked)
	api.CertificationRevokeCertificateHandler = certification.RevokeCertificateHandlerFunc(revokeCertificate)
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
	if response, err := services.QueryRegistry(typeId, filter); err != nil {
		log.Infof("Error in querying vaccination certificate %+v", err)
		return NewGenericServerError()
	} else {
		if listOfCerts, ok := response["VaccinationCertificate"].([]interface{}); ok {
			log.Infof("list %+v", listOfCerts)
			result := []interface{}{}
			for _, v := range listOfCerts {
				if body, ok := v.(map[string]interface{}); ok {
					log.Infof("cert %+v", body)
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

func postIdentityHandler(params identity.PostV1IdentityVerifyParams, principal *models.JWTClaimBody) middleware.Responder {
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

func updateCertificate(params certification.UpdateCertificateParams, principal *models.JWTClaimBody) middleware.Responder {
	// this api can be moved to separate deployment unit if someone wants to use certification alone then
	// sign verification can be disabled and use vaccination certification generation
	log.Debugf("%+v\n", params.Body[0])
	for _, request := range params.Body {
		if certificateId := getCertificateIdToBeUpdated(request); certificateId != nil {
			log.Infof("Certificate update request approved %+v", request)
			if request.Meta == nil {
				request.Meta = &models.CertificationRequestV2Meta{
					PreviousCertificateID: *certificateId,
				}
			} else {
				meta := request.Meta
				meta.PreviousCertificateID = *certificateId
			}
			if jsonRequestString, err := json.Marshal(request); err == nil {
				kafkaService.PublishCertifyMessage(jsonRequestString, nil, nil)
			}
		} else {
			log.Infof("Certificate update request rejected %+v", request)
			return certification.NewUpdateCertificatePreconditionFailed()
		}
	}
	return certification.NewCertifyV2OK()
}

func getCertificateIdToBeUpdated(request *models.CertificationRequestV2) *string {

	filter := map[string]interface{}{
		"preEnrollmentCode": map[string]interface{}{
			"eq": request.PreEnrollmentCode,
		},
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	certificates := certificateFromRegistry[CertificateEntity].([]interface{})
	if err == nil && len(certificates) > 0 {
		certificates = SortCertificatesByCreateAt(certificates)
		doseWiseCertificateIds := getDoseWiseCertificateIds(certificates)
		// no changes to provisional certificate if final certificate is generated
		if request.Vaccination.Dose < request.Vaccination.TotalDoses && len(doseWiseCertificateIds) > 1 {
			log.Error("Updating provisional certificate restricted")
			return nil
		}
		// check if certificate exists for a dose
		if certificateIds, ok := doseWiseCertificateIds[int(request.Vaccination.Dose)]; ok && len(certificateIds) > 0 {
			// check if maximum time of correction is reached
			count := len(certificateIds)
			if count < (config.Config.Certificate.UpdateLimit + 1) {
				certificateId := doseWiseCertificateIds[int(request.Vaccination.Dose)][count-1]
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
			if doseValue := getDoseFromCertificate(certificate); doseValue != 0 {
				if certificateId, found := certificate["certificateId"]; found {
					doseWiseCertificateIds[doseValue] = append(doseWiseCertificateIds[doseValue], certificateId.(string))
				}
			}
		}
	}
	return doseWiseCertificateIds
}
func GetDoseWiseCertificates(certificates []interface{}) map[int][]map[string]interface{} {
	doseWiseCertificates := map[int][]map[string]interface{}{}
	for _, certificateObj := range certificates {
		if certificate, ok := certificateObj.(map[string]interface{}); ok {
			if doseValue := getDoseFromCertificate(certificate); doseValue != 0 {
				doseWiseCertificates[doseValue] = append(doseWiseCertificates[doseValue], certificate)
			}
		}
	}
	return doseWiseCertificates
}

func getDoseFromCertificate(certificateMap map[string]interface{}) int {
	if doseValue, found := certificateMap["dose"]; found {
		if doseValueFloat, ok := doseValue.(float64); ok {
			return int(doseValueFloat)
		}
	}
	if certificateJson, found := certificateMap["certificate"]; found {
		var certificate models2.Certificate
		if certificateString, ok := certificateJson.(string); ok {
			if err := json.Unmarshal([]byte(certificateString), &certificate); err == nil {
				return int(certificate.Evidence[0].Dose)
			} else {
				log.Errorf("Error in reading certificate json %+v", err)
			}
		}
	}

	return 0
}

func certifyV2(params certification.CertifyV2Params, principal *models.JWTClaimBody) middleware.Responder {
	// this api can be moved to separate deployment unit if someone wants to use certification alone then
	// sign verification can be disabled and use vaccination certification generation
	fmt.Printf("%+v\n", params.Body[0])
	for _, request := range params.Body {
		if jsonRequestString, err := json.Marshal(request); err == nil {
			kafkaService.PublishCertifyMessage(jsonRequestString, nil, nil)
		}
	}
	return certification.NewCertifyV2OK()
}

func certify(params certification.CertifyParams, principal *models.JWTClaimBody) middleware.Responder {
	// this api can be moved to separate deployment unit if someone wants to use certification alone then
	// sign verification can be disabled and use vaccination certification generation
	valid, errorMessage := validateCertifyRequest(params)
	if !valid {
		log.Infof("Validation failure for the certificate request %+v", errorMessage)
		return certification.NewBulkCertifyBadRequest()
	}
	fmt.Printf("%+v\n", params.Body[0])
	for _, request := range params.Body {
		if jsonRequestString, err := json.Marshal(request); err == nil {
			kafkaService.PublishCertifyMessage(jsonRequestString, nil, nil)
		}
	}
	return certification.NewCertifyOK()
}

func validateCertifyRequest(params certification.CertifyParams) (bool, string) {
	if len(params.Body) < 1 {
		return false, "Atleast one certification request is expected."
	}
	return true, ""
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
	uploadEntry.TotalRecords = 0
	if err := db.CreateCertifyUpload(&uploadEntry); err != nil {
		code := "DATABASE_ERROR"
		message := err.Error()
		error := &models.Error{
			Code:    &code,
			Message: &message,
		}
		return certification.NewBulkCertifyBadRequest().WithPayload(error)
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
	if resp, err := services.QueryRegistry(typeId, filter); err == nil {
		if revokedCertificates, ok := resp[typeId].([]interface{}); ok {
			if len(revokedCertificates) > 0 {
				return certificate_revoked.NewCertificateRevokedOK()
			}
			return certificate_revoked.NewCertificateRevokedNotFound()
		}
	}
	return certificate_revoked.NewCertificateRevokedBadRequest()
}

func revokeCertificate(params certification.RevokeCertificateParams) middleware.Responder {

	if params.PreEnrollmentCode == "" || params.Dose < 0 {
		return certification.NewRevokeCertificateBadRequest()
	}
	preEnrollCode := params.PreEnrollmentCode
	dose := params.Dose

	// get associated certificates
	typeId := "VaccinationCertificate"
	filter := map[string]interface{}{

		"preEnrollmentCode": map[string]interface{}{
			"eq": preEnrollCode,
		},
		"dose": map[string]interface{}{
			"eq": params.Dose,
		},
	}

	var certificateFailedToAddToRevocationList []string
	var certificateFailedToDeleteFromVaccCertRegistry []string
	if response, err := services.QueryRegistry(typeId, filter); err != nil {
		log.Infof("Error in querying vaccination certificate %+v", err)
		return NewGenericServerError()
	} else {
		if listOfCerts, ok := response["VaccinationCertificate"].([]interface{}); ok {
			if len(listOfCerts) == 0 {
				return certification.NewRevokeCertificateNotFound()
			}
			for _, v := range listOfCerts {
				if body, ok := v.(map[string]interface{}); ok {
					certificateId := body["certificateId"].(string)
					if err := deleteVaccineCertificate(body["osid"].(string)); err != nil {
						log.Errorf("Failed to delete vaccination certificate %+v", certificateId)
						certificateFailedToDeleteFromVaccCertRegistry = append(certificateFailedToDeleteFromVaccCertRegistry, certificateId)
					} else {
						err = addCertificateToRevocationList(preEnrollCode, int(dose), certificateId)
						if err != nil {
							log.Errorf("Failed to add certificate %v to revocation list", certificateId)
							certificateFailedToAddToRevocationList = append(certificateFailedToAddToRevocationList, certificateId)
						}
					}
				}
			}
			if len(certificateFailedToAddToRevocationList) > 0 || len(certificateFailedToDeleteFromVaccCertRegistry) > 0 {
				return NewGenericServerError()
			}
			return certification.NewRevokeCertificateOK()
		} else {
			log.Errorf("Error occurred while extracting the certificates from registry response")
			return NewGenericServerError()
		}
	}
}

func deleteVaccineCertificate(osid string) error {
	typeId := "VaccinationCertificate"
	filter := map[string]interface{}{
		"osid": osid,
	}
	if _, err := services.DeleteRegistry(typeId, filter); err != nil {
		log.Errorf("Error in deleting vaccination certificate %+v", err)
		return errors.New("error in deleting vaccination certificate")
	} else {
		return nil
	}
}

func addCertificateToRevocationList(preEnrollmentCode string, dose int, certificateId string) error{
	typeId := "RevokedCertificate"

	revokedCertificate := map[string]interface{}{
		"preEnrollmentCode":     preEnrollmentCode,
		"dose":                  dose,
		"previousCertificateId": certificateId,
	}
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
	if resp, err := services.QueryRegistry(typeId, filter); err == nil {
		if revokedCertificates, ok := resp[typeId].([]interface{}); ok {
			if len(revokedCertificates) > 0 {
				log.Infof("%v certificateId already exist in revocation", certificateId)
				return nil
			}
			err := services.CreateNewRegistry(revokedCertificate, typeId)
			if err != nil {
				log.Errorf("Failed saving revoked certificate %+v", err)
				return err
			}
			log.Infof("%v certificateId added to revocation", certificateId)
			return nil
		}
	}
	return errors.New("Error occurred while adding certificate to revocation list")
}

func SortCertificatesByCreateAt(certificateArr []interface{}) []interface{} {
	sort.Slice(certificateArr, func(i, j int) bool {
		certificateA := certificateArr[i].(map[string]interface{})
		certificateB := certificateArr[j].(map[string]interface{})
		certificateACreateAt := certificateA["_osCreatedAt"].(string)
		certificateBCreateAt := certificateB["_osCreatedAt"].(string)
		return certificateACreateAt < certificateBCreateAt
	})
	return certificateArr
}
