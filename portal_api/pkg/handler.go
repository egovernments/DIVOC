package pkg

import ("github.com/divoc/portal-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime/middleware"
)

func SetupHandlers(api *operations.DivocPortalAPIAPI) {
	api.CreateMedicineHandler = operations.CreateMedicineHandlerFunc(createMedicineHandler)
	api.CreateProgramHandler = operations.CreateProgramHandlerFunc(createProgramHandler)
	api.PostFacilitiesHandler = operations.PostFacilitiesHandlerFunc(postFacilitiesHandler)
	api.PostVaccinatorsHandler = operations.PostVaccinatorsHandlerFunc(postVaccinatorsHandler)
}

func createMedicineHandler(params operations.CreateMedicineParams, principal interface{}) middleware.Responder {
	return operations.NewCreateMedicineOK()
}
func createProgramHandler(params operations.CreateProgramParams, principal interface{}) middleware.Responder {
	return operations.NewCreateProgramOK()
}
func postFacilitiesHandler(params operations.PostFacilitiesParams, principal interface{}) middleware.Responder {
	return operations.NewPostFacilitiesOK()
}

func postVaccinatorsHandler(params operations.PostVaccinatorsParams, principal interface{}) middleware.Responder {
	return operations.NewPostVaccinatorsOK()
}

