package models

import (
	"encoding/json"
	"testing"
)

func Test(t *testing.T) {

	t.Run("should convert string pincode", func(t *testing.T) {
		msg := `{"name": "xxx Sahoo", "contact": ["tel:123"], "mobile": "123", "preEnrollmentCode": "269484", "certificateId": "123", "certificate": {"@context": ["https://www.w3.org/2018/credentials/v1", "https://cowin.gov.in/credentials/vaccination/v1"], "type": ["VerifiableCredential", "ProofOfVaccinationCredential"], "credentialSubject": {"type": "Person", "id": "did:Aadhaar Card:Aadhaar Card", "refId": "284", "name": "Sahoo", "gender": "Male", "age": "62", "nationality": "Indian", "address": {"streetAddress": "", "streetAddress2": "", "district": "", "city": "", "addressRegion": "", "addressCountry": "IN", "postalCode": ""}}, "issuer": "https://cowin.gov.in/", "issuanceDate": "2021-03-02T16:09:34.183Z", "evidence": [{"id": "https://cowin.gov.in/vaccine/123", "feedbackUrl": "https://cowin.gov.in/?123", "infoUrl": "https://cowin.gov.in/?123", "certificateId": "123", "type": ["Vaccination"], "batch": "4120Z010", "vaccine": "COVISHIELD", "manufacturer": "Serum Institute of India", "date": "2021-03-02T15:27:56.518Z", "effectiveStart": "2021-03-02", "effectiveUntil": "2021-03-02", "dose": 1, "totalDoses": 2, "verifier": {"name": ""}, "facility": {"name": "District Hq Hospital Jajpur", "address": {"streetAddress": "Dhh Jajpur", "streetAddress2": "", "district": "Jajpur", "city": "", "addressRegion": "Odisha", "addressCountry": "IN", "postalCode": ""}}}], "nonTransferable": "true", "proof": {"type": "RsaSignature2018", "created": "2021-03-02T16:09:34Z", "verificationMethod": "did:india", "proofPurpose": "assertionMethod", "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Aa7F0_lGUMlQNqIvdt-dfdvkN0ZYELYxM12NxRLZHoCxlrarQDxUz5c_nSCBGLxWiMUruysQK4tShSENGKCYpg-KvNd6DTbQqAarVd9fROz6RWrQtWyC2tfn0wgj7hRV5AIDWOpP41LRn7eNBS_gOiwY-GelFT7EAFrvD_0vx-O9L5ui5tL1pHqntxs2Bj93nLEzcUSKltUJIEXR8d3fkX2EjiJ3X9vqZv5ikPZT-zlYfu3XLnjoKz-TW5rg-zGCgxWOficj3Vz06SkOUMJteXqkzwZ5xU6sNJSO80iIVx6jtBZcZmaTmNgf4M-WAW1Q_oNrYPIkH7lIzV5xDvJuFA"}}, "dose": 1}`
		var certifiedMessage CertifiedMessage
		if err := json.Unmarshal([]byte(msg), &certifiedMessage); err == nil {
			if certifiedMessage.Certificate.GetFacilityPostalCode() != "" {
				t.Errorf("test failed")
			}
			if certifiedMessage.Certificate.Evidence[0].Dose != 1 {
				t.Errorf("Dose is not 1")
			}
		}
	})

	t.Run("should convert int pincode to string", func(t *testing.T) {
		msg := `{"name": "xxx Sahoo", "contact": ["tel:123"], "mobile": "123", "preEnrollmentCode": "269484", "certificateId": "123", "certificate": {"@context": ["https://www.w3.org/2018/credentials/v1", "https://cowin.gov.in/credentials/vaccination/v1"], "type": ["VerifiableCredential", "ProofOfVaccinationCredential"], "credentialSubject": {"type": "Person", "id": "did:Aadhaar Card:Aadhaar Card", "refId": "284", "name": "Sahoo", "gender": "Male", "age": "62", "nationality": "Indian", "address": {"streetAddress": "", "streetAddress2": "", "district": "", "city": "", "addressRegion": "", "addressCountry": "IN", "postalCode": ""}}, "issuer": "https://cowin.gov.in/", "issuanceDate": "2021-03-02T16:09:34.183Z", "evidence": [{"id": "https://cowin.gov.in/vaccine/123", "feedbackUrl": "https://cowin.gov.in/?123", "infoUrl": "https://cowin.gov.in/?123", "certificateId": "123", "type": ["Vaccination"], "batch": "4120Z010", "vaccine": "COVISHIELD", "manufacturer": "Serum Institute of India", "date": "2021-03-02T15:27:56.518Z", "effectiveStart": "2021-03-02", "effectiveUntil": "2021-03-02", "dose": 1, "totalDoses": 2, "verifier": {"name": ""}, "facility": {"name": "District Hq Hospital Jajpur", "address": {"streetAddress": "Dhh Jajpur", "streetAddress2": "", "district": "Jajpur", "city": "", "addressRegion": "Odisha", "addressCountry": "IN", "postalCode": 123123}}}], "nonTransferable": "true", "proof": {"type": "RsaSignature2018", "created": "2021-03-02T16:09:34Z", "verificationMethod": "did:india", "proofPurpose": "assertionMethod", "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Aa7F0_lGUMlQNqIvdt-dfdvkN0ZYELYxM12NxRLZHoCxlrarQDxUz5c_nSCBGLxWiMUruysQK4tShSENGKCYpg-KvNd6DTbQqAarVd9fROz6RWrQtWyC2tfn0wgj7hRV5AIDWOpP41LRn7eNBS_gOiwY-GelFT7EAFrvD_0vx-O9L5ui5tL1pHqntxs2Bj93nLEzcUSKltUJIEXR8d3fkX2EjiJ3X9vqZv5ikPZT-zlYfu3XLnjoKz-TW5rg-zGCgxWOficj3Vz06SkOUMJteXqkzwZ5xU6sNJSO80iIVx6jtBZcZmaTmNgf4M-WAW1Q_oNrYPIkH7lIzV5xDvJuFA"}}, "dose": 1}`
		var certifiedMessage CertifiedMessage
		if err := json.Unmarshal([]byte(msg), &certifiedMessage); err == nil {
			if certifiedMessage.Certificate.GetFacilityPostalCode() != "123123" {
				t.Errorf("test failed")
			}
		}
	})

}

