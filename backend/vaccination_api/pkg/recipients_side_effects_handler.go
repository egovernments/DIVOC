package pkg

import (
	eventModels "github.com/divoc/api/pkg/models"
	communicationService "github.com/divoc/api/pkg/services"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/api/swagger_gen/restapi/operations/report_side_effects"
	"github.com/divoc/kernel_library/services"
	"github.com/go-openapi/runtime/middleware"
	"time"
)

const RecipientSideEffectsEntity = "RecipientSideEffects"

type RecipientSideEffects struct {
	RecipientCertificateId string                        `json:"recipientCertificateId"`
	RecipientMobileNumber  string                        `json:"recipientMobileNumber"`
	SideEffectsResponse    []*models.SideEffectsResponse `json:"sideEffectsResponse"`
}

func createReportedSideEffects(params report_side_effects.CreateReportedSideEffectsParams, claimBody *models.JWTClaimBody) middleware.Responder {
	mobileNumber := claimBody.PreferredUsername
	recipientSideEffects := RecipientSideEffects{
		RecipientCertificateId: params.Body.CertificateID,
		RecipientMobileNumber:  mobileNumber,
		SideEffectsResponse:    params.Body.SideEffectsResponse,
	}

	services.MakeRegistryCreateRequest(recipientSideEffects, RecipientSideEffectsEntity)
	for _, value := range recipientSideEffects.SideEffectsResponse {
		event := eventModels.ReportedSideEffectsEvent{
			SideEffectsResponse:    *value,
			RecipientCertificateId: params.Body.CertificateID,
			Date:                   time.Now(),
		}
		communicationService.PublishReportedSideEffects(event)
	}
	return report_side_effects.NewCreateReportedSideEffectsOK()
}
