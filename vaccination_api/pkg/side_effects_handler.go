package pkg

import (
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/api/swagger_gen/restapi/operations/side_effects"
	"github.com/divoc/api/swagger_gen/restapi/operations/symptoms"
	"github.com/divoc/kernel_library/services"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
)

const SideEffectsEntity = "SideEffects"

func createSideEffects(params side_effects.CreateSideEffectsParams) middleware.Responder {
	services.MakeRegistryCreateRequest(params.Body, SideEffectsEntity)
	return symptoms.NewCreateSymptomsOK()
}

func getSideEffects(params side_effects.GetSideEffectsParams, principal *models.JWTClaimBody) middleware.Responder {
	filter := map[string]interface{}{
		"@type": map[string]interface{}{
			"eq": SideEffectsEntity,
		},
	}
	queryResults, err := services.QueryRegistry(SideEffectsEntity, filter)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return NewGenericServerError()
	}
	return NewGenericJSONResponse(queryResults[SideEffectsEntity])
}
