package models

import (
	"fmt"
	"github.com/divoc/api/config"
	"strconv"
	"strings"
	"time"
)

type Certificate struct {
	Context           []string `json:"@context"`
	Type              []string `json:"type"`
	CredentialSubject struct {
		Type        string `json:"type"`
		ID          string `json:"id"`
		RefId       string `json:"refId"`
		Uhid        string `json:"uhid"`
		Name        string `json:"name"`
		Gender      string `json:"gender"`
		Age         string `json:"age"`
		Nationality string `json:"nationality"`
		Address     struct {
			StreetAddress  string `json:"streetAddress"`
			StreetAddress2 string `json:"streetAddress2"`
			District       string `json:"district"`
			City           string `json:"city"`
			AddressRegion  string `json:"addressRegion"`
			AddressCountry string `json:"addressCountry"`
		} `json:"address"`
	} `json:"credentialSubject"`
	Issuer       string `json:"issuer"`
	IssuanceDate string `json:"issuanceDate"`
	Evidence     []struct {
		ID             string    `json:"id"`
		FeedbackURL    string    `json:"feedbackUrl"`
		InfoURL        string    `json:"infoUrl"`
		Type           []string  `json:"type"`
		Batch          string    `json:"batch"`
		Vaccine        string    `json:"vaccine"`
		Manufacturer   string    `json:"manufacturer"`
		Date           time.Time `json:"date"`
		EffectiveStart string    `json:"effectiveStart"`
		EffectiveUntil string    `json:"effectiveUntil"`
		CertificateId  string    `json:"certificateId"`
		Dose           int       `json:"dose"`
		TotalDoses     int       `json:"totalDoses"`
		Verifier       struct {
			Name string `json:"name"`
		} `json:"verifier"`
		Facility struct {
			Name    string `json:"name"`
			Address struct {
				StreetAddress  string      `json:"streetAddress"`
				StreetAddress2 string      `json:"streetAddress2"`
				District       string      `json:"district"`
				City           string      `json:"city"`
				AddressRegion  string      `json:"addressRegion"`
				AddressCountry string      `json:"addressCountry"`
				PostalCode     interface{} `json:"postalCode"`
			} `json:"address"`
		} `json:"facility"`
	} `json:"evidence"`
	NonTransferable string `json:"nonTransferable"`
	Proof           struct {
		Type               string    `json:"type"`
		Created            time.Time `json:"created"`
		VerificationMethod string    `json:"verificationMethod"`
		ProofPurpose       string    `json:"proofPurpose"`
		Jws                string    `json:"jws"`
	} `json:"proof"`
}

func (certificate *Certificate) GetFacilityPostalCode() string {
	if postalCode, ok := certificate.Evidence[0].Facility.Address.PostalCode.(float64); ok {
		return strconv.Itoa(int(postalCode))
	}
	return certificate.Evidence[0].Facility.Address.PostalCode.(string)
}

func (certificate *Certificate) GetTemplateName(isFinal bool, language string) string {
	var certType string
	var pollingType string

	isPolling := false
	stateName := certificate.getStateNameInLowerCaseLetter()
	for _, state := range config.Config.PollingStates {
		if state == stateName {
			isPolling = true
		}
	}
	if isPolling {
		pollingType = "PS"
	} else {
		pollingType = "NPS"
	}
	if isFinal {
		certType = "2"
	} else {
		certType = "1"
	}
	return fmt.Sprintf("config/cov19–%s-%s-%s.pdf", language, certType, pollingType)
}

func (certificate *Certificate) getStateNameInLowerCaseLetter() string {
	stateName := ""
	if len(certificate.Evidence) > 0 {
		stateName = strings.TrimSpace(strings.ToLower(certificate.Evidence[0].Facility.Address.AddressRegion))
	}
	return stateName
}
