package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/kernel_library/services"
	"github.com/gorilla/mux"
	"github.com/signintech/gopdf"
	log "github.com/sirupsen/logrus"
	"github.com/skip2/go-qrcode"
	"net/http"
	"strings"
	"time"
)

const ApiRole = "api"
const CertificateEntity = "VaccinationCertificate"
const PreEnrollmentCode = "preEnrollmentCode"
const BeneficiaryId = "beneficiaryId"

type Certificate struct {
	Context           []string `json:"@context"`
	Type              []string `json:"type"`
	CredentialSubject struct {
		Type        string `json:"type"`
		ID          string `json:"id"`
		Name        string `json:"name"`
		Gender      string `json:"gender"`
		Age         string `json:"age"`
		Nationality string `json:"nationality"`
	} `json:"credentialSubject"`
	Issuer       string `json:"issuer"`
	IssuanceDate string `json:"issuanceDate"`
	Evidence     []struct {
		ID             string    `json:"id"`
		FeedbackURL    string    `json:"feedbackUrl"`
		InfoURL        string    `json:"infoUrl"`
		Type           []string  `json:"type"`
		Batch          string    `json:"batch"`
		Vaccine        string    `json:"vaccine"`
		Manufacturer   string    `json:"manufacturer"`
		Date           time.Time `json:"date"`
		EffectiveStart string    `json:"effectiveStart"`
		EffectiveUntil string    `json:"effectiveUntil"`
		Verifier       struct {
			Name string `json:"name"`
		} `json:"verifier"`
		Facility struct {
			Name    string `json:"name"`
			Address struct {
				StreetAddress  string `json:"streetAddress"`
				StreetAddress2 string `json:"streetAddress2"`
				District       string `json:"district"`
				City           string `json:"city"`
				AddressRegion  string `json:"addressRegion"`
				AddressCountry string `json:"addressCountry"`
			} `json:"address"`
		} `json:"facility"`
	} `json:"evidence"`
	NonTransferable string `json:"nonTransferable"`
	Proof           struct {
		Type               string    `json:"type"`
		Created            time.Time `json:"created"`
		VerificationMethod string    `json:"verificationMethod"`
		ProofPurpose       string    `json:"proofPurpose"`
		Jws                string    `json:"jws"`
	} `json:"proof"`
}

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
		UDF1         string `xml:"UDF1"`
		URI          string `xml:"URI"`
		DocContent   string `xml:"DocContent"`
		DataContent  string `xml:"DataContent"`
	} `xml:"DocDetails"`
}

func ValidMAC(message string, messageMAC, key []byte) bool {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(message))
	expectedMAC := mac.Sum(nil)
	hexMac := ([]byte)(hex.EncodeToString(expectedMAC))
	if log.IsLevelEnabled(log.InfoLevel) {
		log.Infof("Expected mac %s and got %s", base64.StdEncoding.EncodeToString(hexMac), base64.StdEncoding.EncodeToString(messageMAC))
	}
	return hmac.Equal(messageMAC, hexMac)
}
func uriRequest(w http.ResponseWriter, req *http.Request) {
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
		w.WriteHeader(500)
		_, _ = w.Write([]byte("Error in verifying request signature"))
		return
	}

	if ValidMAC(requestString, hmacSignByteArray, []byte(config.Config.Digilocker.AuthHMACKey)) {

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

			certBundle := getCertificate(xmlRequest.DocDetails.TrackingId, xmlRequest.DocDetails.DOB)
			if certBundle != nil {
				response.DocDetails.URI = certBundle.Uri
				response.ResponseStatus.Status = "1"
				if xmlRequest.Format == "pdf" || xmlRequest.Format == "both" {
					if pdfBytes, err := getCertificateAsPdf(certBundle.signedJson); err != nil {
						log.Errorf("Error in creating certificate pdf")
					} else {
						response.DocDetails.DocContent = base64.StdEncoding.EncodeToString(pdfBytes)
					}
				}
				if xmlRequest.Format == "both" || xmlRequest.Format == "xml" {
					certificateId := certBundle.certificateId
					xmlCert := "<certificate id=\"" + certificateId + "\"><![CDATA[" + certBundle.signedJson + "]]></certificate>"
					response.DocDetails.DataContent = base64.StdEncoding.EncodeToString([]byte(xmlCert))
				}

			}
			if responseBytes, err := xml.Marshal(response); err != nil {
				log.Errorf("Error while serializing xml")
			} else {
				w.WriteHeader(200)
				_, _ = w.Write(responseBytes)
				return
			}
			w.WriteHeader(500)
		}
	} else {
		w.WriteHeader(401)
		_, _ = w.Write([]byte("Unauthorized"))
	}

}

type VaccinationCertificateBundle struct {
	certificateId string
	Uri           string
	signedJson    string
	pdf           []byte
}

func getCertificate(preEnrollmentCode string, dob string) *VaccinationCertificateBundle {
	/* filter := map[string]interface{}{
		"name": map[string]interface{}{
			"eq": fullName,
		},
		"mobile": map[string]interface{}{
			"eq": phoneNumber,
		},
	}  */
	//certificateFromRegistry, err := fetchCertificateFromRegistry(filter)
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		if len(certificateArr) > 0 {
			certificateObj := certificateArr[0].(map[string]interface{})
			log.Infof("certificate resp %v", certificateObj)
			var cert VaccinationCertificateBundle
			cert.certificateId = certificateObj["certificateId"].(string)
			cert.Uri = "in.gov.covin-DPMLC-" + cert.certificateId
			cert.signedJson = certificateObj["certificate"].(string)
			return &cert
		}
	}
	return nil
}

func getCertificateAsPdf(certificateText string) ([]byte, error) {
	var certificate Certificate
	if err := json.Unmarshal([]byte(certificateText), &certificate); err != nil {
		log.Error(err)
		return nil, err
	}

	pdf := gopdf.GoPdf{}
	//pdf.Start(gopdf.Config{PageSize: gopdf.Rect{W: 595.28, H: 841.89}}) //595.28, 841.89 = A4
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})
	pdf.AddPage()

	if err := pdf.AddTTFFont("wts11", "config/Roboto-Medium.ttf"); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	/* if err := pdf.AddTTFFont("arapey", "./Arapey-Italic.ttf"); err != nil {
		log.Print(err.Error())
		return nil, err
	} */
	tpl1 := pdf.ImportPage("config/certificate_template_20200112.pdf", 1, "/MediaBox")
	// Draw pdf onto page
	pdf.UseImportedTemplate(tpl1, 0, 0, 580, 0)

	if err := pdf.SetFont("wts11", "", 10); err != nil {
		log.Print(err.Error())
		return nil, err
	}

	/*if err := pdf.SetFont("arapey", "", 14); err != nil {
		log.Print(err.Error())
		return nil, err
	}*/
	offsetX := 280.0
	offsetY := 361.0
	displayLabels := []string{certificate.CredentialSubject.Name,
		certificate.CredentialSubject.Age + " Years",
		certificate.CredentialSubject.Gender,
		"234234298374293",
		formatId(certificate.CredentialSubject.ID),
		"",
		"", //blank line
		certificate.Evidence[0].Vaccine,
		fomratDate(certificate.Evidence[0].Date) + " (Batch no. " + certificate.Evidence[0].Batch + ")",
		"To be taken 28 days after 1st Dose",
		"",
		formatFacilityAddress(certificate),
		certificate.Evidence[0].Verifier.Name,
	}
	//offsetYs := []float64{0, 20.0, 40.0, 60.0}
	for i := 0; i < len(displayLabels); i++ {
		pdf.SetX(offsetX)
		pdf.SetY(offsetY + float64(i)*22.0)
		pdf.Cell(nil, displayLabels[i])
	}

	e := pasteQrCodeOnPage(certificateText, &pdf)
	if e != nil {
		return nil, e
	}

	//pdf.Image("qr.png", 200, 50, nil)
	//pdf.WritePdf("certificate.pdf")
	var b bytes.Buffer
	pdf.Write(&b)
	return b.Bytes(), nil
}

func formatFacilityAddress(certificate Certificate) string {
	return certificate.Evidence[0].Facility.Name + ", " + certificate.Evidence[0].Facility.Address.District + ", " + certificate.Evidence[0].Facility.Address.AddressRegion
}

func fomratDate(date time.Time) string {
	return date.Format("02 Jan 2006")
}

func formatId(identity string) string {
	split := strings.Split(identity, ":")
	lastFragment := split[len(split)-1]
	if strings.Contains(identity, "aadhaar") {
		return "XXXX XXXX XXXX " + lastFragment[len(lastFragment)-4:]
	}
	return lastFragment
}

func pasteQrCodeOnPage(certificateText string, pdf *gopdf.GoPdf) error {
	qrCode, err := qrcode.New(certificateText, qrcode.Medium)
	if err != nil {
		return err
	}
	imageBytes, err := qrCode.PNG(-2)
	holder, err := gopdf.ImageHolderByBytes(imageBytes)
	err = pdf.ImageByHolder(holder, 400, 30, nil)
	if err != nil {
		log.Errorf("Error while creating QR code")
	}
	return nil
}

func getPDFHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificateObj := certificateArr[0].(map[string]interface{})
			log.Infof("certificate resp %v", certificateObj)
			signedJson := certificateObj["certificate"].(string)
			if pdfBytes, err := getCertificateAsPdf(signedJson); err != nil {
				log.Errorf("Error in creating certificate pdf")
			} else {
				//w.Header().Set("Content-Disposition", "attachment; filename=certificate.pdf")
				//w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
				//w.Header().Set("Content-Length", string(len(pdfBytes)))
				w.WriteHeader(200)
				_, _ = w.Write(pdfBytes)
				return
			}
		}
	}
}

func getCertificateFromRegistry(preEnrollmentCode string) (map[string]interface{}, error) {
	filter := map[string]interface{}{
		PreEnrollmentCode: map[string]interface{}{
			"eq": preEnrollmentCode,
		},
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	return certificateFromRegistry, err
}

func getCertificateJSON(w http.ResponseWriter, request *http.Request) {
	urlParams := request.URL.Query()
	filter := map[string]interface{}{}
	preEnrollmentCode := urlParams.Get(PreEnrollmentCode)
	if preEnrollmentCode != "" {
		filter[PreEnrollmentCode] = map[string]interface{}{
			"eq": preEnrollmentCode,
		}
	}
	beneficiaryId := urlParams.Get(BeneficiaryId)
	if beneficiaryId != "" {
		filter[BeneficiaryId] = map[string]interface{}{
			"eq": beneficiaryId,
		}
	}
	if beneficiaryId == "" && preEnrollmentCode == "" {
		w.WriteHeader(400)
		return
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificateObj := certificateArr[0].(map[string]interface{})
			if responseBytes, err := xml.Marshal(certificateObj); err != nil {
				log.Errorf("Error while serializing xml")
			} else {
				w.WriteHeader(200)
				_, _ = w.Write(responseBytes)
				return
			}
		}
	}
}

func authorize(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claimBody := auth.ExtractClaimBodyFromHeader(r)
		if claimBody != nil {
			isAuthorized := auth.AuthorizeRole([]string{ApiRole}, claimBody)
			if isAuthorized {
				next.ServeHTTP(w, r)
				return
			}
		}
		http.Error(w, "Forbidden", http.StatusForbidden)
	}
}

func main() {
	config.Initialize()
	log.Info("Running digilocker support api")
	r := mux.NewRouter()
	r.HandleFunc("/pullUriRequest", uriRequest).Methods("POST")
	r.HandleFunc("/certificatePDF/{preEnrollmentCode}", authorize(getPDFHandler)).Methods("GET")
	r.HandleFunc("/certificateJSON", authorize(getCertificateJSON)).Methods("GET")
	http.Handle("/", r)
	_ = http.ListenAndServe(":8003", nil)
}
