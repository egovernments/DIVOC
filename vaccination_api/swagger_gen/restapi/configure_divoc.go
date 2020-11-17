// This file is safe to edit. Once it exists it will not be overwritten

package restapi

import (
	"crypto/tls"
	"github.com/divoc/api/pkg"
	"github.com/divoc/api/swagger_gen/utils"
	"github.com/go-openapi/runtime/security"
	"net/http"

	"github.com/divoc/api/swagger_gen/restapi/operations"
	"github.com/go-openapi/errors"
	"github.com/go-openapi/runtime"
)

//go:generate swagger generate server --target ../../swagger_gen --name Divoc --spec ../../spec/api.yaml --principal interface{} --exclude-main

func configureFlags(api *operations.DivocAPI) {
	// api.CommandLineOptionsGroups = []swag.CommandLineOptionsGroup{ ... }
}

func configureAPI(api *operations.DivocAPI) http.Handler {
	// configure the api here
	api.ServeError = errors.ServeError

	// Set your custom logger if needed. Default one is log.Printf
	// Expected interface func(string, ...interface{})
	//
	// Example:
	// api.Logger = log.Printf

	api.UseSwaggerUI()
	// To continue using redoc as your UI, uncomment the following line
	// api.UseRedoc()

	api.JSONConsumer = runtime.JSONConsumer()

	api.JSONProducer = runtime.JSONProducer()

	api.BearerAuth = utils.ValidateHeader // attached as middleware

	pkg.SetupHandlers(api)
	api.APIAuthorizer = security.Authorized()
	// Set your custom authorizer if needed. Default one is security.Authorized()
	// Expected interface runtime.Authorizer
	//
	// Example:
	// api.APIAuthorizer = security.Authorized()
	//if api.GetPingHandler == nil {
	//	api.GetPingHandler = operations.GetPingHandlerFunc(func(params operations.GetPingParams) middleware.Responder {
	//		return middleware.NotImplemented("operation operations.GetPing has not yet been implemented")
	//	})
	//}
	//if api.ConfigurationGetProgramsCurrentHandler == nil {
	//	api.ConfigurationGetProgramsCurrentHandler = configuration.GetProgramsCurrentHandlerFunc(func(params configuration.GetProgramsCurrentParams, principal interface{}) middleware.Responder {
	//		return middleware.NotImplemented("operation configuration.GetProgramsCurrent has not yet been implemented")
	//	})
	//}
	//if api.VaccinationGetRecipientsHandler == nil {
	//	api.VaccinationGetRecipientsHandler = vaccination.GetRecipientsHandlerFunc(func(params vaccination.GetRecipientsParams, principal interface{}) middleware.Responder {
	//		return middleware.NotImplemented("operation vaccination.GetRecipients has not yet been implemented")
	//	})
	//}
	//if api.LoginPostAuthorizeHandler == nil {
	//	api.LoginPostAuthorizeHandler = login.PostAuthorizeHandlerFunc(func(params login.PostAuthorizeParams, principal interface{}) middleware.Responder {
	//		return middleware.NotImplemented("operation login.PostAuthorize has not yet been implemented")
	//	})
	//}
	//if api.IdentityPostIdentityVerifyHandler == nil {
	//	api.IdentityPostIdentityVerifyHandler = identity.PostIdentityVerifyHandlerFunc(func(params identity.PostIdentityVerifyParams, principal interface{}) middleware.Responder {
	//		return middleware.NotImplemented("operation identity.PostIdentityVerify has not yet been implemented")
	//	})
	//}
	//if api.CertificationCertifyHandler == nil {
	//	api.CertificationCertifyHandler = certification.CertifyHandlerFunc(func(params certification.CertifyParams, principal interface{}) middleware.Responder {
	//		return middleware.NotImplemented("operation certification.Certify has not yet been implemented")
	//	})
	//}
	//if api.ConfigurationGetConfigurationHandler == nil {
	//	api.ConfigurationGetConfigurationHandler = configuration.GetConfigurationHandlerFunc(func(params configuration.GetConfigurationParams, principal interface{}) middleware.Responder {
	//		return middleware.NotImplemented("operation configuration.GetConfiguration has not yet been implemented")
	//	})
	//}
	//if api.VaccinationGetPreEnrollmentHandler == nil {
	//	api.VaccinationGetPreEnrollmentHandler = vaccination.GetPreEnrollmentHandlerFunc(func(params vaccination.GetPreEnrollmentParams, principal interface{}) middleware.Responder {
	//		return middleware.NotImplemented("operation vaccination.GetPreEnrollment has not yet been implemented")
	//	})
	//}
	//if api.VaccinationGetPreEnrollmentsForFacilityHandler == nil {
	//	api.VaccinationGetPreEnrollmentsForFacilityHandler = vaccination.GetPreEnrollmentsForFacilityHandlerFunc(func(params vaccination.GetPreEnrollmentsForFacilityParams, principal interface{}) middleware.Responder {
	//		return middleware.NotImplemented("operation vaccination.GetPreEnrollmentsForFacility has not yet been implemented")
	//	})
	//}
	//if api.VaccinationRegisterRecipientHandler == nil {
	//	api.VaccinationRegisterRecipientHandler = vaccination.RegisterRecipientHandlerFunc(func(params vaccination.RegisterRecipientParams, principal interface{}) middleware.Responder {
	//		return middleware.NotImplemented("operation vaccination.RegisterRecipient has not yet been implemented")
	//	})
	//}

	api.PreServerShutdown = func() {}

	api.ServerShutdown = func() {}

	return setupGlobalMiddleware(api.Serve(setupMiddlewares))
}

// The TLS configuration before HTTPS server starts.
func configureTLS(tlsConfig *tls.Config) {
	// Make all necessary changes to the TLS configuration here.
}

// As soon as server is initialized but not run yet, this function will be called.
// If you need to modify a config, store server instance to stop it individually later, this is the place.
// This function can be called multiple times, depending on the number of serving schemes.
// scheme value will be set accordingly: "http", "https" or "unix"
func configureServer(s *http.Server, scheme, addr string) {
}

// The middleware configuration is for the handler executors. These do not apply to the swagger.json document.
// The middleware executes after routing but before authentication, binding and validation
func setupMiddlewares(handler http.Handler) http.Handler {
	return handler
}

// The middleware configuration happens before anything, this middleware also applies to serving the swagger.json document.
// So this is a good place to plug in a panic handling middleware, logging and metrics
func setupGlobalMiddleware(handler http.Handler) http.Handler {
	return handler
}
