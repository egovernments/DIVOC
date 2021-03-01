package models

type CertifiedMessage struct {
	Name              string   `json:"name"`
	Contact           []string `json:"contact"`
	Mobile            string   `json:"mobile"`
	PreEnrollmentCode string   `json:"preEnrollmentCode"`
	CertificateId     string   `json:"certificateId"`
	Certificate       Certificate
	Meta              interface{} `json:"meta"`
}
