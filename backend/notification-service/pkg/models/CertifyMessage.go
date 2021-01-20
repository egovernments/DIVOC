package models

type CertifiedMessage struct {
	Name              string   `json:"name"`
	Mobile            string   `json:"mobile"`
	Contact           []string `json:"contact"`
	PreEnrollmentCode string   `json:"preEnrollmentCode"`
	CertificateId     string   `json:"certificateId"`
	Certificate       string   `json:"certificate"`
}
