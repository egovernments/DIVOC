package services

import (
	"encoding/json"
	"github.com/divoc/api/pkg/models"
	models2 "github.com/divoc/api/swagger_gen/models"
	"reflect"
	"testing"
)

func getMockSignedCertificateData(t *testing.T) *models.Certificate {

	b := []byte(`
	{
	  "credentialSubject": {
		"type": "Person",
		"id": "did:passport:890989078",
		"refId": "223718502B8",
		"name": "Test user",
		"uhid": "",
		"gender": "Female",
		"age": "31",
		"nationality": "Indian",
		"address": {
		  "streetAddress": "",
		  "streetAddress2": "",
		  "district": "",
		  "city": "",
		  "addressRegion": "",
		  "addressCountry": "IND",
		  "postalCode": 416201
		},
		"dob": "1990-06-15"
	  },
	  "evidence": [
		{
		  "certificateId": "52160015111",
		  "type": [
			"Vaccination"
		  ],
		  "batch": "4121Z062",
		  "vaccine": "COVISHIELD",
		  "manufacturer": "Serum Institute of India",
		  "date": "2021-12-15T00:06:00.000Z",
		  "effectiveStart": "2021-12-15",
		  "effectiveUntil": "2021-12-15",
		  "dose": 1,
		  "totalDoses": 2,
		  "verifier": {
			"name": "Neha Vacc"
		  },
		  "facility": {
			"name": "Sunchiti Hospital",
			"address": {
			  "streetAddress": "Shivaji Nagar",
			  "streetAddress2": "",
			  "district": "Kolhapur",
			  "city": "",
			  "addressRegion": "Maharashtra",
			  "addressCountry": "IND",
			  "postalCode": 416201
			}
		  },
		  "icd11Code": "XM9QW8",
		  "prophylaxis": "COVID-19 vaccine, non-replicating viral vector"
		}
	  ]
	}`)
	var certificateRequest models.Certificate
	err := json.Unmarshal(b, &certificateRequest)
	if err == nil {
		return &certificateRequest
	}
	t.Errorf("Error unmarshalling certificateRequest data json #{err}")
	return nil
}

func getMockCertifyRequestV2(t *testing.T) *models2.CertificationRequestV2 {
	b := []byte(`
     {  
        "preEnrollmentCode": "223718502B8",
        "recipient": {
            "name": "Test user",
            "uhid": "",
            "dob": "1990-06-15",
            "age": "31",
            "gender": "Female",
            "nationality": "Indian",
            "identity": "did:Passport:890989078",
            "contact": [
                "tel:1234567890"
            ],
            "address": {
                "addressLine1": "",
                "addressLine2": "",
                "district": "",
                "state": "",
                "pincode": 416201
            }
        },
        "vaccination": {
            "name": "COVISHIELD",
            "batch": "4121Z062",
            "manufacturer": "Serum Institute of India",
            "date": "2021-12-15T00:00:00.000Z",
            "effectiveStart": "2021-12-15",
            "effectiveUntil": "2021-12-15",
            "dose": 2,
            "totalDoses": 2
        },
        "vaccinator": {
            "name": "Neha Vacc"
        },
        "facility": {
            "name": "Sunchiti Hospital",
            "address": {
                "addressLine1": "Shivaji Nagar",
                "addressLine2": "",
                "district": "Kolhapur",
                "state": "Maharashtra",
                "pincode": 416201
            }
        },
        "meta": {
            "vaccinations": [
                {
                    "name":"COVAXIN",
                    "dose": 1,
                    "manufacturer":"Bharat Biotech",
                    "batch":"4121Z063",
                    "date":"2021-12-13T00:00:00.000Z"
                }
            ]
        }
    }`)
	var certifyV2Request models2.CertificationRequestV2
	err := json.Unmarshal(b, &certifyV2Request)
	if err == nil {
		return &certifyV2Request
	}
	t.Error("Error unmarshalling certifyV2Request json")
	return nil
}

func getMockUpdateRequestObject(t *testing.T) *models2.CertificationRequestV2 {
	b := []byte(`
     {  
        "preEnrollmentCode": "223718502B8",
        "recipient": {
            "name": "Test user",
            "uhid": "",
            "dob": "1990-06-15",
            "age": "31",
            "gender": "Female",
            "nationality": "Indian",
            "identity": "did:Passport:890989078",
            "contact": [
                "tel:1234567890"
            ],
            "address": {
                "addressLine1": "",
                "addressLine2": "",
                "district": "",
                "state": "",
                "pincode": 416201
            }
        },
        "vaccination": {
            "name": "COVAXIN",
            "batch": "4121Z063",
            "manufacturer": "Bharat Biotech",
            "date": "2021-12-13T00:00:00.000Z",
            "effectiveStart": "2021-12-15",
            "effectiveUntil": "2021-12-15",
            "dose": 1,
            "totalDoses": 2
        },
        "vaccinator": {
            "name": "Neha Vacc"
        },
        "facility": {
            "name": "Sunchiti Hospital",
            "address": {
                "addressLine1": "Shivaji Nagar",
                "addressLine2": "",
                "district": "Kolhapur",
                "state": "Maharashtra",
                "pincode": 416201
            }
        },
        "meta": {
			"previousCertificateId": "52160015111"
		}
    }`)
	var certifyV2Request models2.CertificationRequestV2
	err := json.Unmarshal(b, &certifyV2Request)
	if err == nil {
		return &certifyV2Request
	}
	t.Error("Error unmarshalling certifyV2Request json")
	return nil
}

func TestUpdateDateAndVaccine(t *testing.T) {
	certifyMessage := getMockCertifyRequestV2(t)
	signedCertificateFromDB := getMockSignedCertificateData(t)
	expectedUpdateReqObject := getMockUpdateRequestObject(t)
	updateReqObject := CreateUpdateRequestObject(certifyMessage, signedCertificateFromDB, certifyMessage.Meta.Vaccinations[0])
	if !reflect.DeepEqual(*expectedUpdateReqObject, *updateReqObject) {
		t.Errorf("Expected %v, got %v", *expectedUpdateReqObject.Facility.Address, *updateReqObject.Facility.Address)
	}
}

func TestUpdateDateAndBatchNumber(t *testing.T) {
	certifyMessage := getMockCertifyRequestV2(t)
	signedCertificateFromDB := getMockSignedCertificateData(t)
	expectedUpdateReqObject := getMockUpdateRequestObject(t)
	// updating batch number and date, using same vaccine name and manufacturer in signed certificate
	certifyMessage.Meta.Vaccinations[0] = &models2.CertificationRequestV2MetaVaccinationsItems0{
		Batch:        "4121Z063",
		Date:         "2021-12-13T00:00:00.000Z",
		Dose:         1,
		Manufacturer: "",
		Name:         "",
	}
	expectedUpdateReqObject.Vaccination.Manufacturer = "Serum Institute of India"
	expectedUpdateReqObject.Vaccination.Name = "COVISHIELD"
	updateReqObject := CreateUpdateRequestObject(certifyMessage, signedCertificateFromDB, certifyMessage.Meta.Vaccinations[0])
	if !reflect.DeepEqual(*expectedUpdateReqObject, *updateReqObject) {
		t.Errorf("Expected %v, got %v", *expectedUpdateReqObject, *updateReqObject)
	}
}

func TestIfPinCodeIsEmpty(t *testing.T) {
	certifyMessage := getMockCertifyRequestV2(t)
	signedCertificateFromDB := getMockSignedCertificateData(t)
	expectedUpdateReqObject := getMockUpdateRequestObject(t)
	//signed certificate facility pincode is empty
	signedCertificateFromDB.Evidence[0].Facility.Address.PostalCode = ""
	expectedUpdateReqObject.Facility.Address.Pincode = 0
	updateReqObject := CreateUpdateRequestObject(certifyMessage, signedCertificateFromDB, certifyMessage.Meta.Vaccinations[0])
	if !reflect.DeepEqual(*expectedUpdateReqObject, *updateReqObject) {
		t.Errorf("Expected %v, got %v", *expectedUpdateReqObject, *updateReqObject)
	}
}
