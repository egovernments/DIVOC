package pkg

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/api/swagger_gen/restapi/operations"
	"github.com/divoc/api/swagger_gen/restapi/operations/certification"
	"github.com/divoc/api/swagger_gen/restapi/operations/configuration"
	"github.com/divoc/api/swagger_gen/restapi/operations/identity"
	"github.com/divoc/api/swagger_gen/restapi/operations/login"
	"github.com/divoc/api/swagger_gen/restapi/operations/vaccination"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"
	"net/http"
	"strings"
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

func pingResponder(params operations.GetPingParams) middleware.Responder {
	return operations.NewGetPingOK()
}

func getLoggedInUserInfo(params vaccination.GetLoggedInUserInfoParams, principal interface{}) middleware.Responder {
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

func getVaccinators(params configuration.GetVaccinatorsParams, principal interface{}) middleware.Responder {
	scopeId := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization"))
	vaccinators := getVaccinatorsForFacility(scopeId)
	return NewGenericJSONResponse(vaccinators)
}

func getCurrentProgramsResponder(params configuration.GetCurrentProgramsParams, principal interface{}) middleware.Responder {
	scopeId := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization"))
	programsFor := findProgramsForFacility(scopeId)
	return configuration.NewGetCurrentProgramsOK().WithPayload(programsFor)
}

func getConfigurationResponder(params configuration.GetConfigurationParams, principal interface{}) middleware.Responder {
	payload := &models.ApplicationConfiguration{
		Navigation: nil,
		Styles:     map[string]string{"a": "a"},
		Validation: []string{"a", "b", "c", "d", "e"},
	}
	return configuration.NewGetConfigurationOK().WithPayload(payload)
}

func postIdentityHandler(params identity.PostIdentityVerifyParams, pricipal interface{}) middleware.Responder {
	if strings.TrimSpace(params.Body.Token) != "" {
		return identity.NewPostIdentityVerifyOK()
	}
	return identity.NewPostIdentityVerifyPartialContent()
}

func getPreEnrollment(params vaccination.GetPreEnrollmentParams, pricipal interface{}) middleware.Responder {
	code := params.PreEnrollmentCode
	scopeId := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization"))
	if enrollment, err := findEnrollmentScopeAndCode(scopeId, code); err == nil {
		return vaccination.NewGetPreEnrollmentOK().WithPayload(enrollment)
	}
	return NewGenericServerError()
}

func getPreEnrollmentForFacility(params vaccination.GetPreEnrollmentsForFacilityParams, pricipal interface{}) middleware.Responder {
	scopeId := getUserAssociatedFacility(params.HTTPRequest.Header.Get("Authorization"))
	if enrollments, err := findEnrollmentsForScope(scopeId); err == nil {
		return vaccination.NewGetPreEnrollmentsForFacilityOK().WithPayload(enrollments)
	}
	return NewGenericServerError()
}

func certify(params certification.CertifyParams, pricipal interface{}) middleware.Responder {
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
