package models

type CertifiedMessage struct {
	Name              string   `json:"name"`
	Contact           []string `json:"contact"`
	Mobile            string   `json:"mobile"`
	PreEnrollmentCode string   `json:"preEnrollmentCode"`
	CertificateId     string   `json:"certificateId"`
	Certificate       string   `json:"certificate"`
	Meta              struct {
		PreviousCertificateID string `json:"previousCertificateId,omitempty"`
	} `json:"meta"`
	Dose int `json:"dose"`
}
