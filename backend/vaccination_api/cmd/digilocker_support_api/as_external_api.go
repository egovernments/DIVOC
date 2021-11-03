package main

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/api/pkg"
	"github.com/divoc/api/pkg/models"
	"github.com/divoc/kernel_library/services"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

type ErrorResponse struct {
	Status    string `json:"status"`
	ErrorCode int    `json:"errorCode"`
	Message   string `json:"message"`
}

type CertificateKYCResponse struct {
	Name        string 		`json:"name"`
	Age         string 		`json:"age"`
	Gender      string 		`json:"gender"`
	Identity    string 		`json:"identity"`
	RefId       string 		`json:"refId"`
	Vaccine     string 		`json:"vaccine"`
	Status    	string 		`json:"status"`
	DateOfDose1 string 	`json:"dateOfDose1"`
	DateOfDose2 string 	`json:"dateOfDose2"`
}

const NOT_VACCINATED = "NOT_VACCINATED"
const PARTIALLY_VACCINATED = "PARTIALLY_VACCINATED"
const FULLY_VACCINATED = "FULLY_VACCINATED"

func getCertificateKYCDetailsExternalApiHandler(w http.ResponseWriter, r *http.Request) {
	eventTag := EventTagExternal
	log.Infof("kyc request %s", eventTag)

	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	latestSignedJson, provisionalSignedJson, err := getSignedJson(preEnrollmentCode)
	if err != nil {
		log.Infof("Error %+v", err)
		publishEvent(pkg.ToString(preEnrollmentCode), eventTag+EventTagFailed, "Unknown "+err.Error())
		w.WriteHeader(500)
		return
	}
	if latestSignedJson != "" {
		if kycResponse, err := getKYCDetailsFromCertificate(latestSignedJson, provisionalSignedJson); err != nil {
			log.Errorf("Error in getting KYC Details from certificate %s", err.Error())
			publishEvent(pkg.ToString(preEnrollmentCode), eventTag+EventTagFailed, "Unknown "+err.Error())
			w.WriteHeader(500)
			return
		} else {
			log.Infof("%v", kycResponse)
			writeResponse(w, 200, kycResponse)
			w.WriteHeader(200)
			publishEvent(pkg.ToString(preEnrollmentCode), eventTag+EventTagSuccess, "Certificate found")
		}

	} else {
		log.Errorf("No certificates found for BeneficiaryId %v", preEnrollmentCode)
		writeResponse(w, 404, certificateNotFoundForBeneficiaryId(pkg.ToString(preEnrollmentCode)))
		publishEvent(pkg.ToString(preEnrollmentCode), eventTag+EventTagFailed, "Certificate not found")
	}
}

func getKYCDetailsFromCertificate(latestCertificateText string, provisionalSignedJson string) (CertificateKYCResponse, error) {
	var certificate models.Certificate
	var status = NOT_VACCINATED
	if err := json.Unmarshal([]byte(latestCertificateText), &certificate); err != nil {
		log.Error("Unable to parse certificate string", err)
		return CertificateKYCResponse{}, err
	}
	var provisionalDoseDate string
	var finalDoseDate string

	if !isFinal(certificate) {
		status = PARTIALLY_VACCINATED
		provisionalDoseDate = certificate.Evidence[0].Date.Format("02-01-2006")
	} else {
		status = FULLY_VACCINATED
		finalDoseDate = certificate.Evidence[0].Date.Format("02-01-2006")
		var provisionalCertificate *models.Certificate
		if provisionalSignedJson != "" {
			if err := json.Unmarshal([]byte(provisionalSignedJson), &provisionalCertificate); err != nil {
				log.Error("Unable to parse provisional certificate string", err)
				return CertificateKYCResponse{}, err
			} else {
				provisionalDoseDate = provisionalCertificate.Evidence[0].Date.Format("02-01-2006")
			}
		}
	}

	response := CertificateKYCResponse{
		Name:        certificate.CredentialSubject.Name,
		Gender:      certificate.CredentialSubject.Gender,
		Age:         certificate.CredentialSubject.Age,
		RefId:       certificate.CredentialSubject.RefId,
		Identity:    formatId(certificate.CredentialSubject.ID),
		Status:      status,
		Vaccine:     strings.ToUpper(certificate.Evidence[0].Vaccine),
		DateOfDose1: provisionalDoseDate,
		DateOfDose2: finalDoseDate,
	}
	return response, nil

}

func getCertificatePDFExternalApiHandler(w http.ResponseWriter, r *http.Request) {
	getCertificatePDFHandler(w, r, EventTagExternal)
}

func getCertificatePDFHandler(w http.ResponseWriter, r *http.Request, eventTag string) {
	log.Infof("pdf request %s", eventTag)
	var requestBody map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	mobile, found := requestBody[Mobile]
	filter := map[string]interface{}{}
	beneficiaryId, found := requestBody[BeneficiaryId]
	if found {
		filter[PreEnrollmentCode] = map[string]interface{}{
			"eq": beneficiaryId,
		}
	}
	if mobile == nil || beneficiaryId == nil {
		log.Errorf("get certificates requested with no parameters, %v", requestBody)
		w.WriteHeader(400)
		publishEvent("", eventTag+EventTagFailed, "Invalid parameters")
		return
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = pkg.SortCertificatesByCreateAt(certificateArr)
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificatesByDose := pkg.GetDoseWiseCertificates(certificateArr)
			latestCertificate := getLatestCertificate(certificatesByDose)
			log.Infof("certificate resp %v", latestCertificate)
			mobileOnCert := latestCertificate["mobile"].(string)
			if mobile != mobileOnCert {
				writeResponse(w, 404, mobileNumberMismatchError())
				publishEvent(pkg.ToString(beneficiaryId), eventTag+EventTagFailed, "Certificate not found")
				return
			} else {
				if pdfBytes, err := getCertificateAsPdfV3(certificatesByDose); err != nil {
					log.Errorf("Error in creating certificate pdf")
					publishEvent(pkg.ToString(beneficiaryId), eventTag+EventTagFailed, "Unknown "+err.Error())
					w.WriteHeader(500)
				} else {
					w.WriteHeader(200)
					_, _ = w.Write(pdfBytes)
					publishEvent(pkg.ToString(beneficiaryId), eventTag+EventTagSuccess, "Certificate found")
				}
			}
		} else {
			log.Errorf("No certificates found for request %v", filter)
			writeResponse(w, 404, certificateNotFoundForBeneficiaryId(pkg.ToString(beneficiaryId)))
			publishEvent(pkg.ToString(beneficiaryId), eventTag+EventTagFailed, "Certificate not found")
		}
	} else {
		log.Infof("Error %+v", err)
		publishEvent(pkg.ToString(beneficiaryId), eventTag+EventTagFailed, "Unknown "+err.Error())
		w.WriteHeader(500)
	}

}

func mobileNumberMismatchError() ErrorResponse {
	payload := ErrorResponse{
		Status:    "not_found",
		ErrorCode: 2,
		Message:   `Mobile number is not matching for the given beneficiary Id`,
	}
	return payload
}

func getCertificates(w http.ResponseWriter, request *http.Request) {
	log.Info("GET CERTIFICATES JSON ")
	var requestBody map[string]interface{}
	err := json.NewDecoder(request.Body).Decode(&requestBody)
	mobile, found := requestBody[Mobile]
	filter := map[string]interface{}{}
	beneficiaryId, found := requestBody[BeneficiaryId]
	if found {
		filter[PreEnrollmentCode] = map[string]interface{}{
			"eq": beneficiaryId,
		}
	}
	if mobile == nil || beneficiaryId == nil {
		log.Errorf("get certificates requested with no parameters, %v", requestBody)
		w.WriteHeader(400)
		publishEvent("", EventTagExternal+EventTagFailed, "Invalid parameters")
		return
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = pkg.SortCertificatesByCreateAt(certificateArr)
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificatesForThisMobile := []map[string]interface{}{}
			for i := 0; i < len(certificateArr); i++ {
				certificateObj := certificateArr[i].(map[string]interface{})
				if certificateObj["mobile"] == mobile {
					certificatesForThisMobile = append(certificatesForThisMobile, certificateObj)
				}
			}
			if len(certificatesForThisMobile) > 0 {
				certificates := map[string]interface{}{
					"certificates": certificatesForThisMobile,
				}
				if responseBytes, err := json.Marshal(certificates); err != nil {
					log.Errorf("Error while serializing xml")
				} else {
					w.WriteHeader(200)
					w.Header().Set("Content-Type", "application/json")
					_, _ = w.Write(responseBytes)
					publishEvent(pkg.ToString(beneficiaryId), EventTagExternal+EventTagSuccess, "Certificate found")
					return
				}
			} else { //no certificate found for this mobile --
				writeResponse(w, 404, mobileNumberMismatchError())
				publishEvent(pkg.ToString(beneficiaryId), EventTagExternal+EventTagFailed, "Certificate not found")
			}
		} else {
			log.Errorf("No certificates found for request %v", filter)
			writeResponse(w, 404, certificateNotFoundForBeneficiaryId(pkg.ToString(beneficiaryId)))
			publishEvent(pkg.ToString(beneficiaryId), EventTagExternal+EventTagFailed, "Certificate not found")
		}
	} else {
		log.Errorf("Error in querying registry %v , %+v", filter, err)
		w.WriteHeader(500)
		publishEvent(pkg.ToString(beneficiaryId), EventTagExternal+EventTagError, err.Error())
		return
	}
}

func certificateNotFoundForBeneficiaryId(beneficiaryId string) ErrorResponse {
	payload := fmt.Sprintf(`No certificate found for the given beneficiary Id %s`, beneficiaryId)
	errorResponse := ErrorResponse{
		Status:    "not_found",
		ErrorCode: 1,
		Message:   payload,
	}
	return errorResponse
}

func writeResponse(w http.ResponseWriter, statusCode int, payload interface{}) {

	if payloadBytes, err := json.Marshal(payload); err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		_, _ = w.Write(payloadBytes)
	} else {
		log.Errorf("Error in converting response to json %+v", err)
		w.WriteHeader(500)
		_, _ = w.Write([]byte("Internal error"))
	}
}
