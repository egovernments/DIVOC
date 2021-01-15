package main

import (
	"archive/zip"
	"bytes"
	"compress/flate"
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
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

const ApiRole = "api"
const ArogyaSetuRole = "arogyasetu"
const CertificateEntity = "VaccinationCertificate"
const PreEnrollmentCode = "preEnrollmentCode"
const CertificateId = "certificateId"
const Mobile = "mobile"
const BeneficiaryId = "beneficiaryId"

type Certificate struct {
	Context           []string `json:"@context"`
	Type              []string `json:"type"`
	CredentialSubject struct {
		Type        string `json:"type"`
		ID          string `json:"id"`
		RefId       string `json:"refId"`
		Name        string `json:"name"`
		Gender      string `json:"gender"`
		Age         string `json:"age"`
		Nationality string `json:"nationality"`
		Address     struct {
			StreetAddress  string `json:"streetAddress"`
			StreetAddress2 string `json:"streetAddress2"`
			District       string `json:"district"`
			City           string `json:"city"`
			AddressRegion  string `json:"addressRegion"`
			AddressCountry string `json:"addressCountry"`
		} `json:"address"`
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
		Dose           int       `json:"dose"`
		TotalDoses     int       `json:"totalDoses"`
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

func ValidMAC(message string, messageMAC, key []byte) bool {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(message))
	expectedMAC := mac.Sum(nil)
	hexMac := ([]byte)(hex.EncodeToString(expectedMAC))
	if log.IsLevelEnabled(log.InfoLevel) {
		log.Infof("Expected mac %s and got %s", base64.StdEncoding.EncodeToString(hexMac), base64.StdEncoding.EncodeToString(messageMAC))
	}
	return !hmac.Equal(messageMAC, hexMac)
}

func docRequest(w http.ResponseWriter, req *http.Request) {
	log.Info("Got document request ")
	requestBuffer, requestString, hmacSignByteArray, done := preProcessRequest(req, w)
	if done {
		return
	}

	if ValidMAC(requestString, hmacSignByteArray, []byte(config.Config.Digilocker.AuthHMACKey)) {
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
					if pdfBytes, err := getCertificateAsPdf(certBundle.signedJson); err != nil {
						log.Errorf("Error in creating certificate pdf %+v", err)
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
				w.Header().Set("Content-Type", "application/xml")
				w.WriteHeader(200)

				_, _ = w.Write(responseBytes)
				return
			}
			w.WriteHeader(500)
		}
	}
}

func uriRequest(w http.ResponseWriter, req *http.Request) {
	requestBuffer, requestString, hmacSignByteArray, done := preProcessRequest(req, w)
	if done {
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
		log.Errorf("Unauthorized access")
		w.WriteHeader(401)
		_, _ = w.Write([]byte("Unauthorized"))
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
		return nil, "", nil, true
	}
	return requestBuffer, requestString, hmacSignByteArray, false
}

type VaccinationCertificateBundle struct {
	certificateId string
	Uri           string
	signedJson    string
	pdf           []byte
}

func getCertificateByUri(uri string, dob string) *VaccinationCertificateBundle {
	slice := strings.Split(uri, "-")
	certificateId := slice[len(slice)-1]
	certificateFromRegistry, err := getCertificateFromRegistryByCertificateId(certificateId)
	return returnLatestCertificate(err, certificateFromRegistry, certificateId)
}

func getCertificate(preEnrollmentCode string, dob string) *VaccinationCertificateBundle {
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	return returnLatestCertificate(err, certificateFromRegistry, preEnrollmentCode)
}

func returnLatestCertificate(err error, certificateFromRegistry map[string]interface{}, referenceId string) *VaccinationCertificateBundle {
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		if len(certificateArr) > 0 {
			certificateObj := certificateArr[len(certificateArr)-1].(map[string]interface{})
			log.Infof("certificate resp %v", certificateObj)
			var cert VaccinationCertificateBundle
			cert.certificateId = certificateObj["certificateId"].(string)
			cert.Uri = "in.gov.covin-" + "VACER" + "-" + cert.certificateId
			cert.signedJson = certificateObj["certificate"].(string)
			return &cert
		} else {
			log.Errorf("No certificates found for req %v", referenceId)
		}
	}
	return nil
}

func showLabelsAsPerTemplate(certificate Certificate) []string {
	if (!isFinal(certificate)) {
		return []string{certificate.CredentialSubject.Name,
			certificate.CredentialSubject.Age,
			certificate.CredentialSubject.Gender,
			formatId(certificate.CredentialSubject.ID),
			certificate.CredentialSubject.RefId,
			formatRecipientAddress(certificate),
			certificate.Evidence[0].Vaccine,
			formatDate(certificate.Evidence[0].Date) + " (Batch no. " + certificate.Evidence[0].Batch + ")",
			"after 28 days",
			certificate.Evidence[0].Verifier.Name,
			formatFacilityAddress(certificate),
		}
	}
	return []string{certificate.CredentialSubject.Name,
		certificate.CredentialSubject.Age,
		certificate.CredentialSubject.Gender,
		formatId(certificate.CredentialSubject.ID),
		certificate.CredentialSubject.RefId,
		formatRecipientAddress(certificate),
		certificate.Evidence[0].Vaccine,
		formatDate(certificate.Evidence[0].Date) + " (Batch no. " + certificate.Evidence[0].Batch + ")",
		certificate.Evidence[0].Verifier.Name,
		formatFacilityAddress(certificate),
	}
}

func isFinal(certificate Certificate) bool {
	return certificate.Evidence[0].Dose == certificate.Evidence[0].TotalDoses
}

func checkIdType(identity string, aadhaarPDF string, otherPDF string) string {
	if strings.Contains(identity, "aadhaar") {
		return aadhaarPDF
	}
	return otherPDF
}

func templateType(certificate Certificate) string {
	if isFinal(certificate) {
		return checkIdType(certificate.CredentialSubject.ID, "config/final-with-aadhaar.pdf", "config/final-with-other.pdf")
	}
	return checkIdType(certificate.CredentialSubject.ID, "config/provisional-with-aadhaar.pdf", "config/provisional-with-other.pdf")
}

func getCertificateAsPdf(certificateText string) ([]byte, error) {
	var certificate Certificate
	if err := json.Unmarshal([]byte(certificateText), &certificate); err != nil {
		log.Error("Unable to parse certificate string", err)
		return nil, err
	}

	pdf := gopdf.GoPdf{}
	//pdf.Start(gopdf.Config{PageSize: gopdf.Rect{W: 595.28, H: 841.89}}) //595.28, 841.89 = A4
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})
	pdf.AddPage()

	if err := pdf.AddTTFFont("wts11", "config/Roboto-Light.ttf"); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	/* if err := pdf.AddTTFFont("arapey", "./Arapey-Italic.ttf"); err != nil {
		log.Print(err.Error())
		return nil, err
	} */
	tpl1 := pdf.ImportPage(templateType(certificate), 1, "/MediaBox")
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

	offsetX := 58.0
	offsetY := 330.0
	offsetNewX := 300.0
	offsetNewY := 60.0
	rowSize := 6
	displayLabels := showLabelsAsPerTemplate(certificate)
	//offsetYs := []float64{0, 20.0, 40.0, 60.0}
	i := 0
	for i = 0; i < rowSize; i++ {
		pdf.SetX(offsetX)
		pdf.SetY(offsetY + float64(i)*45.0)
		pdf.Cell(nil, displayLabels[i])
	}
	pdf.SetX(offsetX)
	pdf.SetY(offsetY + float64(i)*40.0)
	pdf.Cell(nil, certificate.CredentialSubject.Address.AddressRegion)

	for i = rowSize; i < len(displayLabels); i++ {
		pdf.SetX(offsetNewX)
		pdf.SetY(offsetNewY + float64(i)*45.0)
		pdf.Cell(nil, displayLabels[i])
	}
	pdf.SetX(offsetNewX)
	pdf.SetY(offsetNewY + float64(i)*42)
	pdf.Cell(nil, certificate.Evidence[0].Facility.Address.AddressRegion)

	e := pasteQrCodeOnPage(certificateText, &pdf)
	if e != nil {
		log.Errorf("error in pasting qr code %v", e)
		return nil, e
	}

	//pdf.Image("qr.png", 200, 50, nil)
	//pdf.WritePdf("certificate.pdf")
	var b bytes.Buffer
	_ = pdf.Write(&b)
	return b.Bytes(), nil
}

func formatFacilityAddress(certificate Certificate) string {
	return concatenateReadableString(certificate.Evidence[0].Facility.Name,
		certificate.Evidence[0].Facility.Address.District)
}

func formatRecipientAddress(certificate Certificate) string {
	return concatenateReadableString(certificate.CredentialSubject.Address.StreetAddress,
		certificate.CredentialSubject.Address.District)
}

func concatenateReadableString(a string, b string) string {
	address := ""
	address = appendCommaIfNotEmpty(address, a)
	address = appendCommaIfNotEmpty(address, b)
	if len(address) > 0 {
		return address
	}
	return "NA"
}

func appendCommaIfNotEmpty(address string, suffix string) string {
	if len(strings.TrimSpace(address)) > 0 {
		if len(strings.TrimSpace(suffix)) > 0 {
			return address + ", " + suffix
		} else {
			return address
		}
	}
	return suffix
}

func formatDate(date time.Time) string {
	return date.Format("02 Jan 2006")
}

func formatId(identity string) string {
	split := strings.Split(identity, ":")
	lastFragment := split[len(split)-1]
	if strings.Contains(identity, "aadhaar") {
		return "Aadhaar # XXXX XXXX XXXX " + lastFragment[len(lastFragment)-4:]
	}
	if strings.Contains(identity, "Driving") {
		return "Driver’s License # " + lastFragment
	}
	if strings.Contains(identity, "MNREGA") {
		return "MNREGA Job Card # " + lastFragment
	}
	if strings.Contains(identity, "PAN") {
		return "PAN Card # " + lastFragment
	}
	if strings.Contains(identity, "Passbooks") {
		return "Passbook # " + lastFragment
	}
	if strings.Contains(identity, "Passport") {
		return "Passport # " + lastFragment
	}
	if strings.Contains(identity, "Pension") {
		return "Pension Document # " + lastFragment
	}
	if strings.Contains(identity, "Voter") {
		return "Voter ID # " + lastFragment
	}
	return lastFragment
}

func pasteQrCodeOnPage(certificateText string, pdf *gopdf.GoPdf) error {
	buf, err := compress(certificateText)
	if err != nil {
		log.Error("Error compressing certificate data", err)
		return err
	}
	qrCode, err := qrcode.New(buf.String(), qrcode.Medium)
	if err != nil {
		return err
	}

	imageBytes, err := qrCode.PNG(-3)
	holder, err := gopdf.ImageHolderByBytes(imageBytes)
	err = pdf.ImageByHolder(holder, 290, 30, nil)
	if err != nil {
		log.Errorf("Error while creating QR code")
	}
	return nil
}

func decompress(buf *bytes.Buffer, err error, ) {
	r, err := zip.NewReader(bytes.NewReader(buf.Bytes()), int64(buf.Len()))
	if err != nil {
		log.Error(err)
	}
	for _, f := range r.File {
		log.Infof("Contents of %s:\n", f.Name)
		rc, err := f.Open()
		if err != nil {
			log.Error(err)
		}
		_, err = io.CopyN(os.Stdout, rc, int64(buf.Len()))
		if err != nil {
			log.Fatal(err)
		}
		rc.Close()
	}
}

func compress(certificateText string) (*bytes.Buffer, error) {
	buf := new(bytes.Buffer)
	w := zip.NewWriter(buf)
	w.RegisterCompressor(zip.Deflate, func(out io.Writer) (io.WriteCloser, error) {
		return flate.NewWriter(out, flate.BestCompression)
	})
	f, err := w.Create("certificate.json")
	if err != nil {
		log.Error(err)
	}
	_, err = f.Write([]byte(certificateText))
	if err != nil {
		log.Error(err)
	}
	err = w.Close()
	if err != nil {
		log.Error(err)
	}
	return buf, err
}

func getPDFHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("GET PDF HANDLER REQUEST")
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificateObj := certificateArr[len(certificateArr)-1].(map[string]interface{})
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
		} else {
			log.Errorf("No certificates found for request %v", preEnrollmentCode)
			w.WriteHeader(404)
		}
	} else {
		log.Infof("Error %+v", err)
	}
}

func getCertificateFromRegistryByCertificateId(certificateId string) (map[string]interface{}, error) {
	filter := map[string]interface{}{
		CertificateId: map[string]interface{}{
			"eq": certificateId,
		},
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	return certificateFromRegistry, err
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
	log.Info("GET CERTIFICATE JSON REQUEST")
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
		log.Errorf("Get certificates json doesnt contain required fields %v", urlParams.Encode())
		w.WriteHeader(400)
		return
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificateObj := certificateArr[len(certificateArr)-1].(map[string]interface{})
			if responseBytes, err := json.Marshal(certificateObj); err != nil {
				log.Errorf("Error while serializing xml")
			} else {
				w.WriteHeader(200)
				_, _ = w.Write(responseBytes)
				return
			}
		}
	} else {
		log.Errorf("No certificates found for request %v", filter)
	}
}

func getCertificates(w http.ResponseWriter, request *http.Request) {
	log.Info("GET CERTIFICATES JSON ")
	var requestBody map[string]interface{}
	err := json.NewDecoder(request.Body).Decode(&requestBody)
	mobile, found := requestBody[Mobile]
	filter := map[string]interface{}{}
	if found {
		filter[Mobile] = map[string]interface{}{
			"eq": mobile,
		}
	}
	beneficiaryId, found := requestBody[BeneficiaryId]
	if found {
		filter[PreEnrollmentCode] = map[string]interface{}{
			"eq": beneficiaryId,
		}
	}
	if mobile == nil && beneficiaryId == nil {
		log.Errorf("get certificates requested with no parameters, %v", requestBody)
		w.WriteHeader(400)
		return
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificates := map[string]interface{}{
				"certificates": certificateArr,
			}
			if responseBytes, err := json.Marshal(certificates); err != nil {
				log.Errorf("Error while serializing xml")
			} else {
				w.WriteHeader(200)
				_, _ = w.Write(responseBytes)
				w.Header().Set("Content-Type", "application/json")
				return
			}
		}
	} else {
		log.Errorf("No certificates found for request %v", filter)
		w.WriteHeader(500)
	}
}

func getCertificatePDFHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("GET PDF HANDLER REQUEST")
	var requestBody map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	mobile, found := requestBody[Mobile]
	filter := map[string]interface{}{}
	if found {
		filter[Mobile] = map[string]interface{}{
			"eq": mobile,
		}
	}
	beneficiaryId, found := requestBody[BeneficiaryId]
	if found {
		filter[PreEnrollmentCode] = map[string]interface{}{
			"eq": beneficiaryId,
		}
	}
	if mobile == nil && beneficiaryId == nil {
		log.Errorf("get certificates requested with no parameters, %v", requestBody)
		w.WriteHeader(400)
		return
	}
	certificateFromRegistry, err := services.QueryRegistry(CertificateEntity, filter)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificateObj := certificateArr[len(certificateArr)-1].(map[string]interface{})
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
		} else {
			log.Errorf("No certificates found for request %v", filter)
			w.WriteHeader(404)
		}
	} else {
		log.Infof("Error %+v", err)
	}
}

func authorize(next http.HandlerFunc, roles []string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claimBody := auth.ExtractClaimBodyFromHeader(r)
		if claimBody != nil {
			isAuthorized := auth.AuthorizeRole(roles, claimBody)
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
	//integration
	r.HandleFunc("/cert/api/pullUriRequest", uriRequest).Methods("POST")
	r.HandleFunc("/cert/api/pullDocRequest", docRequest).Methods("POST")
	//internal
	r.HandleFunc("/cert/api/certificatePDF/{preEnrollmentCode}", authorize(getPDFHandler, []string{ApiRole})).Methods("GET")
	r.HandleFunc("/certificatePDF/{preEnrollmentCode}", authorize(getPDFHandler, []string{ApiRole})).Methods("GET")
	//external
	r.HandleFunc("/cert/external/api/certificates", authorize(getCertificates, []string{ArogyaSetuRole})).Methods("POST")
	r.HandleFunc("/cert/external/pdf/certificate", authorize(getCertificatePDFHandler, []string{ArogyaSetuRole})).Methods("POST")

	http.Handle("/", r)
	_ = http.ListenAndServe(":8003", nil)
}
