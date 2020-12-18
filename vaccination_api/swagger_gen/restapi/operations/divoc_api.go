// Code generated by go-swagger; DO NOT EDIT.

package operations

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/loads"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"
	"github.com/go-openapi/runtime/security"
	"github.com/go-openapi/spec"
	"github.com/go-openapi/strfmt"
	"github.com/go-openapi/swag"

	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/api/swagger_gen/restapi/operations/certification"
	"github.com/divoc/api/swagger_gen/restapi/operations/configuration"
	"github.com/divoc/api/swagger_gen/restapi/operations/identity"
	"github.com/divoc/api/swagger_gen/restapi/operations/login"
	"github.com/divoc/api/swagger_gen/restapi/operations/side_effects"
	"github.com/divoc/api/swagger_gen/restapi/operations/symptoms"
	"github.com/divoc/api/swagger_gen/restapi/operations/vaccination"
)

// NewDivocAPI creates a new Divoc instance
func NewDivocAPI(spec *loads.Document) *DivocAPI {
	return &DivocAPI{
		handlers:            make(map[string]map[string]http.Handler),
		formats:             strfmt.Default,
		defaultConsumes:     "application/json",
		defaultProduces:     "application/json",
		customConsumers:     make(map[string]runtime.Consumer),
		customProducers:     make(map[string]runtime.Producer),
		PreServerShutdown:   func() {},
		ServerShutdown:      func() {},
		spec:                spec,
		useSwaggerUI:        false,
		ServeError:          errors.ServeError,
		BasicAuthenticator:  security.BasicAuth,
		APIKeyAuthenticator: security.APIKeyAuth,
		BearerAuthenticator: security.BearerAuth,

		JSONConsumer:          runtime.JSONConsumer(),
		MultipartformConsumer: runtime.DiscardConsumer,

		JSONProducer: runtime.JSONProducer(),

		GetPingHandler: GetPingHandlerFunc(func(params GetPingParams) middleware.Responder {
			return middleware.NotImplemented("operation GetPing has not yet been implemented")
		}),
		LoginPostAuthorizeHandler: login.PostAuthorizeHandlerFunc(func(params login.PostAuthorizeParams) middleware.Responder {
			return middleware.NotImplemented("operation login.PostAuthorize has not yet been implemented")
		}),
		IdentityPostIdentityVerifyHandler: identity.PostIdentityVerifyHandlerFunc(func(params identity.PostIdentityVerifyParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation identity.PostIdentityVerify has not yet been implemented")
		}),
		CertificationBulkCertifyHandler: certification.BulkCertifyHandlerFunc(func(params certification.BulkCertifyParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation certification.BulkCertify has not yet been implemented")
		}),
		CertificationCertifyHandler: certification.CertifyHandlerFunc(func(params certification.CertifyParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation certification.Certify has not yet been implemented")
		}),
		SideEffectsCreateSideEffectsHandler: side_effects.CreateSideEffectsHandlerFunc(func(params side_effects.CreateSideEffectsParams) middleware.Responder {
			return middleware.NotImplemented("operation side_effects.CreateSideEffects has not yet been implemented")
		}),
		SymptomsCreateSymptomsHandler: symptoms.CreateSymptomsHandlerFunc(func(params symptoms.CreateSymptomsParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation symptoms.CreateSymptoms has not yet been implemented")
		}),
		EventsHandler: EventsHandlerFunc(func(params EventsParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation Events has not yet been implemented")
		}),
		GetCertificateHandler: GetCertificateHandlerFunc(func(params GetCertificateParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation GetCertificate has not yet been implemented")
		}),
		ConfigurationGetConfigurationHandler: configuration.GetConfigurationHandlerFunc(func(params configuration.GetConfigurationParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation configuration.GetConfiguration has not yet been implemented")
		}),
		ConfigurationGetCurrentProgramsHandler: configuration.GetCurrentProgramsHandlerFunc(func(params configuration.GetCurrentProgramsParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation configuration.GetCurrentPrograms has not yet been implemented")
		}),
		SymptomsGetInstructionsHandler: symptoms.GetInstructionsHandlerFunc(func(params symptoms.GetInstructionsParams) middleware.Responder {
			return middleware.NotImplemented("operation symptoms.GetInstructions has not yet been implemented")
		}),
		VaccinationGetLoggedInUserInfoHandler: vaccination.GetLoggedInUserInfoHandlerFunc(func(params vaccination.GetLoggedInUserInfoParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation vaccination.GetLoggedInUserInfo has not yet been implemented")
		}),
		VaccinationGetPreEnrollmentHandler: vaccination.GetPreEnrollmentHandlerFunc(func(params vaccination.GetPreEnrollmentParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation vaccination.GetPreEnrollment has not yet been implemented")
		}),
		VaccinationGetPreEnrollmentsForFacilityHandler: vaccination.GetPreEnrollmentsForFacilityHandlerFunc(func(params vaccination.GetPreEnrollmentsForFacilityParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation vaccination.GetPreEnrollmentsForFacility has not yet been implemented")
		}),
		SideEffectsGetSideEffectsHandler: side_effects.GetSideEffectsHandlerFunc(func(params side_effects.GetSideEffectsParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation side_effects.GetSideEffects has not yet been implemented")
		}),
		SymptomsGetSymptomsHandler: symptoms.GetSymptomsHandlerFunc(func(params symptoms.GetSymptomsParams) middleware.Responder {
			return middleware.NotImplemented("operation symptoms.GetSymptoms has not yet been implemented")
		}),
		ConfigurationGetVaccinatorsHandler: configuration.GetVaccinatorsHandlerFunc(func(params configuration.GetVaccinatorsParams, principal *models.JWTClaimBody) middleware.Responder {
			return middleware.NotImplemented("operation configuration.GetVaccinators has not yet been implemented")
		}),

		HasRoleAuth: func(token string, scopes []string) (*models.JWTClaimBody, error) {
			return nil, errors.NotImplemented("oauth2 bearer auth (hasRole) has not yet been implemented")
		},
		// default authorizer is authorized meaning no requests are blocked
		APIAuthorizer: security.Authorized(),
	}
}

/*DivocAPI Digital infra for vaccination certificates */
type DivocAPI struct {
	spec            *loads.Document
	context         *middleware.Context
	handlers        map[string]map[string]http.Handler
	formats         strfmt.Registry
	customConsumers map[string]runtime.Consumer
	customProducers map[string]runtime.Producer
	defaultConsumes string
	defaultProduces string
	Middleware      func(middleware.Builder) http.Handler
	useSwaggerUI    bool

	// BasicAuthenticator generates a runtime.Authenticator from the supplied basic auth function.
	// It has a default implementation in the security package, however you can replace it for your particular usage.
	BasicAuthenticator func(security.UserPassAuthentication) runtime.Authenticator
	// APIKeyAuthenticator generates a runtime.Authenticator from the supplied token auth function.
	// It has a default implementation in the security package, however you can replace it for your particular usage.
	APIKeyAuthenticator func(string, string, security.TokenAuthentication) runtime.Authenticator
	// BearerAuthenticator generates a runtime.Authenticator from the supplied bearer token auth function.
	// It has a default implementation in the security package, however you can replace it for your particular usage.
	BearerAuthenticator func(string, security.ScopedTokenAuthentication) runtime.Authenticator

	// JSONConsumer registers a consumer for the following mime types:
	//   - application/json
	JSONConsumer runtime.Consumer
	// MultipartformConsumer registers a consumer for the following mime types:
	//   - multipart/form-data
	MultipartformConsumer runtime.Consumer

	// JSONProducer registers a producer for the following mime types:
	//   - application/json
	JSONProducer runtime.Producer

	// HasRoleAuth registers a function that takes an access token and a collection of required scopes and returns a principal
	// it performs authentication based on an oauth2 bearer token provided in the request
	HasRoleAuth func(string, []string) (*models.JWTClaimBody, error)

	// APIAuthorizer provides access control (ACL/RBAC/ABAC) by providing access to the request and authenticated principal
	APIAuthorizer runtime.Authorizer

	// GetPingHandler sets the operation handler for the get ping operation
	GetPingHandler GetPingHandler
	// LoginPostAuthorizeHandler sets the operation handler for the post authorize operation
	LoginPostAuthorizeHandler login.PostAuthorizeHandler
	// IdentityPostIdentityVerifyHandler sets the operation handler for the post identity verify operation
	IdentityPostIdentityVerifyHandler identity.PostIdentityVerifyHandler
	// CertificationBulkCertifyHandler sets the operation handler for the bulk certify operation
	CertificationBulkCertifyHandler certification.BulkCertifyHandler
	// CertificationCertifyHandler sets the operation handler for the certify operation
	CertificationCertifyHandler certification.CertifyHandler
	// SideEffectsCreateSideEffectsHandler sets the operation handler for the create side effects operation
	SideEffectsCreateSideEffectsHandler side_effects.CreateSideEffectsHandler
	// SymptomsCreateSymptomsHandler sets the operation handler for the create symptoms operation
	SymptomsCreateSymptomsHandler symptoms.CreateSymptomsHandler
	// EventsHandler sets the operation handler for the events operation
	EventsHandler EventsHandler
	// GetCertificateHandler sets the operation handler for the get certificate operation
	GetCertificateHandler GetCertificateHandler
	// ConfigurationGetConfigurationHandler sets the operation handler for the get configuration operation
	ConfigurationGetConfigurationHandler configuration.GetConfigurationHandler
	// ConfigurationGetCurrentProgramsHandler sets the operation handler for the get current programs operation
	ConfigurationGetCurrentProgramsHandler configuration.GetCurrentProgramsHandler
	// SymptomsGetInstructionsHandler sets the operation handler for the get instructions operation
	SymptomsGetInstructionsHandler symptoms.GetInstructionsHandler
	// VaccinationGetLoggedInUserInfoHandler sets the operation handler for the get logged in user info operation
	VaccinationGetLoggedInUserInfoHandler vaccination.GetLoggedInUserInfoHandler
	// VaccinationGetPreEnrollmentHandler sets the operation handler for the get pre enrollment operation
	VaccinationGetPreEnrollmentHandler vaccination.GetPreEnrollmentHandler
	// VaccinationGetPreEnrollmentsForFacilityHandler sets the operation handler for the get pre enrollments for facility operation
	VaccinationGetPreEnrollmentsForFacilityHandler vaccination.GetPreEnrollmentsForFacilityHandler
	// SideEffectsGetSideEffectsHandler sets the operation handler for the get side effects operation
	SideEffectsGetSideEffectsHandler side_effects.GetSideEffectsHandler
	// SymptomsGetSymptomsHandler sets the operation handler for the get symptoms operation
	SymptomsGetSymptomsHandler symptoms.GetSymptomsHandler
	// ConfigurationGetVaccinatorsHandler sets the operation handler for the get vaccinators operation
	ConfigurationGetVaccinatorsHandler configuration.GetVaccinatorsHandler
	// ServeError is called when an error is received, there is a default handler
	// but you can set your own with this
	ServeError func(http.ResponseWriter, *http.Request, error)

	// PreServerShutdown is called before the HTTP(S) server is shutdown
	// This allows for custom functions to get executed before the HTTP(S) server stops accepting traffic
	PreServerShutdown func()

	// ServerShutdown is called when the HTTP(S) server is shut down and done
	// handling all active connections and does not accept connections any more
	ServerShutdown func()

	// Custom command line argument groups with their descriptions
	CommandLineOptionsGroups []swag.CommandLineOptionsGroup

	// User defined logger function.
	Logger func(string, ...interface{})
}

// UseRedoc for documentation at /docs
func (o *DivocAPI) UseRedoc() {
	o.useSwaggerUI = false
}

// UseSwaggerUI for documentation at /docs
func (o *DivocAPI) UseSwaggerUI() {
	o.useSwaggerUI = true
}

// SetDefaultProduces sets the default produces media type
func (o *DivocAPI) SetDefaultProduces(mediaType string) {
	o.defaultProduces = mediaType
}

// SetDefaultConsumes returns the default consumes media type
func (o *DivocAPI) SetDefaultConsumes(mediaType string) {
	o.defaultConsumes = mediaType
}

// SetSpec sets a spec that will be served for the clients.
func (o *DivocAPI) SetSpec(spec *loads.Document) {
	o.spec = spec
}

// DefaultProduces returns the default produces media type
func (o *DivocAPI) DefaultProduces() string {
	return o.defaultProduces
}

// DefaultConsumes returns the default consumes media type
func (o *DivocAPI) DefaultConsumes() string {
	return o.defaultConsumes
}

// Formats returns the registered string formats
func (o *DivocAPI) Formats() strfmt.Registry {
	return o.formats
}

// RegisterFormat registers a custom format validator
func (o *DivocAPI) RegisterFormat(name string, format strfmt.Format, validator strfmt.Validator) {
	o.formats.Add(name, format, validator)
}

// Validate validates the registrations in the DivocAPI
func (o *DivocAPI) Validate() error {
	var unregistered []string

	if o.JSONConsumer == nil {
		unregistered = append(unregistered, "JSONConsumer")
	}
	if o.MultipartformConsumer == nil {
		unregistered = append(unregistered, "MultipartformConsumer")
	}

	if o.JSONProducer == nil {
		unregistered = append(unregistered, "JSONProducer")
	}

	if o.HasRoleAuth == nil {
		unregistered = append(unregistered, "HasRoleAuth")
	}

	if o.GetPingHandler == nil {
		unregistered = append(unregistered, "GetPingHandler")
	}
	if o.LoginPostAuthorizeHandler == nil {
		unregistered = append(unregistered, "login.PostAuthorizeHandler")
	}
	if o.IdentityPostIdentityVerifyHandler == nil {
		unregistered = append(unregistered, "identity.PostIdentityVerifyHandler")
	}
	if o.CertificationBulkCertifyHandler == nil {
		unregistered = append(unregistered, "certification.BulkCertifyHandler")
	}
	if o.CertificationCertifyHandler == nil {
		unregistered = append(unregistered, "certification.CertifyHandler")
	}
	if o.SideEffectsCreateSideEffectsHandler == nil {
		unregistered = append(unregistered, "side_effects.CreateSideEffectsHandler")
	}
	if o.SymptomsCreateSymptomsHandler == nil {
		unregistered = append(unregistered, "symptoms.CreateSymptomsHandler")
	}
	if o.EventsHandler == nil {
		unregistered = append(unregistered, "EventsHandler")
	}
	if o.GetCertificateHandler == nil {
		unregistered = append(unregistered, "GetCertificateHandler")
	}
	if o.ConfigurationGetConfigurationHandler == nil {
		unregistered = append(unregistered, "configuration.GetConfigurationHandler")
	}
	if o.ConfigurationGetCurrentProgramsHandler == nil {
		unregistered = append(unregistered, "configuration.GetCurrentProgramsHandler")
	}
	if o.SymptomsGetInstructionsHandler == nil {
		unregistered = append(unregistered, "symptoms.GetInstructionsHandler")
	}
	if o.VaccinationGetLoggedInUserInfoHandler == nil {
		unregistered = append(unregistered, "vaccination.GetLoggedInUserInfoHandler")
	}
	if o.VaccinationGetPreEnrollmentHandler == nil {
		unregistered = append(unregistered, "vaccination.GetPreEnrollmentHandler")
	}
	if o.VaccinationGetPreEnrollmentsForFacilityHandler == nil {
		unregistered = append(unregistered, "vaccination.GetPreEnrollmentsForFacilityHandler")
	}
	if o.SideEffectsGetSideEffectsHandler == nil {
		unregistered = append(unregistered, "side_effects.GetSideEffectsHandler")
	}
	if o.SymptomsGetSymptomsHandler == nil {
		unregistered = append(unregistered, "symptoms.GetSymptomsHandler")
	}
	if o.ConfigurationGetVaccinatorsHandler == nil {
		unregistered = append(unregistered, "configuration.GetVaccinatorsHandler")
	}

	if len(unregistered) > 0 {
		return fmt.Errorf("missing registration: %s", strings.Join(unregistered, ", "))
	}

	return nil
}

// ServeErrorFor gets a error handler for a given operation id
func (o *DivocAPI) ServeErrorFor(operationID string) func(http.ResponseWriter, *http.Request, error) {
	return o.ServeError
}

// AuthenticatorsFor gets the authenticators for the specified security schemes
func (o *DivocAPI) AuthenticatorsFor(schemes map[string]spec.SecurityScheme) map[string]runtime.Authenticator {
	result := make(map[string]runtime.Authenticator)
	for name := range schemes {
		switch name {
		case "hasRole":
			result[name] = o.BearerAuthenticator(name, func(token string, scopes []string) (interface{}, error) {
				return o.HasRoleAuth(token, scopes)
			})

		}
	}
	return result
}

// Authorizer returns the registered authorizer
func (o *DivocAPI) Authorizer() runtime.Authorizer {
	return o.APIAuthorizer
}

// ConsumersFor gets the consumers for the specified media types.
// MIME type parameters are ignored here.
func (o *DivocAPI) ConsumersFor(mediaTypes []string) map[string]runtime.Consumer {
	result := make(map[string]runtime.Consumer, len(mediaTypes))
	for _, mt := range mediaTypes {
		switch mt {
		case "application/json":
			result["application/json"] = o.JSONConsumer
		case "multipart/form-data":
			result["multipart/form-data"] = o.MultipartformConsumer
		}

		if c, ok := o.customConsumers[mt]; ok {
			result[mt] = c
		}
	}
	return result
}

// ProducersFor gets the producers for the specified media types.
// MIME type parameters are ignored here.
func (o *DivocAPI) ProducersFor(mediaTypes []string) map[string]runtime.Producer {
	result := make(map[string]runtime.Producer, len(mediaTypes))
	for _, mt := range mediaTypes {
		switch mt {
		case "application/json":
			result["application/json"] = o.JSONProducer
		}

		if p, ok := o.customProducers[mt]; ok {
			result[mt] = p
		}
	}
	return result
}

// HandlerFor gets a http.Handler for the provided operation method and path
func (o *DivocAPI) HandlerFor(method, path string) (http.Handler, bool) {
	if o.handlers == nil {
		return nil, false
	}
	um := strings.ToUpper(method)
	if _, ok := o.handlers[um]; !ok {
		return nil, false
	}
	if path == "/" {
		path = ""
	}
	h, ok := o.handlers[um][path]
	return h, ok
}

// Context returns the middleware context for the divoc API
func (o *DivocAPI) Context() *middleware.Context {
	if o.context == nil {
		o.context = middleware.NewRoutableContext(o.spec, o, nil)
	}

	return o.context
}

func (o *DivocAPI) initHandlerCache() {
	o.Context() // don't care about the result, just that the initialization happened
	if o.handlers == nil {
		o.handlers = make(map[string]map[string]http.Handler)
	}

	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/ping"] = NewGetPing(o.context, o.GetPingHandler)
	if o.handlers["POST"] == nil {
		o.handlers["POST"] = make(map[string]http.Handler)
	}
	o.handlers["POST"]["/authorize"] = login.NewPostAuthorize(o.context, o.LoginPostAuthorizeHandler)
	if o.handlers["POST"] == nil {
		o.handlers["POST"] = make(map[string]http.Handler)
	}
	o.handlers["POST"]["/identity/verify"] = identity.NewPostIdentityVerify(o.context, o.IdentityPostIdentityVerifyHandler)
	if o.handlers["POST"] == nil {
		o.handlers["POST"] = make(map[string]http.Handler)
	}
	o.handlers["POST"]["/bulkCertify"] = certification.NewBulkCertify(o.context, o.CertificationBulkCertifyHandler)
	if o.handlers["POST"] == nil {
		o.handlers["POST"] = make(map[string]http.Handler)
	}
	o.handlers["POST"]["/certify"] = certification.NewCertify(o.context, o.CertificationCertifyHandler)
	if o.handlers["POST"] == nil {
		o.handlers["POST"] = make(map[string]http.Handler)
	}
	o.handlers["POST"]["/sideEffects"] = side_effects.NewCreateSideEffects(o.context, o.SideEffectsCreateSideEffectsHandler)
	if o.handlers["POST"] == nil {
		o.handlers["POST"] = make(map[string]http.Handler)
	}
	o.handlers["POST"]["/symptoms"] = symptoms.NewCreateSymptoms(o.context, o.SymptomsCreateSymptomsHandler)
	if o.handlers["POST"] == nil {
		o.handlers["POST"] = make(map[string]http.Handler)
	}
	o.handlers["POST"]["/events"] = NewEvents(o.context, o.EventsHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/certificates/{phone}"] = NewGetCertificate(o.context, o.GetCertificateHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/divoc/configuration"] = configuration.NewGetConfiguration(o.context, o.ConfigurationGetConfigurationHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/programs/current"] = configuration.NewGetCurrentPrograms(o.context, o.ConfigurationGetCurrentProgramsHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/instructions"] = symptoms.NewGetInstructions(o.context, o.SymptomsGetInstructionsHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/users/me"] = vaccination.NewGetLoggedInUserInfo(o.context, o.VaccinationGetLoggedInUserInfoHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/preEnrollments/{preEnrollmentCode}"] = vaccination.NewGetPreEnrollment(o.context, o.VaccinationGetPreEnrollmentHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/preEnrollments"] = vaccination.NewGetPreEnrollmentsForFacility(o.context, o.VaccinationGetPreEnrollmentsForFacilityHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/sideEffects"] = side_effects.NewGetSideEffects(o.context, o.SideEffectsGetSideEffectsHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/symptoms"] = symptoms.NewGetSymptoms(o.context, o.SymptomsGetSymptomsHandler)
	if o.handlers["GET"] == nil {
		o.handlers["GET"] = make(map[string]http.Handler)
	}
	o.handlers["GET"]["/vaccinators"] = configuration.NewGetVaccinators(o.context, o.ConfigurationGetVaccinatorsHandler)
}

// Serve creates a http handler to serve the API over HTTP
// can be used directly in http.ListenAndServe(":8000", api.Serve(nil))
func (o *DivocAPI) Serve(builder middleware.Builder) http.Handler {
	o.Init()

	if o.Middleware != nil {
		return o.Middleware(builder)
	}
	if o.useSwaggerUI {
		return o.context.APIHandlerSwaggerUI(builder)
	}
	return o.context.APIHandler(builder)
}

// Init allows you to just initialize the handler cache, you can then recompose the middleware as you see fit
func (o *DivocAPI) Init() {
	if len(o.handlers) == 0 {
		o.initHandlerCache()
	}
}

// RegisterConsumer allows you to add (or override) a consumer for a media type.
func (o *DivocAPI) RegisterConsumer(mediaType string, consumer runtime.Consumer) {
	o.customConsumers[mediaType] = consumer
}

// RegisterProducer allows you to add (or override) a producer for a media type.
func (o *DivocAPI) RegisterProducer(mediaType string, producer runtime.Producer) {
	o.customProducers[mediaType] = producer
}

// AddMiddlewareFor adds a http middleware to existing handler
func (o *DivocAPI) AddMiddlewareFor(method, path string, builder middleware.Builder) {
	um := strings.ToUpper(method)
	if path == "/" {
		path = ""
	}
	o.Init()
	if h, ok := o.handlers[um][path]; ok {
		o.handlers[method][path] = builder(h)
	}
}
