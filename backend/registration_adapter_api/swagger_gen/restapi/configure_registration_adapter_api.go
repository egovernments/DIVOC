// This file is safe to edit. Once it exists it will not be overwritten

package restapi

import (
	"crypto/tls"
	"github.com/divoc/registration-adapter-api/pkg"
	"net/http"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"

	"github.com/divoc/registration-adapter-api/swagger_gen/restapi/operations"
)

//go:generate swagger generate server --target ../../swagger_gen --name RegistrationAdapterAPI --spec ../../../../interfaces/registration-adapter-api.yaml --principal interface{} --exclude-main

func configureFlags(api *operations.RegistrationAdapterAPIAPI) {
	// api.CommandLineOptionsGroups = []swag.CommandLineOptionsGroup{ ... }
}

func configureAPI(api *operations.RegistrationAdapterAPIAPI) http.Handler {
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

	if api.ConfirmOTPHandler == nil {
		api.ConfirmOTPHandler = operations.ConfirmOTPHandlerFunc(func(params operations.ConfirmOTPParams) middleware.Responder {
			return middleware.NotImplemented("operation operations.ConfirmOTP has not yet been implemented")
		})
	}
	if api.CreateNewBeneficiaryHandler == nil {
		api.CreateNewBeneficiaryHandler = operations.CreateNewBeneficiaryHandlerFunc(func(params operations.CreateNewBeneficiaryParams) middleware.Responder {
			return middleware.NotImplemented("operation operations.CreateNewBeneficiary has not yet been implemented")
		})
	}
	if api.DeleteBeneficiaryByIDHandler == nil {
		api.DeleteBeneficiaryByIDHandler = operations.DeleteBeneficiaryByIDHandlerFunc(func(params operations.DeleteBeneficiaryByIDParams) middleware.Responder {
			return middleware.NotImplemented("operation operations.DeleteBeneficiaryByID has not yet been implemented")
		})
	}
	if api.GenerateOTPHandler == nil {
		api.GenerateOTPHandler = operations.GenerateOTPHandlerFunc(func(params operations.GenerateOTPParams) middleware.Responder {
			return middleware.NotImplemented("operation operations.GenerateOTP has not yet been implemented")
		})
	}
	if api.GetBeneficiariesHandler == nil {
		api.GetBeneficiariesHandler = operations.GetBeneficiariesHandlerFunc(func(params operations.GetBeneficiariesParams) middleware.Responder {
			return middleware.NotImplemented("operation operations.GetBeneficiaries has not yet been implemented")
		})
	}

	api.PreServerShutdown = func() {}

	api.ServerShutdown = func() {}
	pkg.SetupHandlers(api)
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
