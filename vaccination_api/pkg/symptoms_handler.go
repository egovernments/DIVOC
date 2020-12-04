package pkg

import (
	"github.com/divoc/api/swagger_gen/restapi/operations/symptoms"
	"github.com/go-openapi/runtime/middleware"
)

func createSymptoms(symptoms.CreateSymptomsParams, interface{}) middleware.Responder {
	return symptoms.NewCreateSymptomsOK()
}
