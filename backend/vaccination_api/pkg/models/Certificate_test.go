package models

import (
	"encoding/json"
	"github.com/divoc/api/config"
	"testing"
	"time"
)

const certificateText1 = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
const certificateText2 = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Gujarat\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Gujarat\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtGujaratJLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"

var certificateWithPS Certificate
var certificateWithNPS Certificate

func before() {
	_ = json.Unmarshal([]byte(certificateText1), &certificateWithPS)
	_ = json.Unmarshal([]byte(certificateText2), &certificateWithNPS)
}

func TestCertificate_GetTemplateName(t *testing.T) {
	before()
	// TODO: use mock instead of overriding
	config.PollingStates = []string{"tamil nadu"}
	type args struct {
		dose       int
		totalDoses int
		language   string
	}
	tests := []struct {
		name        string
		certificate Certificate
		args        args
		want        string
	}{
		{
			certificate: certificateWithPS,
			name:        "polling state provisional template",
			args:        args{1, 2, "HIN"},
			want:        "config/cov19–HIN-1-PS.pdf",
		},
		{
			certificate: certificateWithPS,
			name:        "polling state with final template",
			args:        args{2, 2, "HIN"},
			want:        "config/cov19–HIN-2-PS.pdf",
		},
		{
			certificate: certificateWithNPS,
			name:        "Non polling state provisional template",
			args:        args{1, 2, "HIN"},
			want:        "config/cov19–HIN-1-NPS.pdf",
		},
		{
			certificate: certificateWithNPS,
			name:        "Non polling state with final template",
			args:        args{2, 2, "HIN"},
			want:        "config/cov19–HIN-2-NPS.pdf",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			certificate := &Certificate{
				Context:           tt.certificate.Context,
				Type:              tt.certificate.Type,
				CredentialSubject: tt.certificate.CredentialSubject,
				Issuer:            tt.certificate.Issuer,
				IssuanceDate:      tt.certificate.IssuanceDate,
				Evidence:          tt.certificate.Evidence,
				NonTransferable:   tt.certificate.NonTransferable,
				Proof:             tt.certificate.Proof,
			}
			if got := certificate.GetTemplateName(tt.args.dose, tt.args.totalDoses, tt.args.language); got != tt.want {
				t.Errorf("GetTemplateName() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestCertificate_GetStateNameInLowerCaseLetter(t *testing.T) {
	before()
	tests := []struct {
		name        string
		certificate Certificate
		want        string
	}{
		{
			certificate: certificateWithPS,
			name:        "Vaccinated state with space",
			want:        "tamil nadu",
		},
		{
			certificate: certificateWithNPS,
			name:        "Vaccinated state",
			want:        "gujarat",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			certificate := &Certificate{
				Context:           tt.certificate.Context,
				Type:              tt.certificate.Type,
				CredentialSubject: tt.certificate.CredentialSubject,
				Issuer:            tt.certificate.Issuer,
				IssuanceDate:      tt.certificate.IssuanceDate,
				Evidence:          tt.certificate.Evidence,
				NonTransferable:   tt.certificate.NonTransferable,
				Proof:             tt.certificate.Proof,
			}
			if got := certificate.GetStateNameInLowerCaseLetter(); got != tt.want {
				t.Errorf("GetStateNameInLowerCaseLetter() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestCertificate_GetNextDueDateInfo(t *testing.T) {
	before()
	certificateText := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covishield\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var covishieldCertificate, sputnikCertificate, certificate Certificate
	_ = json.Unmarshal([]byte(certificateText), &covishieldCertificate)
	_ = json.Unmarshal([]byte(certificateText), &sputnikCertificate)
	sputnikCertificate.Evidence[0].Vaccine = "Sputnik V"
	_ = json.Unmarshal([]byte(certificateText), &certificate)
	certificate.Evidence[0].Vaccine = "V2"
	tests := []struct {
		name        string
		certificate Certificate
		want        string
	}{
		{
			"Derive next dose due date info for covaxin",
			certificateWithPS,
			"Between 27 Apr 2021 and 11 May 2021",
		},
		{
			"Derive next dose due date info for Covishield",
			covishieldCertificate,
			"Between 22 Jun 2021 and 20 Jul 2021",
		},
		{
			"Derive next dose due date info for Sputnik V",
			sputnikCertificate,
			"Between 20 Apr 2021 and 28 Jun 2021",
		},
		{
			"Derive next dose due date info for different vaccine",
			certificate,
			"Due on 19 Apr 2021",
		},

	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			certificate := &Certificate{
				Context:           tt.certificate.Context,
				Type:              tt.certificate.Type,
				CredentialSubject: tt.certificate.CredentialSubject,
				Issuer:            tt.certificate.Issuer,
				IssuanceDate:      tt.certificate.IssuanceDate,
				Evidence:          tt.certificate.Evidence,
				NonTransferable:   tt.certificate.NonTransferable,
				Proof:             tt.certificate.Proof,
			}
			if got := certificate.GetNextDueDateInfo(); got != tt.want {
				t.Errorf("GetNextDueDateInfo() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestCertificate_IsVaccinatedStatePollingOne(t *testing.T) {
	type fields struct {
		Context           []string
		Type              []string
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
		}
		Issuer       string
		IssuanceDate string
		Evidence     []struct {
			ID             string      `json:"id"`
			FeedbackURL    string      `json:"feedbackUrl"`
			InfoURL        string      `json:"infoUrl"`
			Type           []string    `json:"type"`
			Batch          string      `json:"batch"`
			Vaccine        string      `json:"vaccine"`
			Manufacturer   string      `json:"manufacturer"`
			Date           time.Time   `json:"date"`
			EffectiveStart string      `json:"effectiveStart"`
			EffectiveUntil string      `json:"effectiveUntil"`
			CertificateId  string      `json:"certificateId"`
			Dose           int         `json:"dose"`
			TotalDoses     interface{} `json:"totalDoses"`
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
		}
		NonTransferable string
		Proof           struct {
			Type               string    `json:"type"`
			Created            time.Time `json:"created"`
			VerificationMethod string    `json:"verificationMethod"`
			ProofPurpose       string    `json:"proofPurpose"`
			Jws                string    `json:"jws"`
		}
	}
	config.Initialize()
	ar := fields {Evidence: []struct {
		ID             string                              `json:"id"`;
		FeedbackURL    string                              `json:"feedbackUrl"`;
		InfoURL        string                              `json:"infoUrl"`;
		Type           []string                            `json:"type"`;
		Batch          string                              `json:"batch"`;
		Vaccine        string                              `json:"vaccine"`;
		Manufacturer   string                              `json:"manufacturer"`;
		Date           time.Time                           `json:"date"`;
		EffectiveStart string                              `json:"effectiveStart"`;
		EffectiveUntil string                              `json:"effectiveUntil"`;
		CertificateId  string                              `json:"certificateId"`;
		Dose           int                                 `json:"dose"`;
		TotalDoses     interface{}                         `json:"totalDoses"`;
		Verifier       struct{ Name string `json:"name"` } `json:"verifier"`;
		Facility       struct {
			Name    string `json:"name"`;
			Address struct {
				StreetAddress  string      `json:"streetAddress"`;
				StreetAddress2 string      `json:"streetAddress2"`;
				District       string      `json:"district"`;
				City           string      `json:"city"`;
				AddressRegion  string      `json:"addressRegion"`;
				AddressCountry string      `json:"addressCountry"`;
				PostalCode     interface{} `json:"postalCode"`
			} `json:"address"`
		} `json:"facility"`
	}{{Facility: struct {
		Name    string `json:"name"`;
		Address struct {
			StreetAddress  string      `json:"streetAddress"`;
			StreetAddress2 string      `json:"streetAddress2"`;
			District       string      `json:"district"`;
			City           string      `json:"city"`;
			AddressRegion  string      `json:"addressRegion"`;
			AddressCountry string      `json:"addressCountry"`;
			PostalCode     interface{} `json:"postalCode"`
		} `json:"address"`
	}{Address: struct {
		StreetAddress  string      `json:"streetAddress"`;
		StreetAddress2 string      `json:"streetAddress2"`;
		District       string      `json:"district"`;
		City           string      `json:"city"`;
		AddressRegion  string      `json:"addressRegion"`;
		AddressCountry string      `json:"addressCountry"`;
		PostalCode     interface{} `json:"postalCode"`
	}{
		AddressRegion: "",
	}}}}}

	tests := []struct {
		name   string
		fields fields
		want   bool
	}{
		{
			name:   "one",
			fields: ar,
			want:   false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			certificate := &Certificate{
				Context:           tt.fields.Context,
				Type:              tt.fields.Type,
				CredentialSubject: tt.fields.CredentialSubject,
				Issuer:            tt.fields.Issuer,
				IssuanceDate:      tt.fields.IssuanceDate,
				Evidence:          tt.fields.Evidence,
				NonTransferable:   tt.fields.NonTransferable,
				Proof:             tt.fields.Proof,
			}
			if got := certificate.IsVaccinatedStatePollingOne(); got != tt.want {
				t.Errorf("IsVaccinatedStatePollingOne() = %v, want %v", got, tt.want)
			}
		})
	}
}