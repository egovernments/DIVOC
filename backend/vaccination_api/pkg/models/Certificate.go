package models

import (
	"strconv"
	"time"
	"encoding/json"
)

type CustomTime time.Time

func (mt *CustomTime) UnmarshalJSON(bs []byte) error {
	var s string
	err := json.Unmarshal(bs, &s)
	if err != nil {
		return err
	}
	t, err := time.ParseInLocation("2006-01-02T15:04:05.123Z", s, time.UTC)
	if err != nil {
		t, err = time.ParseInLocation("2006-01-02", s, time.UTC)
		if err != nil {
			return err
		}
	}
	*mt = CustomTime(t)
	return nil
}

type Certificate struct {
	Context           []string `json:"@context"`
	Type              []string `json:"type"`
	CredentialSubject struct {
		Type        string `json:"type"`
		ID          string `json:"id"`
		RefId       string `json:"refId"`
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
		Date           CustomTime `json:"date"`
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
