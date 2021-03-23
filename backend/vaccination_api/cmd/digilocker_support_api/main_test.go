package main

import (
	"encoding/json"
	"github.com/divoc/api/pkg/models"
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
		{"aadhaar format", args{"123456789012"}, "XXXXXXXX9012",},
		{"blank id", args{""}, "",},
		{"one chars", args{"a"}, "X",},
		{"two chars", args{"aa"}, "XX",},
		{"three chars", args{"123"}, "XX3",},
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
		dose              int64
	}
	tests := []struct {
		name    string
		args    args
		want    bool
		wantErr bool
	}{
		{
			name: "select by dose",
			args: args{
				certs: []interface{}{map[string]interface{}{"dose":1}},
				dose:              1,
			},
			want: true,
			wantErr: false,
		},
		{
			name: "select by dose",
			args: args{
				certs: []interface{}{map[string]interface{}{"dose":1}},
				dose:              2,
			},
			want: false,
			wantErr: false,
		},
		{
			name: "select by dose - missing dose col but json has it",
			args: args{
				certs: []interface{}{map[string]interface{}{"certificate":`{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"did:Voter ID:KR20191677","refId":"23423941925362","name":"Naida","gender":"Male","age":"56","nationality":"Indian","address":{"streetAddress":"","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":794108}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-01-16T06:20:50.275Z","evidence":[{"id":"https://cowin.gov.in/vaccine/118224178","feedbackUrl":"https://cowin.gov.in/?118224178","infoUrl":"https://cowin.gov.in/?118224178","certificateId":"118224178","type":["Vaccination"],"batch":"4120Z011","vaccine":"COVISHIELD","manufacturer":"Serum Institute of India","date":"2021-01-16T06:20:47.516Z","effectiveStart":"2021-01-16","effectiveUntil":"2021-01-16","dose":1,"totalDoses":2,"verifier":{"name":"Adriana Carolin Sangma"},"facility":{"name":"Resubelpara CHC","address":{"streetAddress":"Belpara","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":""}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-01-16T06:20:50Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BIc3VQ31s5b3RPKzwA3FUg9cGcGehULAMbeCCAWw609qV1k9lW8gzb1n2e-tlFbfXaNJQZrU21FdhrnJDFPQyC4buz4edyTk7gpi44T9IVUQ9A_rN_IhqXwOPg_aZ19iP0NCkVgJIkqV6z9nTXslOgz2abZtWH7bvjTWd7WuUVy6jbHL5JnlGTVfZSAi5IAHeEX9qHh_4dRgILO7l7sLR9W2Svfwwy9WVzDSDGu8YvTNLX4Orya6L9tZ2A3_EHpvUKQUN1nm4aRzKNwV9lkL-6529n8NfRqESy-3Lmz9esv9wK0IWv1VyZJ-XRbihGgbT7DQhv3wNNZtXWA3CPOtIQ"}}`}},
				dose:              1,
			},
			want: true,
			wantErr: false,
		},
		{
			name: "select by dose - dose col and json both are 1 and 2 is requested",
			args: args{
				certs: []interface{}{map[string]interface{}{"dose":1,"certificate":`{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"did:Voter ID:KR20191677","refId":"23423941925362","name":"Naida","gender":"Male","age":"56","nationality":"Indian","address":{"streetAddress":"","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":794108}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-01-16T06:20:50.275Z","evidence":[{"id":"https://cowin.gov.in/vaccine/118224178","feedbackUrl":"https://cowin.gov.in/?118224178","infoUrl":"https://cowin.gov.in/?118224178","certificateId":"118224178","type":["Vaccination"],"batch":"4120Z011","vaccine":"COVISHIELD","manufacturer":"Serum Institute of India","date":"2021-01-16T06:20:47.516Z","effectiveStart":"2021-01-16","effectiveUntil":"2021-01-16","dose":1,"totalDoses":2,"verifier":{"name":"Adriana Carolin Sangma"},"facility":{"name":"Resubelpara CHC","address":{"streetAddress":"Belpara","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":""}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-01-16T06:20:50Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BIc3VQ31s5b3RPKzwA3FUg9cGcGehULAMbeCCAWw609qV1k9lW8gzb1n2e-tlFbfXaNJQZrU21FdhrnJDFPQyC4buz4edyTk7gpi44T9IVUQ9A_rN_IhqXwOPg_aZ19iP0NCkVgJIkqV6z9nTXslOgz2abZtWH7bvjTWd7WuUVy6jbHL5JnlGTVfZSAi5IAHeEX9qHh_4dRgILO7l7sLR9W2Svfwwy9WVzDSDGu8YvTNLX4Orya6L9tZ2A3_EHpvUKQUN1nm4aRzKNwV9lkL-6529n8NfRqESy-3Lmz9esv9wK0IWv1VyZJ-XRbihGgbT7DQhv3wNNZtXWA3CPOtIQ"}}`}},
				dose:              2,
			},
			want: false,
			wantErr: false,
		},
		{
			name: "select by dose - missing dose col and json also different",
			args: args{
				certs: []interface{}{map[string]interface{}{"certificate":`{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"did:Voter ID:KR20191677","refId":"23423941925362","name":"Naida","gender":"Male","age":"56","nationality":"Indian","address":{"streetAddress":"","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":794108}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-01-16T06:20:50.275Z","evidence":[{"id":"https://cowin.gov.in/vaccine/118224178","feedbackUrl":"https://cowin.gov.in/?118224178","infoUrl":"https://cowin.gov.in/?118224178","certificateId":"118224178","type":["Vaccination"],"batch":"4120Z011","vaccine":"COVISHIELD","manufacturer":"Serum Institute of India","date":"2021-01-16T06:20:47.516Z","effectiveStart":"2021-01-16","effectiveUntil":"2021-01-16","dose":1,"totalDoses":2,"verifier":{"name":"Adriana Carolin Sangma"},"facility":{"name":"Resubelpara CHC","address":{"streetAddress":"Belpara","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":""}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-01-16T06:20:50Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BIc3VQ31s5b3RPKzwA3FUg9cGcGehULAMbeCCAWw609qV1k9lW8gzb1n2e-tlFbfXaNJQZrU21FdhrnJDFPQyC4buz4edyTk7gpi44T9IVUQ9A_rN_IhqXwOPg_aZ19iP0NCkVgJIkqV6z9nTXslOgz2abZtWH7bvjTWd7WuUVy6jbHL5JnlGTVfZSAi5IAHeEX9qHh_4dRgILO7l7sLR9W2Svfwwy9WVzDSDGu8YvTNLX4Orya6L9tZ2A3_EHpvUKQUN1nm4aRzKNwV9lkL-6529n8NfRqESy-3Lmz9esv9wK0IWv1VyZJ-XRbihGgbT7DQhv3wNNZtXWA3CPOtIQ"}}`}},
				dose:              2,
			},
			want: false,
			wantErr: false,
		},
		{
			name: "select by dose - missing cert",
			args: args{
				certs: []interface{}{},
				dose:              2,
			},
			want: false,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isCertificatePresentInCertificatesForGivenDose(tt.args.certs, tt.args.dose)
			//if (err != nil) != tt.wantErr {
			//	t.Errorf("isCertificatePresent() error = %v, wantErr %v", err, tt.wantErr)
			//	return
			//}
			if got != tt.want {
				t.Errorf("isCertificatePresent() got = %v, want %v", got, tt.want)
			}
		})
	}
}