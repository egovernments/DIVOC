package pkg

import (
	kafkaService "github.com/divoc/api/pkg/services"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/api/swagger_gen/restapi/operations/report_side_effects"
	"github.com/divoc/kernel_library/services"
	"github.com/go-openapi/runtime/middleware"
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
		event := kafkaService.ReportedSideEffectsEvent{
			SideEffectsResponse:    *value,
			RecipientCertificateId: params.Body.CertificateID,
		}
		kafkaService.PublishReportedSideEffects(event)
	}
	return report_side_effects.NewCreateReportedSideEffectsOK()
}
