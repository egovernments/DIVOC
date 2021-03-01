package models

import "github.com/divoc/api/swagger_gen/models"

type CertifiedMessage struct {
	Name              string   `json:"name"`
	Contact           []string `json:"contact"`
	Mobile            string   `json:"mobile"`
	PreEnrollmentCode string   `json:"preEnrollmentCode"`
	CertificateId     string   `json:"certificateId"`
	Certificate       Certificate `json:"certificate"`
	Meta              models.CertificationRequestV2Meta `json:"meta"`
}
