package models

import (
	"fmt"
	"github.com/divoc/api/config"
	"strconv"
	"strings"
	"time"
)

const layout = "02 Jan 2006"

var vaccineEffectiveDaysInfo = map[string]map[string]int{
	"covaxin": {
		"from": 28,
		"to":   42,
	},
	"covishield": {
		"dueDays": 84,
	},
	"Sputnik V": {
		"dueDays": 21,
	},
}

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
		TotalDoses     interface{}       `json:"totalDoses"`
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

	if certificate.IsVaccinatedStatePollingOne() {
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

func (certificate *Certificate) IsVaccinatedStatePollingOne() bool {
	isPolling := false
	stateName := certificate.GetStateNameInLowerCaseLetter()
	for _, state := range config.PollingStates {
		if state == stateName {
			isPolling = true
		}
	}
	return isPolling
}

func (certificate *Certificate) GetStateNameInLowerCaseLetter() string {
	stateName := ""
	if len(certificate.Evidence) > 0 {
		stateName = strings.TrimSpace(strings.ToLower(certificate.Evidence[0].Facility.Address.AddressRegion))
	}
	return stateName
}

func (certificate *Certificate) GetNextDueDateInfo() string {
	if len(certificate.Evidence) > 0 {
		evidence := certificate.Evidence[0]
		vaccine := strings.ToLower(evidence.Vaccine)
		if vaccineDateRange, found := vaccineEffectiveDaysInfo[vaccine]; found {
			if dueDays, ok := vaccineDateRange["dueDays"]; ok {
				fromDate := evidence.Date.Add(time.Hour * time.Duration(dueDays) * 24)
				return "Due on " + fromDate.Format(layout)
			} else {
				fromDate := evidence.Date.Add(time.Hour * time.Duration(vaccineDateRange["from"]) * 24)
				toDate := evidence.Date.Add(time.Hour * time.Duration(vaccineDateRange["to"]) * 24)
				return "Between " + fromDate.Format(layout) + " and " + toDate.Format(layout)
			}
		} else {
			fromDate := evidence.Date.Add(time.Hour * time.Duration(vaccineDateRange["from"]) * 24)
			return "Due on " + fromDate.Format(layout)
		}
	}
	return ""
}
