package main

import (
	"encoding/json"
	"github.com/divoc/api/pkg/models"
	"reflect"
	"testing"
)

func Test_getVaccineValidDays(t *testing.T) {
	type args struct {
		start string
		end   string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{"check due date from validity",
			args{start: "2020-01-16", end: "2020-01-30"},
			"after 14 days"},
		{"check due date when effective until is same as start",
			args{start: "2020-01-16", end: "2020-01-16"},
			"after 28 days"},
		{"check due date when effective until is same as start",
			args{start: "2020-01-16", end: "2020-01-16"},
			"after 28 days"},
		{"check due date when effective until invalid",
			args{start: "2020-01-16", end: ""},
			"after 28 days"},
		{"check due date when effective start invalid",
			args{start: "", end: ""},
			"after 28 days"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getVaccineValidDays(tt.args.start, tt.args.end); got != tt.want {
				t.Errorf("getVaccineValidDays() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_maskId(t *testing.T) {
	type args struct {
		id string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{"aadhaar format", args{"123456789012"}, "XXXXXXXX9012"},
		{"blank id", args{""}, ""},
		{"one chars", args{"a"}, "X"},
		{"two chars", args{"aa"}, "XX"},
		{"three chars", args{"123"}, "XX3"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := maskId(tt.args.id); got != tt.want {
				t.Errorf("maskId() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_blank(t *testing.T) {
	var certificate models.Certificate
	certificateText := "{}"
	if err := json.Unmarshal([]byte(certificateText), &certificate); err != nil {
	}
	val := templateType(certificate)
	if val != "" {
		t.Error("Unexpected template")
	}
}

func Test_isCertificatePresent(t *testing.T) {
	type args struct {
		certs []interface{}
		dose  int64
	}
	tests := []struct {
		name    string
		args    args
		want    bool
		wantErr bool
	}{
		{
			name: "select by dose 1",
			args: args{
				certs: []interface{}{map[string]interface{}{"dose": 1}},
				dose:  1,
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "select by dose 2",
			args: args{
				certs: []interface{}{map[string]interface{}{"dose": 1}},
				dose:  2,
			},
			want:    false,
			wantErr: false,
		},
		{
			name: "select by dose - missing dose col but json has it",
			args: args{
				certs: []interface{}{map[string]interface{}{"certificate": `{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"did:Voter ID:KR20191677","refId":"23423941925362","name":"Naida","gender":"Male","age":"56","nationality":"Indian","address":{"streetAddress":"","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":794108}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-01-16T06:20:50.275Z","evidence":[{"id":"https://cowin.gov.in/vaccine/118224178","feedbackUrl":"https://cowin.gov.in/?118224178","infoUrl":"https://cowin.gov.in/?118224178","certificateId":"118224178","type":["Vaccination"],"batch":"4120Z011","vaccine":"COVISHIELD","manufacturer":"Serum Institute of India","date":"2021-01-16T06:20:47.516Z","effectiveStart":"2021-01-16","effectiveUntil":"2021-01-16","dose":1,"totalDoses":2,"verifier":{"name":"Adriana Carolin Sangma"},"facility":{"name":"Resubelpara CHC","address":{"streetAddress":"Belpara","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":""}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-01-16T06:20:50Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BIc3VQ31s5b3RPKzwA3FUg9cGcGehULAMbeCCAWw609qV1k9lW8gzb1n2e-tlFbfXaNJQZrU21FdhrnJDFPQyC4buz4edyTk7gpi44T9IVUQ9A_rN_IhqXwOPg_aZ19iP0NCkVgJIkqV6z9nTXslOgz2abZtWH7bvjTWd7WuUVy6jbHL5JnlGTVfZSAi5IAHeEX9qHh_4dRgILO7l7sLR9W2Svfwwy9WVzDSDGu8YvTNLX4Orya6L9tZ2A3_EHpvUKQUN1nm4aRzKNwV9lkL-6529n8NfRqESy-3Lmz9esv9wK0IWv1VyZJ-XRbihGgbT7DQhv3wNNZtXWA3CPOtIQ"}}`}},
				dose:  1,
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "select by dose - dose col and json both are 1 and 2 is requested",
			args: args{
				certs: []interface{}{map[string]interface{}{"dose": 1, "certificate": `{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"did:Voter ID:KR20191677","refId":"23423941925362","name":"Naida","gender":"Male","age":"56","nationality":"Indian","address":{"streetAddress":"","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":794108}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-01-16T06:20:50.275Z","evidence":[{"id":"https://cowin.gov.in/vaccine/118224178","feedbackUrl":"https://cowin.gov.in/?118224178","infoUrl":"https://cowin.gov.in/?118224178","certificateId":"118224178","type":["Vaccination"],"batch":"4120Z011","vaccine":"COVISHIELD","manufacturer":"Serum Institute of India","date":"2021-01-16T06:20:47.516Z","effectiveStart":"2021-01-16","effectiveUntil":"2021-01-16","dose":1,"totalDoses":2,"verifier":{"name":"Adriana Carolin Sangma"},"facility":{"name":"Resubelpara CHC","address":{"streetAddress":"Belpara","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":""}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-01-16T06:20:50Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BIc3VQ31s5b3RPKzwA3FUg9cGcGehULAMbeCCAWw609qV1k9lW8gzb1n2e-tlFbfXaNJQZrU21FdhrnJDFPQyC4buz4edyTk7gpi44T9IVUQ9A_rN_IhqXwOPg_aZ19iP0NCkVgJIkqV6z9nTXslOgz2abZtWH7bvjTWd7WuUVy6jbHL5JnlGTVfZSAi5IAHeEX9qHh_4dRgILO7l7sLR9W2Svfwwy9WVzDSDGu8YvTNLX4Orya6L9tZ2A3_EHpvUKQUN1nm4aRzKNwV9lkL-6529n8NfRqESy-3Lmz9esv9wK0IWv1VyZJ-XRbihGgbT7DQhv3wNNZtXWA3CPOtIQ"}}`}},
				dose:  2,
			},
			want:    false,
			wantErr: false,
		},
		{
			name: "select by dose - missing dose col and json also different",
			args: args{
				certs: []interface{}{map[string]interface{}{"certificate": `{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"did:Voter ID:KR20191677","refId":"23423941925362","name":"Naida","gender":"Male","age":"56","nationality":"Indian","address":{"streetAddress":"","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":794108}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-01-16T06:20:50.275Z","evidence":[{"id":"https://cowin.gov.in/vaccine/118224178","feedbackUrl":"https://cowin.gov.in/?118224178","infoUrl":"https://cowin.gov.in/?118224178","certificateId":"118224178","type":["Vaccination"],"batch":"4120Z011","vaccine":"COVISHIELD","manufacturer":"Serum Institute of India","date":"2021-01-16T06:20:47.516Z","effectiveStart":"2021-01-16","effectiveUntil":"2021-01-16","dose":1,"totalDoses":2,"verifier":{"name":"Adriana Carolin Sangma"},"facility":{"name":"Resubelpara CHC","address":{"streetAddress":"Belpara","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":""}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-01-16T06:20:50Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BIc3VQ31s5b3RPKzwA3FUg9cGcGehULAMbeCCAWw609qV1k9lW8gzb1n2e-tlFbfXaNJQZrU21FdhrnJDFPQyC4buz4edyTk7gpi44T9IVUQ9A_rN_IhqXwOPg_aZ19iP0NCkVgJIkqV6z9nTXslOgz2abZtWH7bvjTWd7WuUVy6jbHL5JnlGTVfZSAi5IAHeEX9qHh_4dRgILO7l7sLR9W2Svfwwy9WVzDSDGu8YvTNLX4Orya6L9tZ2A3_EHpvUKQUN1nm4aRzKNwV9lkL-6529n8NfRqESy-3Lmz9esv9wK0IWv1VyZJ-XRbihGgbT7DQhv3wNNZtXWA3CPOtIQ"}}`}},
				dose:  2,
			},
			want:    false,
			wantErr: false,
		},
		{
			name: "select by dose - missing cert",
			args: args{
				certs: []interface{}{},
				dose:  2,
			},
			want:    false,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isCertificatePresentInCertificatesForGivenDose(tt.args.certs, tt.args.dose)

			if got != tt.want {
				t.Errorf("isCertificatePresent() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_toInteger(t *testing.T) {
	type args struct {
		TotalDoses   interface{}
		defaultValue int
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{name: "test blank", args: args{TotalDoses: "", defaultValue: 2}, want: 2},
		{name: "test number 2", args: args{TotalDoses: 2, defaultValue: 2}, want: 2},
		{name: "test number 0", args: args{TotalDoses: 0, defaultValue: 2}, want: 0},
		{name: "test number nil", args: args{TotalDoses: nil, defaultValue: 2}, want: 2},
		{name: "test number 1", args: args{TotalDoses: 1, defaultValue: 2}, want: 1},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := toInteger(tt.args.TotalDoses, tt.args.defaultValue); got != tt.want {
				t.Errorf("toInteger() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_showLabelsAsPerTemplateV2(t *testing.T) {
	provisionalCertificateText1 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"12345\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var provisionalCertificate1 models.Certificate
	_ = json.Unmarshal([]byte(provisionalCertificateText1), &provisionalCertificate1)
	certificateText1 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"12345\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var provisionalCertificate models.Certificate
	_ = json.Unmarshal([]byte(certificateText1), &provisionalCertificate)

	certificateText2 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"12345\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":2,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var finalCertificate models.Certificate
	_ = json.Unmarshal([]byte(certificateText2), &finalCertificate)

	certificateText3 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var provisionalCertificateWithoutUHID models.Certificate
	_ = json.Unmarshal([]byte(certificateText3), &provisionalCertificateWithoutUHID)

	type args struct {
		certificate                models.Certificate
		provisionalCertificateDate string
	}
	tests := []struct {
		name string
		args args
		want []string
	}{
		{
			"Data to show for Provisional cert",
			args{
				certificate:                provisionalCertificate,
				provisionalCertificateDate: formatDateWithBatchNumber(provisionalCertificate1.Evidence[0].Date, provisionalCertificate1.Evidence[0].Batch),
			},
			[]string{
				"Master Radon",
				"21",
				"Male",
				"Aadhaar # XXXXXXXX1710",
				"12345",
				"1112",
				"COVAXIN",
				"30 Mar 2021 (Batch no. 10)",
				"Between 27 Apr 2021 and 11 May 2021",
				"Dr Dhronar",
				"Madras, Chennai, Tamil Nadu",
			},
		},
		{
			"Data to show for Final cert",
			args{
				certificate:                finalCertificate,
				provisionalCertificateDate: formatDateWithBatchNumber(provisionalCertificate1.Evidence[0].Date, provisionalCertificate1.Evidence[0].Batch),
			},
			[]string{
				"Master Radon",
				"21",
				"Male",
				"Aadhaar # XXXXXXXX1710",
				"12345",
				"1112",
				"COVAXIN",
				"30 Mar 2021 (Batch no. 10)",
				"30 Mar 2021 (Batch no. 10)",
				"Dr Dhronar",
				"Madras, Chennai, Tamil Nadu",
			},
		},
		{
			"Data to show for Final cert",
			args{
				certificate:                finalCertificate,
				provisionalCertificateDate: "",
			},
			[]string{
				"Master Radon",
				"21",
				"Male",
				"Aadhaar # XXXXXXXX1710",
				"12345",
				"1112",
				"COVAXIN",
				"",
				"30 Mar 2021 (Batch no. 10)",
				"Dr Dhronar",
				"Madras, Chennai, Tamil Nadu",
			},
		},
		{
			"Should populate empty string if uhid is empty",
			args{
				certificate: provisionalCertificateWithoutUHID,
			},
			[]string{
				"Master Radon",
				"21",
				"Male",
				"Aadhaar # XXXXXXXX1710",
				"",
				"1112",
				"COVAXIN",
				"30 Mar 2021 (Batch no. 10)",
				"Between 27 Apr 2021 and 11 May 2021",
				"Dr Dhronar",
				"Madras, Chennai, Tamil Nadu",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := showLabelsAsPerTemplateV2(tt.args.certificate, tt.args.provisionalCertificateDate); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("showLabelsAsPerTemplateV2() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_showIdLabelsAsPerTemplateV2(t *testing.T) {
	provisionalCertificateText1 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"12345\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var provisionalCertificate1 models.Certificate
	_ = json.Unmarshal([]byte(provisionalCertificateText1), &provisionalCertificate1)

	certificateText1 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.nprSmartCard:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"12345\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var provisionalCertificateWithNprId models.Certificate
	_ = json.Unmarshal([]byte(certificateText1), &provisionalCertificateWithNprId)

	certificateText2 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.disabilityId:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"12345\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":2,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var finalCertificateWithDisabilityId models.Certificate
	_ = json.Unmarshal([]byte(certificateText2), &finalCertificateWithDisabilityId)

	certificateText3 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.serviceIdentity:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var provisionalCertificateWithServiceIdentityCardId models.Certificate
	_ = json.Unmarshal([]byte(certificateText3), &provisionalCertificateWithServiceIdentityCardId)

	certificateText4 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.rationCard:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"10\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var provisionalCertificateWithRationCardId models.Certificate
	_ = json.Unmarshal([]byte(certificateText4), &provisionalCertificateWithRationCardId)

	provisionalCertificateTextWithoutBatch := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"12345\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var provisionalCertificateWithoutBatch models.Certificate
	_ = json.Unmarshal([]byte(provisionalCertificateTextWithoutBatch), &provisionalCertificateWithoutBatch)

	certificateText5 := "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.disabilityId:600893441710\",\"refId\":\"1112\",\"name\":\"Master Radon\",\"uhid\":\"12345\",\"gender\":\"Male\",\"age\":\"21\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":999000}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-04-07T05:27:34.319Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/32630784022\",\"feedbackUrl\":\"https://cowin.gov.in/?32630784022\",\"infoUrl\":\"https://cowin.gov.in/?32630784022\",\"certificateId\":\"32630784022\",\"type\":[\"Vaccination\"],\"batch\":\"\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Stark Industries\",\"date\":\"2021-03-30T10:06:02.705Z\",\"effectiveStart\":\"2021-03-30\",\"effectiveUntil\":\"2021-07-08\",\"dose\":2,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr Dhronar\"},\"facility\":{\"name\":\"Madras\",\"address\":{\"streetAddress\":\"Ramachandra multi facility hospital\",\"streetAddress2\":\"Katankulathur, Guduvancherry\",\"district\":\"Chennai\",\"city\":\"\",\"addressRegion\":\"Tamil Nadu\",\"addressCountry\":\"IN\",\"postalCode\":555000}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-04-07T05:27:34Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EeZPl0x63T7Hc1GmR6NpqGgnNg0wOOmtXq8jLsvs1jSCiO0EH6qpHMNnJ7wbtVzfWlAOGI6JLdx0ZTEFmUf4uYiyGLyyzh7T6QwMs4GT53BRg1eWsWui_wcc5yUdh6Ok00zq-Fv4jHDTeZBKbfPIx8B1MnGZ-SepFlpZxV_Cwh_Tf7aBpaJjscSkJ-BMWOKYlWo_Zf3pJ_lCI6_sWKnyKVmyxwY-oyxoUNyjqyXswoZqVMvHykjo8A7zGaAEP6pwn_her5EFywDJIT1BbMbjnhaHJTraTTSWWBa4yw5yC3B62OKHXt0Qn5maamswOeXobNmbo7Dufxpj1VysuUbu5Q\"}}"
	var finalCertificateWithoutBatch models.Certificate
	_ = json.Unmarshal([]byte(certificateText5), &finalCertificateWithoutBatch)

	type args struct {
		certificate            models.Certificate
		provisionalCertificate string
	}
	tests := []struct {
		name string
		args args
		want []string
	}{
		{
			"Should populate identity if NPR Smart Card number is present ",
			args{
				certificate: provisionalCertificateWithNprId,
				provisionalCertificate: formatDateWithBatchNumber(provisionalCertificate1.Evidence[0].Date, provisionalCertificate1.Evidence[0].Batch),
			},
			[]string{
				"Master Radon",
				"21",
				"Male",
				"NPR Smart Card # 600893441710",
				"12345",
				"1112",
				"COVAXIN",
				"30 Mar 2021 (Batch no. 10)",
				"Between 27 Apr 2021 and 11 May 2021",
				"Dr Dhronar",
				"Madras, Chennai, Tamil Nadu",
			},
		},
		{
			"Should populate identity if unique disability number is present ",
			args{
				certificate: finalCertificateWithDisabilityId,
				provisionalCertificate: formatDateWithBatchNumber(provisionalCertificate1.Evidence[0].Date, provisionalCertificate1.Evidence[0].Batch),
			},
			[]string{
				"Master Radon",
				"21",
				"Male",
				"Unique Disability # 600893441710",
				"12345",
				"1112",
				"COVAXIN",
				"30 Mar 2021 (Batch no. 10)",
				"30 Mar 2021 (Batch no. 10)",
				"Dr Dhronar",
				"Madras, Chennai, Tamil Nadu",
			},
		},
		{
			"Should populate identity if service identity card is present",
			args{
				certificate: provisionalCertificateWithServiceIdentityCardId,
				provisionalCertificate: formatDateWithBatchNumber(provisionalCertificate1.Evidence[0].Date, provisionalCertificate1.Evidence[0].Batch),
			},
			[]string{
				"Master Radon",
				"21",
				"Male",
				"Service Identity Card # 600893441710",
				"",
				"1112",
				"COVAXIN",
				"30 Mar 2021 (Batch no. 10)",
				"Between 27 Apr 2021 and 11 May 2021",
				"Dr Dhronar",
				"Madras, Chennai, Tamil Nadu",
			},
		},
		{
			"Should populate identity if ration card is present",
			args{
				certificate: provisionalCertificateWithRationCardId,
				provisionalCertificate: formatDateWithBatchNumber(provisionalCertificate1.Evidence[0].Date, provisionalCertificate1.Evidence[0].Batch),
			},
			[]string{
				"Master Radon",
				"21",
				"Male",
				"Ration Card # 600893441710",
				"",
				"1112",
				"COVAXIN",
				"30 Mar 2021 (Batch no. 10)",
				"Between 27 Apr 2021 and 11 May 2021",
				"Dr Dhronar",
				"Madras, Chennai, Tamil Nadu",
			},
		},
		{
			"Should populate date without batch if batch is empty ",
			args{
				certificate: finalCertificateWithoutBatch,
				provisionalCertificate: formatDateWithBatchNumber(provisionalCertificate1.Evidence[0].Date, ""),
			},
			[]string{
				"Master Radon",
				"21",
				"Male",
				"Unique Disability # 600893441710",
				"12345",
				"1112",
				"COVAXIN",
				"30 Mar 2021",
				"30 Mar 2021",
				"Dr Dhronar",
				"Madras, Chennai, Tamil Nadu",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := showLabelsAsPerTemplateV2(tt.args.certificate, tt.args.provisionalCertificate); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("showLabelsAsPerTemplateV2() = %v, want %v", got, tt.want)
			}
		})
	}
}
