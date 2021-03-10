package main

import (
	"archive/zip"
	"bytes"
	"compress/flate"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/api/pkg/models"
	kafkaService "github.com/divoc/api/pkg/services"
	"github.com/divoc/kernel_library/services"
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/signintech/gopdf"
	log "github.com/sirupsen/logrus"
	"github.com/skip2/go-qrcode"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"io"
	"math"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const ApiRole = "api"
const ArogyaSetuRole = "arogyasetu"
const CertificateEntity = "VaccinationCertificate"
const PreEnrollmentCode = "preEnrollmentCode"
const Dose = "dose"
const CertificateId = "certificateId"
const Mobile = "mobile"
const BeneficiaryId = "beneficiaryId"

const DigilockerSuccessEvent = "digilocker-success"
const DigilockerFailedEvent = "digilocker-failed"

const EventTagSuccess = "-success"
const EventTagFailed = "-failed"
const EventTagError = "-error"
const EventTagExternal = "external"
const EventTagInternal = "internal"
const EventTagInternalHead = "internal-head"
const YYYYMMDD = "2006-01-02"

const DEFAULT_DUE_DATE_N_DAYS = 28

var (
	requestHistogram = promauto.NewHistogram(prometheus.HistogramOpts{
		Name: "divoc_http_request_duration_milliseconds",
		Help: "Request duration time in milliseconds",
	})
)

var statesEnabled = map[string]bool{
	"odisha": true,
	"nagaland": true,
	"bihar": true,
	"karnataka": true,
	"uttar pradesh": true,
	"chhattisgarh": true,
	"maharashtra": true,
	"madhya pradesh": true,
	"himachal pradesh": true,
	"uttarakhand": true,
	"jammu and kashmir": true,
	"goa": true,
	"gujarat": true,
	"rajasthan": true,
	"delhi": true,
	"telangana": true,
	"andhra pradesh": true,
	"jharkhand": true,
	"punjab": true,
	"tripura": true,
	"haryana": true,
	"sikkim": true,
	"mizoram": true,
	"chandigarh": true,
	"meghalaya": true,
	"arunachal pradesh": true,
	"dadra and nagar haveli": true,
	"manipur": true,
	"daman and diu": true,
	"ladakh": true,
	"andaman and nicobar islands": true,
	"lakshadweep": true,
	"himachal": true,
}

var ctx = context.Background()



func getVaccineValidDays(start string, end string) string {
	days := DEFAULT_DUE_DATE_N_DAYS
	startDate, err := time.Parse(YYYYMMDD, start)
	if err == nil {
		endDate, err := time.Parse(YYYYMMDD, end)
		if err == nil {
			validDays := int(math.Ceil(endDate.Sub(startDate).Hours() / 24))
			if validDays > 0 {
				days = validDays
			}
		}
	}
	return fmt.Sprintf("after %d days", days)
}

func showLabelsAsPerTemplate(certificate models.Certificate) []string {
	if (!isFinal(certificate)) {
		return []string{certificate.CredentialSubject.Name,
			certificate.CredentialSubject.Age,
			certificate.CredentialSubject.Gender,
			formatId(certificate.CredentialSubject.ID),
			certificate.CredentialSubject.RefId,
			formatRecipientAddress(certificate),
			certificate.Evidence[0].Vaccine,
			formatDate(certificate.Evidence[0].Date) + " (Batch no. " + certificate.Evidence[0].Batch + ")",
			getVaccineValidDays(certificate.Evidence[0].EffectiveStart, certificate.Evidence[0].EffectiveUntil),
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

func isFinal(certificate models.Certificate) bool {
	return certificate.Evidence[0].Dose == certificate.Evidence[0].TotalDoses
}

func checkIdType(identity string, aadhaarPDF string, otherPDF string) string {
	if strings.Contains(identity, "aadhaar") {
		return aadhaarPDF
	}
	return otherPDF
}

func templateType(certificate models.Certificate) string {
	variant := getCertificateVariant(certificate)
	var basePath string
	if isFinal(certificate) {
		basePath = checkIdType(certificate.CredentialSubject.ID, "config/final-with-aadhaar", "config/final-with-other")
	} else {
		basePath = checkIdType(certificate.CredentialSubject.ID, "config/provisional-with-aadhaar", "config/provisional-with-other")
	}

	return  fmt.Sprintf("%s%s.pdf", basePath, variant)
}

func getCertificateVariant(certificate models.Certificate) string {
	if len(certificate.Evidence) > 0 {
		stateName := strings.TrimSpace(strings.ToLower(certificate.Evidence[0].Facility.Address.AddressRegion))
		if _, found := statesEnabled[stateName]; found {
			return ""
		}
	}
	return "-plain"
}

func getCertificateAsPdf(certificateText string) ([]byte, error) {
	var certificate models.Certificate
	if err := json.Unmarshal([]byte(certificateText), &certificate); err != nil {
		log.Error("Unable to parse certificate string", err)
		return nil, err
	}

	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})
	pdf.AddPage()

	if err := pdf.AddTTFFont("wts11", "config/Roboto-Light.ttf"); err != nil {
		log.Print(err.Error())
		return nil, err
	}

	tpl1 := pdf.ImportPage(templateType(certificate), 1, "/MediaBox")
	// Draw pdf onto page
	pdf.UseImportedTemplate(tpl1, 0, 0, 580, 0)

	if err := pdf.SetFont("wts11", "", 10); err != nil {
		log.Print(err.Error())
		return nil, err
	}

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
		_ = pdf.Cell(nil, displayLabels[i])
	}
	pdf.SetX(offsetX)
	pdf.SetY(offsetY + float64(i)*40.0)
	_ = pdf.Cell(nil, certificate.CredentialSubject.Address.AddressRegion)

	for i = rowSize; i < len(displayLabels); i++ {
		pdf.SetX(offsetNewX)
		pdf.SetY(offsetNewY + float64(i)*45.0)
		_ = pdf.Cell(nil, displayLabels[i])
	}
	pdf.SetX(offsetNewX)
	pdf.SetY(offsetNewY + float64(i)*42)
	_ = pdf.Cell(nil, certificate.Evidence[0].Facility.Address.AddressRegion)

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

func formatFacilityAddress(certificate models.Certificate) string {
	return concatenateReadableString(certificate.Evidence[0].Facility.Name,
		certificate.Evidence[0].Facility.Address.District)
}

func formatRecipientAddress(certificate models.Certificate) string {
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

func maskId(id string) string {
	reg, _ := regexp.Compile(".")
	limit := int(math.Ceil(float64(len(id)) * .6))
	return reg.ReplaceAllString(id[:limit], "X") + id[limit:]
}

func formatId(identity string) string {
	split := strings.Split(identity, ":")
	lastFragment := split[len(split)-1]
	if strings.Contains(identity, "adhaar") {
		if len(lastFragment)>0 {
			return "Aadhaar  # " + maskId(lastFragment)
		} else {
			return "Aadhaar"
		}
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

func decompress(buf *bytes.Buffer, err error) {
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

func handleFetchPDFPostRequest(w http.ResponseWriter, r *http.Request) {
	getCertificatePDFHandler(w, r, EventTagInternal)
}

func headCertificateWithDoseHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	if dose, err := strconv.ParseInt(vars[Dose], 10, 64); err!=nil {
		w.WriteHeader(400);
	} else {
		exists, err := isCertificatePresent(preEnrollmentCode, dose)
		if err != nil {
			w.WriteHeader(500);
			return
		}
		if exists {
			w.WriteHeader(200);
		} else {
			w.WriteHeader(404);
		}
	}
}

func isCertificatePresent(preEnrollmentCode string, dose int64) (bool, error) {
	if certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode); err != nil {
		log.Errorf("Error in querying from registry %+v", err)
		return false, errors.New("Internal error (registry)")
	} else  {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		return isCertificatePresentInCertificatesForGivenDose(certificateArr, dose), nil
	}
}

func isCertificatePresentInCertificatesForGivenDose(certificateArr []interface{}, dose int64) bool {
	for _, cert := range certificateArr {
		if certificateMap, ok  := cert.(map[string]interface{}); ok {
			if doseValue, found := certificateMap["dose"]; found {
				if doseValueFloat, ok := doseValue.(float64); ok {
					if int64(doseValueFloat) == dose {
						return true
					}
				}
			} else { //get from certificate json.
				if certificateJson, found := certificateMap["certificate"]; found {
					var certificate models.Certificate
					if certificateString, ok := certificateJson.(string); ok {
						if err := json.Unmarshal([]byte(certificateString), &certificate); err == nil {
							if int64(certificate.Evidence[0].Dose) == dose {
								return true
							}
						} else {
							log.Errorf("Error in reading certificate json %+v", err)
						}
					}
				}
			}
		}
	}
	return false
}

func headPDFHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	signedJson, err := getSignedJson(preEnrollmentCode)
	if err != nil {
		log.Infof("Error %+v", err)
		w.WriteHeader(500)
		publishEvent(preEnrollmentCode, EventTagInternalHead+EventTagFailed, "Internal error")
		return
	}
	if signedJson != "" {
		w.WriteHeader(200);
	} else {
		w.WriteHeader(404);
	}
}

func getPDFHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("get pdf certificate")
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	signedJson, err := getSignedJson(preEnrollmentCode)

	if err != nil {
		log.Infof("Error %+v", err)
		w.WriteHeader(500)
		publishEvent(preEnrollmentCode, EventTagInternal+EventTagError, "Internal error")
		return
	}

	if signedJson != "" {
		if pdfBytes, err := getCertificateAsPdf(signedJson); err != nil {
			log.Errorf("Error in creating certificate pdf")
			w.WriteHeader(500)
			publishEvent(preEnrollmentCode, EventTagInternal+EventTagError, "Error in creating pdf")
		} else {
			w.WriteHeader(200)
			_, _ = w.Write(pdfBytes)
			publishEvent(preEnrollmentCode, EventTagInternal+EventTagSuccess, "Certificate found")
		}
	} else {
		log.Errorf("No certificates found for request %v", preEnrollmentCode)
		w.WriteHeader(404)
		publishEvent(preEnrollmentCode, EventTagInternal+EventTagFailed, "Certificate not found")
	}
}

var redisClient *redis.Client

func initRedis(){
	options, err := redis.ParseURL(config.Config.Redis.Url)
	if err != nil {
		panic(err)
	}
	redisClient = redis.NewClient(options)
}

func getSignedJson(preEnrollmentCode string) (string, error) {
	if cachedCertificate, err := redisClient.Get(ctx, preEnrollmentCode+"-cert").Result(); err != nil {
		log.Infof("Error while looking up cache %+v", err)
	} else {
		if cachedCertificate != "" {
			log.Infof("Got certificate from cache %s", preEnrollmentCode)
			return cachedCertificate, nil
		}
	}
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = sortCertificatesByCreateAt(certificateArr)
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificateObj := certificateArr[len(certificateArr)-1].(map[string]interface{})
			log.Infof("certificate resp %v", certificateObj)
			signedJson := certificateObj["certificate"].(string)
			return signedJson, nil
		} else {
			return "", nil
		}
	} else {
		log.Errorf("Error in accessing registery %+v", err)
		return "", errors.New("Internal error")
	}
}

func publishEvent(preEnrollmentCode string, typeOfEvent string, info string) {
	go kafkaService.PublishEvent(models.Event{
		Date:          time.Now(),
		Source:        preEnrollmentCode,
		TypeOfMessage: typeOfEvent,
		ExtraInfo:     info,
	})
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

func timed(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()
		next.ServeHTTP(w, r)
		requestHistogram.Observe(float64(time.Since(startTime).Milliseconds()))
	}
}
func authorize(next http.HandlerFunc, roles []string, eventTag string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claimBody := auth.ExtractClaimBodyFromHeader(r)
		if claimBody != nil {
			isAuthorized := auth.AuthorizeRole(roles, claimBody)
			if isAuthorized {
				next.ServeHTTP(w, r)
				return
			}
		}
		publishEvent("", eventTag + EventTagFailed, "Unauthorized access")
		http.Error(w, "Forbidden", http.StatusForbidden)
	}
}

var addr = flag.String("listen-address", ":8003", "The address to listen on for HTTP requests.")

func main() {
	config.Initialize()
	initializeKafka()
	initRedis()
	log.Infof("redisClient %+v", redisClient)
	log.Info("Running digilocker support api")
	r := mux.NewRouter()
	r.Handle("/metrics", promhttp.Handler())
	//integration
	r.HandleFunc("/cert/api/pullUriRequest", timed(uriRequest)).Methods("POST")
	r.HandleFunc("/cert/api/pullDocRequest", timed(docRequest)).Methods("POST")
	//internal
	r.HandleFunc("/cert/api/certificatePDF/{preEnrollmentCode}", timed(authorize(getPDFHandler, []string{ApiRole}, EventTagInternal))).Methods("GET")
	r.HandleFunc("/cert/api/certificate/{preEnrollmentCode}", timed(authorize(headPDFHandler, []string{ApiRole}, EventTagInternal))).Methods("HEAD")
	r.HandleFunc("/cert/api/certificate/{preEnrollmentCode}/{dose}", timed(authorize(headCertificateWithDoseHandler, []string{ApiRole}, EventTagInternal))).Methods("HEAD")
	r.HandleFunc("/cert/pdf/certificate", timed(authorize(handleFetchPDFPostRequest, []string{ApiRole}, EventTagInternal))).Methods("POST")

	r.HandleFunc("/certificatePDF/{preEnrollmentCode}", timed(authorize(getPDFHandler, []string{ApiRole}, EventTagInternal))).Methods("GET")
	//external
	r.HandleFunc("/cert/external/api/certificates", timed(authorize(getCertificates, []string{ArogyaSetuRole}, EventTagExternal))).Methods("POST")
	r.HandleFunc("/cert/external/pdf/certificate", timed(authorize(getCertificatePDFExternalApiHandler, []string{ArogyaSetuRole}, EventTagExternal))).Methods("POST")

	http.Handle("/", r)
	_ = http.ListenAndServe(*addr, nil)
}

func initializeKafka() {
	servers := config.Config.Kafka.BootstrapServers
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": servers})
	if err != nil {
		panic(err)
	}
	kafkaService.StartEventProducer(producer)
	kafkaService.LogProducerEvents(producer)
}
