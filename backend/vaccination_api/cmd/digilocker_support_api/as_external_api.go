package main

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/api/pkg"
	"github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
	"net/http"
)

type ErrorResponse struct {
	Status    string `json:"status"`
	ErrorCode int    `json:"errorCode"`
	Message   string `json:"message"`
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
		publishEvent("", eventTag + EventTagFailed, "Invalid parameters")
		return
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificateObj := certificateArr[len(certificateArr)-1].(map[string]interface{})
			log.Infof("certificate resp %v", certificateObj)
			mobileOnCert := certificateObj["mobile"].(string)
			if mobile != mobileOnCert {
				writeResponse(w, 404, mobileNumberMismatchError())
				publishEvent(pkg.ToString(beneficiaryId), eventTag + EventTagFailed, "Certificate not found")
				return
			} else {
				signedJson := certificateObj["certificate"].(string)
				if pdfBytes, err := getCertificateAsPdf(signedJson); err != nil {
					log.Errorf("Error in creating certificate pdf")
					publishEvent(pkg.ToString(beneficiaryId), eventTag + EventTagFailed, "Unknown " + err.Error())
					w.WriteHeader(500)
				} else {
					w.WriteHeader(200)
					_, _ = w.Write(pdfBytes)
					publishEvent(pkg.ToString(beneficiaryId), eventTag + EventTagSuccess, "Certificate found")
				}
			}
		} else {
			log.Errorf("No certificates found for request %v", filter)
			writeResponse(w, 404, certificateNotFoundForBeneficiaryId(pkg.ToString(beneficiaryId)))
			publishEvent(pkg.ToString(beneficiaryId), eventTag + EventTagFailed, "Certificate not found")
		}
	} else {
		log.Infof("Error %+v", err)
		publishEvent(pkg.ToString(beneficiaryId), eventTag + EventTagFailed, "Unknown " + err.Error())
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
		publishEvent("", EventTagExternal + EventTagFailed, "Invalid parameters")
		return
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
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
					publishEvent(pkg.ToString(beneficiaryId), EventTagExternal + EventTagSuccess, "Certificate found")
					return
				}
			} else { //no certificate found for this mobile --
				writeResponse(w, 404, mobileNumberMismatchError())
				publishEvent(pkg.ToString(beneficiaryId), EventTagExternal + EventTagFailed, "Certificate not found")
			}
		} else {
			log.Errorf("No certificates found for request %v", filter)
			writeResponse(w, 404, certificateNotFoundForBeneficiaryId(pkg.ToString(beneficiaryId)))
			publishEvent(pkg.ToString(beneficiaryId), EventTagExternal + EventTagFailed, "Certificate not found")
		}
	} else {
		log.Errorf("Error in querying registry %v , %+v", filter, err)
		w.WriteHeader(500)
		publishEvent(pkg.ToString(beneficiaryId), EventTagExternal + EventTagError, err.Error())
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

func writeResponse(w http.ResponseWriter, statusCode int, payload ErrorResponse) {

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
