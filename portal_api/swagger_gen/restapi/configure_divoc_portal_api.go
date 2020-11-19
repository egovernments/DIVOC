// This file is safe to edit. Once it exists it will not be overwritten

package restapi

import (
	"crypto/tls"
	"net/http"
	"github.com/divoc/portal-api/pkg"
	"github.com/go-openapi/errors"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"

	"github.com/divoc/portal-api/swagger_gen/restapi/operations"
)

//go:generate swagger generate server --target ../../swagger_gen --name DivocPortalAPI --spec ../../../interfaces/admin-portal.yaml --principal interface{} --exclude-main

func configureFlags(api *operations.DivocPortalAPIAPI) {
	// api.CommandLineOptionsGroups = []swag.CommandLineOptionsGroup{ ... }
}

func configureAPI(api *operations.DivocPortalAPIAPI) http.Handler {
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
	api.MultipartformConsumer = runtime.DiscardConsumer

	api.JSONProducer = runtime.JSONProducer()

	api.HasRoleAuth = func(jwtToken string, expectedRole []string) (interface{}, error) {
		//todo: enforce jwt role/scope check
		return "user", nil
	}


	//// Applies when the "Authorization" header is set
	//if api.IsUserAuth == nil {
	//	api.IsUserAuth = func(token string) (interface{}, error) {
	//		return nil, errors.NotImplemented("api key auth (isUser) Authorization from header param [Authorization] has not yet been implemented")
	//	}
	//}

	pkg.SetupHandlers(api)
	// Set your custom authorizer if needed. Default one is security.Authorized()
	// Expected interface runtime.Authorizer
	//
	// Example:
	// api.APIAuthorizer = security.Authorized()
	if api.PostFacilitiesHandler == nil {
		api.PostFacilitiesHandler = operations.PostFacilitiesHandlerFunc(func(params operations.PostFacilitiesParams, principal interface{}) middleware.Responder {
			return middleware.NotImplemented("operation operations.PostFacilities has not yet been implemented")
		})
	}
	if api.PostVaccinatorsHandler == nil {
		api.PostVaccinatorsHandler = operations.PostVaccinatorsHandlerFunc(func(params operations.PostVaccinatorsParams, principal interface{}) middleware.Responder {
			return middleware.NotImplemented("operation operations.PostVaccinators has not yet been implemented")
		})
	}
	if api.CreateMedicineHandler == nil {
		api.CreateMedicineHandler = operations.CreateMedicineHandlerFunc(func(params operations.CreateMedicineParams, principal interface{}) middleware.Responder {
			return middleware.NotImplemented("operation operations.CreateMedicine has not yet been implemented")
		})
	}
	if api.CreateProgramHandler == nil {
		api.CreateProgramHandler = operations.CreateProgramHandlerFunc(func(params operations.CreateProgramParams, principal interface{}) middleware.Responder {
			return middleware.NotImplemented("operation operations.CreateProgram has not yet been implemented")
		})
	}

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
