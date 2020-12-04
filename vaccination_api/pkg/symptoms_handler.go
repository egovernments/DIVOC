package pkg

import (
	"github.com/divoc/api/swagger_gen/restapi/operations/symptoms"
	"github.com/divoc/kernel_library/services"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
)

func createSymptoms(params symptoms.CreateSymptomsParams, principle interface{}) middleware.Responder {
	for _, symptom := range params.Body {
		services.MakeRegistryCreateRequest(symptom, "Symptom")
	}
	return symptoms.NewCreateSymptomsOK()
}

func getSymptoms(params symptoms.GetSymptomsParams) middleware.Responder {
	typeId := "Symptom"
	filter := map[string]interface{}{
		"@type": map[string]interface{}{
			"eq": typeId,
		},
	}
	queryResults, err := services.QueryRegistry(typeId, filter)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return NewGenericServerError()
	}
	return NewGenericJSONResponse(queryResults[typeId])
}

func getInstructions(params symptoms.GetInstructionsParams) middleware.Responder {
	typeId := "instructions"
	filter := map[string]interface{}{
		"@type": map[string]interface{}{
			"eq": typeId,
		},
	}
	queryResults, err := services.QueryRegistry(typeId, filter)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return NewGenericServerError()
	}
	return NewGenericJSONResponse(queryResults[typeId])
}
