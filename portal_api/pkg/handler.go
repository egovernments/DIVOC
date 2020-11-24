package pkg

import (
	"encoding/json"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func SetupHandlers(api *operations.DivocPortalAPIAPI) {
	api.CreateMedicineHandler = operations.CreateMedicineHandlerFunc(createMedicineHandler)
	api.CreateProgramHandler = operations.CreateProgramHandlerFunc(createProgramHandler)
	api.PostFacilitiesHandler = operations.PostFacilitiesHandlerFunc(postFacilitiesHandler)
	api.PostVaccinatorsHandler = operations.PostVaccinatorsHandlerFunc(postVaccinatorsHandler)
}

type GenericResponse struct {
	statusCode int
}

func (o *GenericResponse) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	rw.Header().Del(runtime.HeaderContentType) //Remove Content-Type on empty responses

	rw.WriteHeader(o.statusCode)
}

func NewGenericStatusOk() middleware.Responder {
	return &GenericResponse{statusCode: 200}
}

func NewGenericServerError() middleware.Responder {
	return &GenericResponse{statusCode: 500}
}


func createMedicineHandler(params operations.CreateMedicineParams, principal interface{}) middleware.Responder {
	log.Infof("Create medicine %+v", params.Body)
	objectId:="Medicine"
	requestBody, err := json.Marshal(params.Body)
	if err != nil {
		return operations.NewCreateMedicineBadRequest()
	}
	requestMap := make(map[string]interface{})
	err = json.Unmarshal(requestBody, &requestMap)
	if err != nil {
		log.Info(err)
		return NewGenericServerError()
	}
	return makeRegistryCreateRequest(requestMap, objectId)
}


func registryUrl(operationId string) string {
	url := config.Config.Registry.Url + "/" + operationId
	return url
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

