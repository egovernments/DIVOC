package pkg

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/api/swagger_gen/restapi/operations/certification"
	"reflect"
	"testing"
)

func
Test_certify(t *testing.T) {

	type args struct {
		params    certification.CertifyParams
		principal *models.JWTClaimBody
	}
	var fromJson = func(s string) args {
		var requests certification.CertifyParams
		if err := json.Unmarshal([]byte(s), &requests.Body); err != nil {
			fmt.Printf("Error parsing json %s, %+v", s, err)
		}

		return args{params: requests, principal: nil}
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{name: "empty certify request", args:fromJson(`[]`), want:false},
		{name: "empty certify request", args:fromJson(`[{"preEnrollmentCode": "123469"}]`), want:false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got, _ := validateCertifyRequest(tt.args.params); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("certify() = %v, want %v", got, tt.want)
			}
		})
	}

}

func Test_getDoseFromCertificate(t *testing.T) {
	certificateStrWithDoseAtHighLevel := `{"name": "xxx Sahoo", "contact": ["tel:123"], "mobile": "123", "preEnrollmentCode": "269484", "certificateId": "123", "certificate": {"@context": ["https://www.w3.org/2018/credentials/v1", "https://cowin.gov.in/credentials/vaccination/v1"], "type": ["VerifiableCredential", "ProofOfVaccinationCredential"], "credentialSubject": {"type": "Person", "id": "did:Aadhaar Card:Aadhaar Card", "refId": "284", "name": "Sahoo", "gender": "Male", "age": "62", "nationality": "Indian", "address": {"streetAddress": "", "streetAddress2": "", "district": "", "city": "", "addressRegion": "", "addressCountry": "IN", "postalCode": ""}}, "issuer": "https://cowin.gov.in/", "issuanceDate": "2021-03-02T16:09:34.183Z", "evidence": [{"id": "https://cowin.gov.in/vaccine/123", "feedbackUrl": "https://cowin.gov.in/?123", "infoUrl": "https://cowin.gov.in/?123", "certificateId": "123", "type": ["Vaccination"], "batch": "4120Z010", "vaccine": "COVISHIELD", "manufacturer": "Serum Institute of India", "date": "2021-03-02T15:27:56.518Z", "effectiveStart": "2021-03-02", "effectiveUntil": "2021-03-02", "dose": 1, "totalDoses": 2, "verifier": {"name": ""}, "facility": {"name": "District Hq Hospital Jajpur", "address": {"streetAddress": "Dhh Jajpur", "streetAddress2": "", "district": "Jajpur", "city": "", "addressRegion": "Odisha", "addressCountry": "IN", "postalCode": 123123}}}], "nonTransferable": "true", "proof": {"type": "RsaSignature2018", "created": "2021-03-02T16:09:34Z", "verificationMethod": "did:india", "proofPurpose": "assertionMethod", "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Aa7F0_lGUMlQNqIvdt-dfdvkN0ZYELYxM12NxRLZHoCxlrarQDxUz5c_nSCBGLxWiMUruysQK4tShSENGKCYpg-KvNd6DTbQqAarVd9fROz6RWrQtWyC2tfn0wgj7hRV5AIDWOpP41LRn7eNBS_gOiwY-GelFT7EAFrvD_0vx-O9L5ui5tL1pHqntxs2Bj93nLEzcUSKltUJIEXR8d3fkX2EjiJ3X9vqZv5ikPZT-zlYfu3XLnjoKz-TW5rg-zGCgxWOficj3Vz06SkOUMJteXqkzwZ5xU6sNJSO80iIVx6jtBZcZmaTmNgf4M-WAW1Q_oNrYPIkH7lIzV5xDvJuFA"}}, "dose": 1}`
	var certificateStrWithDoseAtHighLevelMap map[string]interface{}
	_ = json.Unmarshal([]byte(certificateStrWithDoseAtHighLevel), &certificateStrWithDoseAtHighLevelMap)
	certificateStrWithDoseAtContextLevel := `{"name": "xxx Sahoo", "contact": ["tel:123"], "mobile": "123", "preEnrollmentCode": "269484", "certificateId": "123", "certificate": "{"@context": ["https://www.w3.org/2018/credentials/v1", "https://cowin.gov.in/credentials/vaccination/v1"], "type": ["VerifiableCredential", "ProofOfVaccinationCredential"], "credentialSubject": {"type": "Person", "id": "did:Aadhaar Card:Aadhaar Card", "refId": "284", "name": "Sahoo", "gender": "Male", "age": "62", "nationality": "Indian", "address": {"streetAddress": "", "streetAddress2": "", "district": "", "city": "", "addressRegion": "", "addressCountry": "IN", "postalCode": ""}}, "issuer": "https://cowin.gov.in/", "issuanceDate": "2021-03-02T16:09:34.183Z", "evidence": [{"id": "https://cowin.gov.in/vaccine/123", "feedbackUrl": "https://cowin.gov.in/?123", "infoUrl": "https://cowin.gov.in/?123", "certificateId": "123", "type": ["Vaccination"], "batch": "4120Z010", "vaccine": "COVISHIELD", "manufacturer": "Serum Institute of India", "date": "2021-03-02T15:27:56.518Z", "effectiveStart": "2021-03-02", "effectiveUntil": "2021-03-02", "dose": 2, "totalDoses": 2, "verifier": {"name": ""}, "facility": {"name": "District Hq Hospital Jajpur", "address": {"streetAddress": "Dhh Jajpur", "streetAddress2": "", "district": "Jajpur", "city": "", "addressRegion": "Odisha", "addressCountry": "IN", "postalCode": 123123}}}], "nonTransferable": "true", "proof": {"type": "RsaSignature2018", "created": "2021-03-02T16:09:34Z", "verificationMethod": "did:india", "proofPurpose": "assertionMethod", "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Aa7F0_lGUMlQNqIvdt-dfdvkN0ZYELYxM12NxRLZHoCxlrarQDxUz5c_nSCBGLxWiMUruysQK4tShSENGKCYpg-KvNd6DTbQqAarVd9fROz6RWrQtWyC2tfn0wgj7hRV5AIDWOpP41LRn7eNBS_gOiwY-GelFT7EAFrvD_0vx-O9L5ui5tL1pHqntxs2Bj93nLEzcUSKltUJIEXR8d3fkX2EjiJ3X9vqZv5ikPZT-zlYfu3XLnjoKz-TW5rg-zGCgxWOficj3Vz06SkOUMJteXqkzwZ5xU6sNJSO80iIVx6jtBZcZmaTmNgf4M-WAW1Q_oNrYPIkH7lIzV5xDvJuFA"}}", "dose": ""}`
	var certificateStrWithDoseAtContextLevelMap map[string]interface{}
	_ = json.Unmarshal([]byte(certificateStrWithDoseAtContextLevel), &certificateStrWithDoseAtContextLevelMap)
	type args struct {
		certificateMap map[string]interface{}
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{
			name: "should return dose value from higher order field",
			args: args{
				certificateMap: map[string]interface{}{"dose": 1, "certificate": `{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"did:Voter ID:KR20191677","refId":"23423941925362","name":"Naida","gender":"Male","age":"56","nationality":"Indian","address":{"streetAddress":"","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":794108}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-01-16T06:20:50.275Z","evidence":[{"id":"https://cowin.gov.in/vaccine/118224178","feedbackUrl":"https://cowin.gov.in/?118224178","infoUrl":"https://cowin.gov.in/?118224178","certificateId":"118224178","type":["Vaccination"],"batch":"4120Z011","vaccine":"COVISHIELD","manufacturer":"Serum Institute of India","date":"2021-01-16T06:20:47.516Z","effectiveStart":"2021-01-16","effectiveUntil":"2021-01-16","dose":1,"totalDoses":2,"verifier":{"name":"Adriana Carolin Sangma"},"facility":{"name":"Resubelpara CHC","address":{"streetAddress":"Belpara","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":""}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-01-16T06:20:50Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BIc3VQ31s5b3RPKzwA3FUg9cGcGehULAMbeCCAWw609qV1k9lW8gzb1n2e-tlFbfXaNJQZrU21FdhrnJDFPQyC4buz4edyTk7gpi44T9IVUQ9A_rN_IhqXwOPg_aZ19iP0NCkVgJIkqV6z9nTXslOgz2abZtWH7bvjTWd7WuUVy6jbHL5JnlGTVfZSAi5IAHeEX9qHh_4dRgILO7l7sLR9W2Svfwwy9WVzDSDGu8YvTNLX4Orya6L9tZ2A3_EHpvUKQUN1nm4aRzKNwV9lkL-6529n8NfRqESy-3Lmz9esv9wK0IWv1VyZJ-XRbihGgbT7DQhv3wNNZtXWA3CPOtIQ"}}`},
			},
			want: 1,
		},{
			name: "should return dose value from context field",
			args: args{
				certificateMap: map[string]interface{}{"certificate": `{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"did:Voter ID:KR20191677","refId":"23423941925362","name":"Naida","gender":"Male","age":"56","nationality":"Indian","address":{"streetAddress":"","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":794108}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-01-16T06:20:50.275Z","evidence":[{"id":"https://cowin.gov.in/vaccine/118224178","feedbackUrl":"https://cowin.gov.in/?118224178","infoUrl":"https://cowin.gov.in/?118224178","certificateId":"118224178","type":["Vaccination"],"batch":"4120Z011","vaccine":"COVISHIELD","manufacturer":"Serum Institute of India","date":"2021-01-16T06:20:47.516Z","effectiveStart":"2021-01-16","effectiveUntil":"2021-01-16","dose":2,"totalDoses":2,"verifier":{"name":"Adriana Carolin Sangma"},"facility":{"name":"Resubelpara CHC","address":{"streetAddress":"Belpara","streetAddress2":"","district":"North Garo Hills","city":"","addressRegion":"Meghalaya","addressCountry":"IN","postalCode":""}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-01-16T06:20:50Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BIc3VQ31s5b3RPKzwA3FUg9cGcGehULAMbeCCAWw609qV1k9lW8gzb1n2e-tlFbfXaNJQZrU21FdhrnJDFPQyC4buz4edyTk7gpi44T9IVUQ9A_rN_IhqXwOPg_aZ19iP0NCkVgJIkqV6z9nTXslOgz2abZtWH7bvjTWd7WuUVy6jbHL5JnlGTVfZSAi5IAHeEX9qHh_4dRgILO7l7sLR9W2Svfwwy9WVzDSDGu8YvTNLX4Orya6L9tZ2A3_EHpvUKQUN1nm4aRzKNwV9lkL-6529n8NfRqESy-3Lmz9esv9wK0IWv1VyZJ-XRbihGgbT7DQhv3wNNZtXWA3CPOtIQ"}}`},
			},
			want: 2,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getDoseFromCertificate(tt.args.certificateMap); got != tt.want {
				t.Errorf("getDoseFromCertificate() = %v, want %v", got, tt.want)
			}
		})
	}
}