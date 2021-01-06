package models

import (
	"github.com/divoc/api/swagger_gen/models"
	"time"
)

type ReportedSideEffectsEvent struct {
	models.SideEffectsResponse
	RecipientCertificateId string    `json:"recipientCertificateId"`
	Date                   time.Time `json:"date"`
}
