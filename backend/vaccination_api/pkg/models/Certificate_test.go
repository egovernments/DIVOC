package models

import (
	"encoding/json"
	"github.com/divoc/api/config"
	"testing"
)

var certificateText1 = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
var certificateText2 = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Gujarat\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Gujarat\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtGujaratJLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
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
		isFinal  bool
		language string
	}
	tests := []struct {
		name        string
		certificate Certificate
		args        args
		want        string
	}{
		{
			certificate: certificateWithPS,
			name:        "Non polling state provisional template",
			args:        args{false, "HIN"},
			want:        "config/cov19–HIN-1-PS.pdf",
		},
		{
			certificate: certificateWithPS,
			name:        "polling state with final template",
			args:        args{true, "HIN"},
			want:        "config/cov19–HIN-2-PS.pdf",
		},
		{
			certificate: certificateWithNPS,
			name:        "Non polling state provisional template",
			args:        args{false, "HIN"},
			want:        "config/cov19–HIN-1-NPS.pdf",
		},
		{
			certificate: certificateWithNPS,
			name:        "polling state with final template",
			args:        args{true, "HIN"},
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
			if got := certificate.GetTemplateName(tt.args.isFinal, tt.args.language); got != tt.want {
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
