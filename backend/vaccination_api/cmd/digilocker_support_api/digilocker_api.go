package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/xml"
	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg"
	"github.com/divoc/api/pkg/models"
	kafkaService "github.com/divoc/api/pkg/services"
	log "github.com/sirupsen/logrus"
	"net/http"
	"strings"
	"time"
)

type PullURIRequest struct {
	XMLName    xml.Name `xml:"PullURIRequest"`
	Text       string   `xml:",chardata"`
	Ns2        string   `xml:"ns2,attr"`
	Ver        string   `xml:"ver,attr"`
	Ts         string   `xml:"ts,attr"`
	Txn        string   `xml:"txn,attr"`
	OrgId      string   `xml:"orgId,attr"`
	Format     string   `xml:"format,attr"`
	DocDetails struct {
		Text         string `xml:",chardata"`
		DocType      string `xml:"DocType"`
		DigiLockerId string `xml:"DigiLockerId"`
		UID          string `xml:"UID"`
		FullName     string `xml:"FullName"`
		DOB          string `xml:"DOB"`
		Photo        string `xml:"Photo"`
		TrackingId   string `xml:"tracking_id"`
		Mobile       string `xml:"Mobile"`
		UDF1         string `xml:"UDF1"`
		UDF2         string `xml:"UDF2"`
		UDF3         string `xml:"UDF3"`
		UDFn         string `xml:"UDFn"`
	} `xml:"DocDetails"`
}

type PullURIResponse struct {
	XMLName        xml.Name `xml:"PullURIResponse"`
	Text           string   `xml:",chardata"`
	Ns2            string   `xml:"ns2,attr"`
	ResponseStatus struct {
		Text   string `xml:",chardata"`
		Status string `xml:"Status,attr"`
		Ts     string `xml:"ts,attr"`
		Txn    string `xml:"txn,attr"`
	} `xml:"ResponseStatus"`
	DocDetails struct {
		Text         string `xml:",chardata"`
		DocType      string `xml:"DocType"`
		DigiLockerId string `xml:"DigiLockerId"`
		UID          string `xml:"UID"`
		FullName     string `xml:"FullName"`
		DOB          string `xml:"DOB"`
		TrackingId   string `xml:"tracking_id"`
		Mobile       string `xml:"Mobile"`
		UDF1         string `xml:"UDF1"`
		URI          string `xml:"URI"`
		DocContent   string `xml:"DocContent"`
		DataContent  string `xml:"DataContent"`
	} `xml:"DocDetails"`
}

type PullDocRequest struct {
	XMLName    xml.Name `xml:"PullDocRequest"`
	Text       string   `xml:",chardata"`
	Ns2        string   `xml:"ns2,attr"`
	Ver        string   `xml:"ver,attr"`
	Ts         string   `xml:"ts,attr"`
	Txn        string   `xml:"txn,attr"`
	OrgId      string   `xml:"orgId,attr"`
	Format     string   `xml:"format,attr"`
	DocDetails struct {
		Text         string `xml:",chardata"`
		URI          string `xml:"URI"`
		DigiLockerId string `xml:"DigiLockerId"`
		UID          string `xml:"UID"`
		FullName     string `xml:"FullName"`
		DOB          string `xml:"DOB"`
	} `xml:"DocDetails"`
}

type PullDocResponse struct {
	XMLName        xml.Name `xml:"PullDocResponse"`
	Text           string   `xml:",chardata"`
	Ns2            string   `xml:"ns2,attr"`
	ResponseStatus struct {
		Text   string `xml:",chardata"`
		Status string `xml:"Status,attr"`
		Ts     string `xml:"ts,attr"`
		Txn    string `xml:"txn,attr"`
	} `xml:"ResponseStatus"`
	DocDetails struct {
		Text        string `xml:",chardata"`
		DocContent  string `xml:"DocContent"`
		DataContent string `xml:"DataContent"`
	} `xml:"DocDetails"`
}

func ValidMAC(message string, messageMAC []byte, keyString string) bool {
	if keyString == "ignore" {
		return true
	}
	key := ([]byte)(keyString)
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(message))
	expectedMAC := mac.Sum(nil)
	hexMac := ([]byte)(hex.EncodeToString(expectedMAC))
	if log.IsLevelEnabled(log.InfoLevel) {
		log.Infof("Expected mac %s and got %s", base64.StdEncoding.EncodeToString(hexMac), base64.StdEncoding.EncodeToString(messageMAC))
	}
	return hmac.Equal(messageMAC, hexMac)
}

func docRequest(w http.ResponseWriter, req *http.Request) {
	log.Info("Got document request ")
	requestBuffer, requestString, hmacSignByteArray, done := preProcessRequest(req, w)
	if done {
		return
	}

	if ValidMAC(requestString, hmacSignByteArray, config.Config.Digilocker.AuthHMACKey) {
		xmlRequest := PullDocRequest{}
		if err := xml.Unmarshal(requestBuffer, &xmlRequest); err != nil {
			log.Errorf("Error in marshalling request from the digilocker %+v", err)
		} else {

			response := PullDocResponse{}
			response.ResponseStatus.Ts = xmlRequest.Ts
			response.ResponseStatus.Txn = xmlRequest.Txn
			response.ResponseStatus.Status = "0"
			certBundle := getCertificateByUri(xmlRequest.DocDetails.URI, xmlRequest.DocDetails.DOB)
			if certBundle != nil {
				response.ResponseStatus.Status = "1"
				if xmlRequest.Format == "pdf" || xmlRequest.Format == "both" {
					if pdfBytes, err := getCertificateAsPdfV3(certBundle.certificatesByDoses, getLanguageFromQueryParams(req)); err != nil {
						log.Errorf("Error in creating certificate pdf %+v", err)
						go kafkaService.PublishEvent(models.Event{
							Date:          time.Time{},
							Source:        "" + xmlRequest.DocDetails.URI,
							TypeOfMessage: "internal_error",
							ExtraInfo:     nil,
						})
						w.WriteHeader(500)
					} else {
						response.DocDetails.DocContent = base64.StdEncoding.EncodeToString(pdfBytes)
					}
				}
				if xmlRequest.Format == "both" || xmlRequest.Format == "xml" {
					certificateId := certBundle.certificateId
					latestCertificate := getLatestCertificate(certBundle.certificatesByDoses)
					latestSignedJson := latestCertificate["certificate"].(string)
					xmlCert := "<certificate id=\"" + certificateId + "\"><![CDATA[" + latestSignedJson + "]]></certificate>"
					response.DocDetails.DataContent = base64.StdEncoding.EncodeToString([]byte(xmlCert))
				}

			} else {
				go kafkaService.PublishEvent(models.Event{
					Date:          time.Now(),
					Source:        xmlRequest.DocDetails.URI,
					TypeOfMessage: DigilockerFailedEvent,
					ExtraInfo:     "Certificate not found",
				})
			}
			if responseBytes, err := xml.Marshal(response); err != nil {
				log.Errorf("Error while serializing xml")
			} else {
				go kafkaService.PublishEvent(models.Event{
					Date:          time.Now(),
					Source:        xmlRequest.DocDetails.URI,
					TypeOfMessage: DigilockerSuccessEvent,
					ExtraInfo:     "Certificate found",
				})
				w.Header().Set("Content-Type", "application/xml")
				w.WriteHeader(200)

				_, _ = w.Write(responseBytes)
				return
			}
			w.WriteHeader(500)
		}
	} else {
		log.Errorf("Unauthorized access")
		w.WriteHeader(401)
		_, _ = w.Write([]byte("Unauthorized"))
		go kafkaService.PublishEvent(models.Event{
			Date:          time.Now(),
			Source:        "",
			TypeOfMessage: DigilockerFailedEvent,
			ExtraInfo:     "invalid hmac",
		})
	}
}

func uriRequest(w http.ResponseWriter, req *http.Request) {
	requestBuffer, requestString, hmacSignByteArray, done := preProcessRequest(req, w)
	if done {
		return
	}

	if ValidMAC(requestString, hmacSignByteArray, config.Config.Digilocker.AuthHMACKey) {

		xmlRequest := PullURIRequest{}
		if err := xml.Unmarshal(requestBuffer, &xmlRequest); err != nil {
			log.Errorf("Error in marshalling request from the digilocker %+v", err)
		} else {

			response := PullURIResponse{}
			response.ResponseStatus.Ts = xmlRequest.Ts
			response.ResponseStatus.Txn = xmlRequest.Txn
			response.ResponseStatus.Status = "0"
			response.DocDetails.DocType = config.Config.Digilocker.DocType
			response.DocDetails.DigiLockerId = xmlRequest.DocDetails.DigiLockerId
			response.DocDetails.FullName = xmlRequest.DocDetails.FullName
			response.DocDetails.DOB = xmlRequest.DocDetails.DOB

			certBundle := getCertificate(xmlRequest.DocDetails.TrackingId, xmlRequest.DocDetails.DOB, xmlRequest.DocDetails.Mobile)
			if certBundle != nil && (certBundle.mobile == xmlRequest.DocDetails.Mobile || strings.TrimSpace(strings.ToLower(certBundle.name)) == strings.TrimSpace(strings.ToLower(xmlRequest.DocDetails.FullName))) {
				response.DocDetails.URI = certBundle.Uri
				response.ResponseStatus.Status = "1"
				if xmlRequest.Format == "pdf" || xmlRequest.Format == "both" {
					if pdfBytes, err := getCertificateAsPdfV3(certBundle.certificatesByDoses, getLanguageFromQueryParams(req)); err != nil {
						log.Errorf("Error in creating certificate pdf")
					} else {
						response.DocDetails.DocContent = base64.StdEncoding.EncodeToString(pdfBytes)
					}
				}
				if xmlRequest.Format == "both" || xmlRequest.Format == "xml" {
					certificateId := certBundle.certificateId
					latestCertificate := getLatestCertificate(certBundle.certificatesByDoses)
					latestSignedJson := latestCertificate["certificate"].(string)
					xmlCert := "<certificate id=\"" + certificateId + "\"><![CDATA[" + latestSignedJson + "]]></certificate>"
					response.DocDetails.DataContent = base64.StdEncoding.EncodeToString([]byte(xmlCert))
				}

			} else {
				go kafkaService.PublishEvent(models.Event{
					Date:          time.Now(),
					Source:        xmlRequest.DocDetails.TrackingId,
					TypeOfMessage: DigilockerFailedEvent,
					ExtraInfo:     "Certificate not found",
				})
			}
			if responseBytes, err := xml.Marshal(response); err != nil {
				log.Errorf("Error while serializing xml")
			} else {
				go kafkaService.PublishEvent(models.Event{
					Date:          time.Now(),
					Source:        xmlRequest.DocDetails.TrackingId,
					TypeOfMessage: DigilockerSuccessEvent,
					ExtraInfo:     "Certificate found",
				})
				w.Header().Set("Content-Type", "application/xml")
				w.WriteHeader(200)
				_, _ = w.Write(responseBytes)
				return
			}
			w.WriteHeader(500)
		}
	} else {
		log.Errorf("Unauthorized access")
		w.WriteHeader(401)
		_, _ = w.Write([]byte("Unauthorized"))
		go kafkaService.PublishEvent(models.Event{
			Date:          time.Now(),
			Source:        "",
			TypeOfMessage: DigilockerFailedEvent,
			ExtraInfo:     "Invalid hmac",
		})
	}

}

func preProcessRequest(req *http.Request, w http.ResponseWriter) ([]byte, string, []byte, bool) {
	log.Info("Got request ")
	for name, values := range req.Header {
		for _, value := range values {
			log.Infof("%s:%s", name, value)
		}
	}
	requestBuffer := make([]byte, 2048)
	n, _ := req.Body.Read(requestBuffer)
	requestString := string(requestBuffer[:n])
	log.Infof("Read %d bytes ", n)
	println(requestString)
	log.Infof("Request body %s", requestString)
	hmacDigest := req.Header.Get(config.Config.Digilocker.AuthKeyName)
	hmacSignByteArray, e := base64.StdEncoding.DecodeString(hmacDigest)
	if e != nil {
		log.Errorf("Error in verifying request signature")
		w.WriteHeader(500)
		_, _ = w.Write([]byte("Error in verifying request signature"))
		go kafkaService.PublishEvent(models.Event{
			Date:          time.Now(),
			Source:        "",
			TypeOfMessage: DigilockerFailedEvent,
			ExtraInfo:     "invalid hmac signature",
		})
		return nil, "", nil, true
	}
	return requestBuffer, requestString, hmacSignByteArray, false
}

type VaccinationCertificateBundle struct {
	certificateId         string
	Uri                   string
	mobile                string
	name                  string
	certificatesByDoses   map[int][]map[string]interface{}
}

func getCertificateByUri(uri string, dob string) *VaccinationCertificateBundle {
	slice := strings.Split(uri, "-")
	certificateId := slice[len(slice)-1]
	certificateFromRegistry, err := getCertificateFromRegistryByCertificateId(certificateId)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = pkg.SortCertificatesByCreateAt(certificateArr)
		if len(certificateArr) > 0 {
			latestCertificate := certificateArr[len(certificateArr)-1].(map[string]interface{})
			log.Infof("certificate resp %v", latestCertificate)
			dose := pkg.GetDoseFromCertificate(latestCertificate)
			if dose > 1 {
				certificatesByDoses := map[int][]map[string]interface{}{
					dose: {latestCertificate},
				}
				// fetch provisional certs
				preEnrollmentCode := latestCertificate["preEnrollmentCode"].(string)
				prevCertificatesByDoses, err :=  getCertificatesByDosesForDose(preEnrollmentCode, int64(dose-1))
				if err == nil {
					for d, v := range prevCertificatesByDoses {
						certificatesByDoses[d] = v
					}
				} else {
					log.Errorf("Error while querying for previous certificates %+v", err)
				}

				var cert VaccinationCertificateBundle
				cert.certificateId = latestCertificate["certificateId"].(string)
				cert.Uri = "in.gov.covin-" + "VACER" + "-" + cert.certificateId
				cert.mobile = latestCertificate["mobile"].(string)
				cert.name = latestCertificate["name"].(string)
				cert.certificatesByDoses = certificatesByDoses
				return &cert
			}
		}
	}
	return returnLatestCertificate(err, certificateFromRegistry, certificateId)
}

func getCertificate(preEnrollmentCode string, dob string, mobile string) *VaccinationCertificateBundle {
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	return returnLatestCertificate(err, certificateFromRegistry, preEnrollmentCode)
}

func returnLatestCertificate(err error, certificateFromRegistry map[string]interface{}, referenceId string) *VaccinationCertificateBundle {
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = pkg.SortCertificatesByCreateAt(certificateArr)
		if len(certificateArr) > 0 {
			certificatesByDose := pkg.GetDoseWiseCertificates(certificateArr)
			latestCertificate := getLatestCertificate(certificatesByDose)
			log.Infof("certificate resp %v", latestCertificate)
			var cert VaccinationCertificateBundle
			cert.certificateId = latestCertificate["certificateId"].(string)
			cert.Uri = "in.gov.covin-" + "VACER" + "-" + cert.certificateId
			cert.mobile = latestCertificate["mobile"].(string)
			cert.name = latestCertificate["name"].(string)
			cert.certificatesByDoses = certificatesByDose
			return &cert
		} else {
			log.Errorf("No certificates found for req %v", referenceId)
		}
	}
	return nil
}

func getProvisionalCertificateForPreEnrollmentCode(preEnrollmentCode string) string {
	log.Infof("Fetching provisional certificate for preEnrollmentCode %v", preEnrollmentCode)
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = pkg.SortCertificatesByCreateAt(certificateArr)
		if len(certificateArr) > 0 {
			certificatesByDose := pkg.GetDoseWiseCertificates(certificateArr)
			provisionalCertificate := getProvisionalCertificate(certificatesByDose)
			log.Infof("certificate resp %v", provisionalCertificate)
			provisionalSignedJson := ""
			if provisionalCertificate != nil {
				provisionalSignedJson = provisionalCertificate["certificate"].(string)
			}
			return provisionalSignedJson
		}
	}
	return ""
}
