package pkg

import (
	"github.com/divoc/api/pkg/auth"
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

func createReportedSideEffects(params report_side_effects.CreateReportedSideEffectsParams) middleware.Responder {
	claimBody := auth.ExtractClaimBodyFromHeader(params.HTTPRequest)
	mobileNumber := ""
	if claimBody != nil {
		isAuthorized := auth.AuthorizeRole([]string{"recipient"}, claimBody)
		if !isAuthorized {
			return report_side_effects.NewCreateReportedSideEffectsUnauthorized()
		}
		mobileNumber = claimBody.PreferredUsername
	} else {
		//TODO: send certificate json and verify
		mobileNumber = params.Body.MobileNumber
	}
	recipientSideEffects := RecipientSideEffects{
		RecipientCertificateId: params.Body.CertificateID,
		RecipientMobileNumber:  mobileNumber,
		SideEffectsResponse:    params.Body.SideEffectsResponse,
	}

	services.MakeRegistryCreateRequest(recipientSideEffects, RecipientSideEffectsEntity)
	return report_side_effects.NewCreateReportedSideEffectsOK()
}
