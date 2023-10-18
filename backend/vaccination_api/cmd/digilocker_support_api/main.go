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
	"github.com/divoc/api/pkg"
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
	"sort"
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
const MaxDisplayCharacters = 50
const VaccinationContextV2 = "https://cowin.gov.in/credentials/vaccination/v2"

var vaccineProphylaxis = map[string]string{
	"covaxin":     "COVID-19 vaccine, inactivated virus",
	"covishield":  "COVID-19 vaccine, non-replicating viral vector",
	"sputnik":     "COVID-19 vaccine, non-replicating viral vector",
	"zycov":       "COVID-19 vaccine, DNA based",
	"covovax":     "COVID-19 vaccine, virus protein subunit",
	"corbevax":    "COVID-19 vaccine, virus protein subunit",
	"novavax":     "COVID-19 vaccine, virus protein subunit",
	"nuvaxovid":   "COVID-19 vaccine, virus protein subunit",
	"spikevax":    "COVID-19 vaccine, mRNA based",
	"spike vax":   "COVID-19 vaccine, mRNA based",
	"moderna":     "COVID-19 vaccine, mRNA based",
	"modema":      "COVID-19 vaccine, mRNA based",
	"comirnaty":   "COVID-19 vaccine, mRNA based",
	"pfizer":      "COVID-19 vaccine, mRNA based",
	"biontech":    "COVID-19 vaccine, mRNA based",
	"convidecia":  "COVID-19 vaccine, non-replicating viral vector",
	"janssen":     "COVID-19 vaccine, replicating viral vector",
	"vaxzevria":   "COVID-19 vaccine, non-replicating viral vector",
	"astrazeneca": "COVID-19 vaccine, non-replicating viral vector",
	"covilo":      "COVID-19 vaccine, inactivated virus",
	"bbibp":       "COVID-19 vaccine, inactivated virus",
	"sinopharm":   "COVID-19 vaccine, inactivated virus",
	"coronavac":   "COVID-19 vaccine, inactivated virus",
	"sinovac":     "COVID-19 vaccine, inactivated virus",
	"gemcovac":    "COVID-19 vaccine, mRNA based",
	"incovacc":    "Covid 19 vaccine, non-replicating viral vector",
	"gemcovac®-om": "COVID-19 vaccine, mRNA based",
}

type DoseWiseData struct {
	dose         int
	doseDate     string
	batchNumber  string
	country      string
	name         string
	vaccineType  string
	manufacturer string
}

var (
	requestHistogram = promauto.NewHistogram(prometheus.HistogramOpts{
		Name: "divoc_http_request_duration_milliseconds",
		Help: "Request duration time in milliseconds",
	})
)

var stateLanguageMapping = map[string]string{
	"andaman and nicobar islands": "HIN",
	"andhra pradesh":              "TEL",
	"arunachal pradesh":           "HIN",
	"assam":                       "ASM",
	"bihar":                       "HIN",
	"chandigarh":                  "PUN",
	"chhattisgarh":                "HIN",
	"dadra and nagar haveli":      "GUJ",
	"daman and diu":               "GUJ",
	"delhi":                       "HIN",
	"goa":                         "KKN",
	"gujarat":                     "GUJ",
	"haryana":                     "HIN",
	"himachal pradesh":            "HIN",
	"jammu and kashmir":           "URD",
	"jharkhand":                   "HIN",
	"karnataka":                   "KND",
	"kerala":                      "MAL",
	"ladakh":                      "HIN",
	"lakshadweep":                 "MAL",
	"madhya pradesh":              "HIN",
	"maharashtra":                 "MAR",
	"manipur":                     "BNG",
	"meghalaya":                   "HIN",
	"mizoram":                     "HIN",
	"nagaland":                    "HIN",
	"odisha":                      "ORY",
	"puducherry":                  "TAM",
	"punjab":                      "PUN",
	"rajasthan":                   "HIN",
	"sikkim":                      "NEP",
	"tamil nadu":                  "TAM",
	"telangana":                   "TEL",
	"tripura":                     "BNG",
	"uttar pradesh":               "HIN",
	"uttarakhand":                 "HIN",
	"west bengal":                 "BNG",
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
	if !isFinal(certificate) {
		return []string{certificate.CredentialSubject.Name,
			certificate.CredentialSubject.Age,
			certificate.CredentialSubject.Gender,
			formatId(certificate.CredentialSubject.ID),
			certificate.CredentialSubject.RefId,
			formatRecipientAddress(certificate),
			certificate.Evidence[0].Vaccine,
			formatDateWithBatchNumber(certificate.Evidence[0].Date, certificate.Evidence[0].Batch),
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
		formatDateWithBatchNumber(certificate.Evidence[0].Date, certificate.Evidence[0].Batch),
		certificate.Evidence[0].Verifier.Name,
		formatFacilityAddress(certificate),
	}
}
func showLabelsAsPerTemplateV2(certificate models.Certificate, provisionalDoseDate string) []string {
	if !isFinal(certificate) {
		return []string{certificate.CredentialSubject.Name,
			certificate.CredentialSubject.Age,
			certificate.CredentialSubject.Gender,
			formatId(certificate.CredentialSubject.ID),
			certificate.CredentialSubject.Uhid,
			certificate.CredentialSubject.RefId,
			strings.ToUpper(certificate.Evidence[0].Vaccine),
			formatDateWithBatchNumber(certificate.Evidence[0].Date, certificate.Evidence[0].Batch),
			certificate.GetNextDueDateInfo(),
			certificate.Evidence[0].Verifier.Name,
			concatenateReadableString(concatenateReadableString(certificate.Evidence[0].Facility.Name,
				certificate.Evidence[0].Facility.Address.District),
				certificate.Evidence[0].Facility.Address.AddressRegion),
		}
	}

	return []string{certificate.CredentialSubject.Name,
		certificate.CredentialSubject.Age,
		certificate.CredentialSubject.Gender,
		formatId(certificate.CredentialSubject.ID),
		certificate.CredentialSubject.Uhid,
		certificate.CredentialSubject.RefId,
		strings.ToUpper(certificate.Evidence[0].Vaccine),
		provisionalDoseDate,
		formatDateWithBatchNumber(certificate.Evidence[0].Date, certificate.Evidence[0].Batch),
		certificate.Evidence[0].Verifier.Name,
		concatenateReadableString(concatenateReadableString(certificate.Evidence[0].Facility.Name,
			certificate.Evidence[0].Facility.Address.District),
			certificate.Evidence[0].Facility.Address.AddressRegion),
	}
}

func formatDateWithBatchNumber(date time.Time, batch string) string {
	if len(batch) != 0 {
		return formatDate(date) + " (Batch no. " + batch + ")"
	}
	return formatDate(date)
}

func isFinal(certificate models.Certificate) bool {
	return certificate.Evidence[0].Dose == toInteger(certificate.Evidence[0].TotalDoses, 2)
}

func toInteger(TotalDoses interface{}, defaultValue int) int {
	switch s := TotalDoses.(type) {
	case int:
		return s
	case float64:
		return int(s)
	case float32:
		return int(s)
	case string:
		v, err := strconv.ParseInt(s, 0, 0)
		if err == nil {
			return int(v)
		}
		return defaultValue
	case nil:
		return defaultValue
	default:
		return defaultValue
	}
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

	return fmt.Sprintf("%s%s.pdf", basePath, variant)
}

func getCertificateVariant(certificate models.Certificate) string {
	if certificate.IsVaccinatedStatePollingOne() {
		return "-plain"
	} else {
		return ""
	}
}

func sortDoseWiseData(data []DoseWiseData) []DoseWiseData {
	sort.Slice(data, func(i, j int) bool {
		return data[i].dose < data[j].dose
	})
	return data
}

func getProphylaxis(certificate models.Certificate) string {
	prophylaxis := certificate.Evidence[0].Prophylaxis
	if prophylaxis == "" {
		vaccine := strings.ToLower(certificate.Evidence[0].Vaccine)
		for vaccName, proph := range vaccineProphylaxis {
			if strings.Contains(vaccine, vaccName) {
				prophylaxis = proph
			}
		}
	}
	return prophylaxis
}

func getCertificateAsPdfV3(certificateByDoses map[int][]map[string]interface{}, language string) ([]byte, error) {
	var certificate models.Certificate
	latestCertificate := getLatestCertificate(certificateByDoses)
	var doseWiseData []DoseWiseData
	for dose, certificates := range certificateByDoses {
		latestDoseCertificate := certificates[len(certificates)-1]
		var certificate models.Certificate
		if err := json.Unmarshal([]byte(latestDoseCertificate["certificate"].(string)), &certificate); err != nil {
			log.Error("Unable to parse certificate string", err)
			return nil, err
		}
		doseWiseData = append(doseWiseData, DoseWiseData{
			dose:         dose,
			doseDate:     formatDate(certificate.Evidence[0].Date),
			batchNumber:  certificate.Evidence[0].Batch,
			name:         certificate.Evidence[0].Vaccine,
			vaccineType:  getProphylaxis(certificate),
			manufacturer: certificate.Evidence[0].Manufacturer,
		})
		doseWiseData = sortDoseWiseData(doseWiseData)
	}
	latestCertificateText := latestCertificate["certificate"].(string)
	if err := json.Unmarshal([]byte(latestCertificateText), &certificate); err != nil {
		log.Error("Unable to parse certificate string", err)
		return nil, err
	}
	latestDose := certificate.Evidence[0].Dose
	totalDoses := toInteger(certificate.Evidence[0].TotalDoses, 2)
	if len(language) == 0 {
		language = stateLanguageMapping[certificate.GetStateNameInLowerCaseLetter()]
	}
	if len(language) == 0 {
		language = "ENG"
	}
	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})
	pdf.AddPage()

	if err := pdf.AddTTFFont("Proxima-Nova-Bold", "config/FontsFree-Net-proxima_nova_bold-webfont.ttf"); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	tpl1 := pdf.ImportPage(certificate.GetTemplateName(latestDose, totalDoses, strings.ToUpper(language)), 1, "/MediaBox")
	// Draw pdf onto page
	pdf.UseImportedTemplate(tpl1, 0, 0, 600, 0)

	if err := pdf.SetFont("Proxima-Nova-Bold", "", 8); err != nil {
		log.Print(err.Error())
		return nil, err
	}

	// header certificateId
	pdf.SetX(300.0)
	pdf.SetY(156.0)
	dText := certificate.Evidence[0].CertificateId
	_ = pdf.Cell(nil, dText)

	offsetX := 290.0
	offsetY := 203.0
	offsetNewX := 290.0
	offsetNewY := 367.0
	rowSize := 7

	displayLabels := []string{
		certificate.CredentialSubject.Name,
		certificate.CredentialSubject.Age,
		certificate.CredentialSubject.Gender,
		formatId(certificate.CredentialSubject.ID),
		certificate.CredentialSubject.Uhid,
		certificate.CredentialSubject.RefId,
	}
	if latestDose > totalDoses {
		displayLabels = append(displayLabels, "Fully Vaccinated ("+pkg.ToString(certificate.Evidence[0].TotalDoses)+" Doses) and a Precaution Dose")
	} else if isFinal(certificate) {
		displayLabels = append(displayLabels, "Fully Vaccinated ("+pkg.ToString(certificate.Evidence[0].TotalDoses)+" Doses)")
	} else {
		dose := "Dose"
		if certificate.Evidence[0].Dose > 1 {
			dose = "Doses"
		}
		displayLabels = append(displayLabels, "Partially Vaccinated ("+pkg.ToString(certificate.Evidence[0].Dose)+" "+dose+")")
	}
	//offsetYs := []float64{0, 20.0, 40.0, 60.0}
	i := 0
	wrappedNames := splitNameIfLengthIsLonger(pdf, displayLabels)
	if len(wrappedNames) > 1 {
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 10); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		nameOffsetY := offsetY - float64(5*(len(wrappedNames)))
		for k := 0; k < len(wrappedNames); k++ {
			pdf.SetX(offsetX)
			pdf.SetY(nameOffsetY + float64(k)*14.7)
			_ = pdf.Cell(nil, wrappedNames[k])
		}
		i += 1
	}
	if err := pdf.SetFont("Proxima-Nova-Bold", "", 10); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	for ; i < rowSize-1; i++ {
		pdf.SetX(offsetX)
		pdf.SetY(offsetY + float64(i)*20)
		_ = pdf.Cell(nil, displayLabels[i])
	}
	wrappedVaccinationStatus := splitVaccinationStatusIfLengthIsLonger(pdf, displayLabels[i])
	if len(wrappedVaccinationStatus) > 1 {
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 10); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		statusOffsetY := offsetY + float64(i)*20 - float64(3*(len(wrappedVaccinationStatus)))
		for k := 0; k < len(wrappedVaccinationStatus); k++ {
			pdf.SetX(offsetX)
			pdf.SetY(statusOffsetY + float64(k)*10)
			_ = pdf.Cell(nil, wrappedVaccinationStatus[k])
		}
	} else {
		pdf.SetX(offsetX)
		pdf.SetY(offsetY + float64(i)*20)
		_ = pdf.Cell(nil, displayLabels[i])
	}
	pdf.SetX(offsetNewX)
	pdf.SetY(offsetNewY)
	_ = pdf.Cell(nil, certificate.Evidence[0].Verifier.Name)
	offsetNewY = offsetNewY + 20
	displayLabels = []string{
		concatenateReadableString(
			concatenateReadableString(
				certificate.Evidence[0].Facility.Name,
				certificate.Evidence[0].Facility.Address.District),
			certificate.Evidence[0].Facility.Address.AddressRegion),
	}
	displayLabels = splitAddressTextIfLengthIsLonger(pdf, displayLabels)
	if len(displayLabels) > 1 {
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 8); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		typeOffsetY := offsetNewY - float64(3*(len(displayLabels)))
		for k := 0; k < len(displayLabels); k++ {
			pdf.SetX(offsetNewX)
			pdf.SetY(typeOffsetY + float64(k)*9)
			_ = pdf.Cell(nil, displayLabels[k])
		}
	} else {
		pdf.SetX(offsetNewX)
		pdf.SetY(offsetNewY)
		_ = pdf.Cell(nil, displayLabels[0])
	}
	offsetNewY = offsetNewY + 20
	if latestDose < totalDoses {
		pdf.SetX(offsetX)
		pdf.SetY(offsetNewY)
		_ = pdf.Cell(nil, certificate.GetNextDueDateInfo())
	}
	offsetNewY = offsetNewY + 73
	tableOffsetX := 41.0
	if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	for _, data := range doseWiseData {
		offsetNewX = tableOffsetX
		pdf.SetX(offsetNewX)
		pdf.SetY(offsetNewY)
		if data.dose > totalDoses {
			_ = pdf.Cell(nil, "Precaution dose")
		} else {
			_ = pdf.Cell(nil, pkg.ToString(data.dose)+"/"+pkg.ToString(certificate.Evidence[0].TotalDoses))
		}
		offsetNewX = offsetNewX + 74
		pdf.SetX(offsetNewX)
		pdf.SetY(offsetNewY)
		_ = pdf.Cell(nil, data.doseDate)
		offsetNewX = offsetNewX + 77
		wrappedName := splitVaccInfoIfLengthIsLonger(pdf, data.name)
		if len(wrappedName) > 1 {
			if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
				log.Print(err.Error())
				return nil, err
			}
			typeOffsetY := offsetNewY - float64(3*(len(wrappedName)))
			for k := 0; k < len(wrappedName); k++ {
				pdf.SetX(offsetNewX)
				pdf.SetY(typeOffsetY + float64(k)*9)
				_ = pdf.Cell(nil, wrappedName[k])
			}
		} else {
			pdf.SetX(offsetNewX)
			pdf.SetY(offsetNewY)
			_ = pdf.Cell(nil, data.name)
		}
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		offsetNewX = offsetNewX + 86
		wrappedBatchNumber := splitVaccInfoIfLengthIsLonger(pdf, data.batchNumber)
		if len(wrappedBatchNumber) > 1 {
			if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
				log.Print(err.Error())
				return nil, err
			}
			typeOffsetY := offsetNewY - float64(3*(len(wrappedBatchNumber)))
			for k := 0; k < len(wrappedBatchNumber); k++ {
				pdf.SetX(offsetNewX)
				pdf.SetY(typeOffsetY + float64(k)*9)
				_ = pdf.Cell(nil, wrappedBatchNumber[k])
			}
		} else {
			pdf.SetX(offsetNewX)
			pdf.SetY(offsetNewY)
			_ = pdf.Cell(nil, data.batchNumber)
		}
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		offsetNewX = offsetNewX + 73
		wrappedVaccinationType := splitVaccinationTypeIfLengthIsLonger(pdf, data.vaccineType)
		if len(wrappedVaccinationType) > 1 {
			if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
				log.Print(err.Error())
				return nil, err
			}
			typeOffsetY := offsetNewY - float64(3*(len(wrappedVaccinationType)))
			for k := 0; k < len(wrappedVaccinationType); k++ {
				pdf.SetX(offsetNewX)
				pdf.SetY(typeOffsetY + float64(k)*9)
				_ = pdf.Cell(nil, wrappedVaccinationType[k])
			}
		} else {
			pdf.SetX(offsetNewX)
			pdf.SetY(offsetNewY)
			_ = pdf.Cell(nil, data.vaccineType)
		}
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		offsetNewX = offsetNewX + 109
		wrappedVaccManufacturer := splitVaccManufIfLengthIsLonger(pdf, data.manufacturer)
		if len(wrappedVaccManufacturer) > 1 {
			if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
				log.Print(err.Error())
				return nil, err
			}
			typeOffsetY := offsetNewY - float64(3*(len(wrappedVaccManufacturer)))
			for k := 0; k < len(wrappedVaccManufacturer); k++ {
				pdf.SetX(offsetNewX)
				pdf.SetY(typeOffsetY + float64(k)*9)
				_ = pdf.Cell(nil, wrappedVaccManufacturer[k])
			}
		} else {
			pdf.SetX(offsetNewX)
			pdf.SetY(offsetNewY)
			_ = pdf.Cell(nil, data.manufacturer)
		}
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		offsetNewY = offsetNewY + 28
		pdf.SetY(offsetNewY)
	}
	e := pasteQrCodeOnPage(latestCertificateText, &pdf, 352, 576)
	if e != nil {
		log.Errorf("error in pasting qr code %v", e)
		return nil, e
	}

	var b bytes.Buffer
	_ = pdf.Write(&b)
	return b.Bytes(), nil
}

func getDDCCCertificateAsPdfV3(certificateByDoses map[int][]map[string]interface{}) ([]byte, error) {
	var certificate models.Certificate
	latestCertificate := getLatestCertificate(certificateByDoses)
	var doseWiseData []DoseWiseData
	for dose, certificates := range certificateByDoses {
		latestDoseCertificate := certificates[len(certificates)-1]
		var certificate models.Certificate
		if err := json.Unmarshal([]byte(latestDoseCertificate["certificate"].(string)), &certificate); err != nil {
			log.Error("Unable to parse certificate string", err)
			return nil, err
		}
		country := certificate.Evidence[0].Facility.Address.AddressCountry
		if country == "IN" {
			country = "IND"
		}
		doseWiseData = append(doseWiseData, DoseWiseData{
			dose:         dose,
			doseDate:     formatDateYYYYMMDD(certificate.Evidence[0].Date),
			batchNumber:  certificate.Evidence[0].Batch,
			country:      country,
			name:         certificate.Evidence[0].Vaccine,
			vaccineType:  getProphylaxis(certificate),
			manufacturer: certificate.Evidence[0].Manufacturer,
		})
		doseWiseData = sortDoseWiseData(doseWiseData)
	}
	latestCertificateText := latestCertificate["certificate"].(string)
	if err := json.Unmarshal([]byte(latestCertificateText), &certificate); err != nil {
		log.Error("Unable to parse certificate string", err)
		return nil, err
	}

	latestDose := certificate.Evidence[0].Dose
	totalDoses := toInteger(certificate.Evidence[0].TotalDoses, 2)

	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})
	pdf.AddPage()

	if err := pdf.AddTTFFont("Proxima-Nova-Bold", "config/FontsFree-Net-proxima_nova_bold-webfont.ttf"); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	tpl1 := pdf.ImportPage("config/cov19-DDCC.pdf", 1, "/MediaBox")
	// Draw pdf onto page
	pdf.UseImportedTemplate(tpl1, 0, 0, 600, 0)

	if err := pdf.SetFont("Proxima-Nova-Bold", "", 9); err != nil {
		log.Print(err.Error())
		return nil, err
	}

	// header certificateId
	doffsetX := 300.0
	doffsetY := 156.0
	pdf.SetX(doffsetX)
	pdf.SetY(doffsetY)
	dText := latestCertificate["certificateId"].(string)
	_ = pdf.Cell(nil, dText)

	if err := pdf.SetFont("Proxima-Nova-Bold", "", 10); err != nil {
		log.Print(err.Error())
		return nil, err
	}

	offsetX := 290.0
	offsetY := 204.0
	offsetNewX := 290.0
	offsetNewY := 412.0
	rowSize := 6

	displayLabels := []string{
		certificate.CredentialSubject.Name,
		certificate.CredentialSubject.Dob,
		certificate.CredentialSubject.Gender,
		getPassportIdValue(certificate.CredentialSubject.ID),
	}
	if latestDose > totalDoses {
		displayLabels = append(displayLabels, "Fully Vaccinated ("+pkg.ToString(certificate.Evidence[0].TotalDoses)+" Doses) and a Precaution Dose")
	} else if latestDose == totalDoses {
		displayLabels = append(displayLabels, "Fully Vaccinated ("+pkg.ToString(certificate.Evidence[0].TotalDoses)+" Doses)")
	}
	displayLabels = append(displayLabels, certificate.CredentialSubject.RefId)
	//displayLabels = splitAddressTextIfLengthIsLonger(pdf, displayLabels)
	//offsetYs := []float64{0, 20.0, 40.0, 60.0}
	i := 0
	wrappedNames := splitNameIfLengthIsLonger(pdf, displayLabels)
	if len(wrappedNames) > 1 {
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 10); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		nameOffsetY := offsetY - float64(5*(len(wrappedNames)))
		for k := 0; k < len(wrappedNames); k++ {
			pdf.SetX(offsetX)
			pdf.SetY(nameOffsetY + float64(k)*14.7)
			_ = pdf.Cell(nil, wrappedNames[k])
		}
		i += 1
	}
	if err := pdf.SetFont("Proxima-Nova-Bold", "", 10); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	for ; i < rowSize-2; i++ {
		pdf.SetX(offsetX)
		pdf.SetY(offsetY + float64(i)*20)
		_ = pdf.Cell(nil, displayLabels[i])
	}
	wrappedVaccinationStatus := splitVaccinationStatusIfLengthIsLonger(pdf, displayLabels[i])
	if len(wrappedVaccinationStatus) > 1 {
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 10); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		statusOffsetY := offsetY + float64(i)*20 - float64(4*(len(wrappedVaccinationStatus)))
		for k := 0; k < len(wrappedVaccinationStatus); k++ {
			pdf.SetX(offsetX)
			pdf.SetY(statusOffsetY + float64(k)*10)
			_ = pdf.Cell(nil, wrappedVaccinationStatus[k])
		}
	} else {
		pdf.SetX(offsetX)
		pdf.SetY(offsetY + float64(i)*20)
		_ = pdf.Cell(nil, displayLabels[i])
	}
	i += 1
	pdf.SetX(offsetX)
	pdf.SetY(offsetY + float64(i)*20)
	_ = pdf.Cell(nil, displayLabels[i])
	tableOffsetX := 41.0
	if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	for _, data := range doseWiseData {
		offsetNewX = tableOffsetX
		pdf.SetX(offsetNewX)
		pdf.SetY(offsetNewY)
		if data.dose > totalDoses {
			_ = pdf.Cell(nil, "Precaution dose")
		} else {
			_ = pdf.Cell(nil, ordinalSuffixOf(data.dose))
		}
		offsetNewX = offsetNewX + 74
		pdf.SetX(offsetNewX)
		pdf.SetY(offsetNewY)
		_ = pdf.Cell(nil, data.doseDate)
		offsetNewX = offsetNewX + 77
		wrappedName := splitVaccInfoIfLengthIsLonger(pdf, data.name)
		if len(wrappedName) > 1 {
			if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
				log.Print(err.Error())
				return nil, err
			}
			typeOffsetY := offsetNewY - float64(3*(len(wrappedName)))
			for k := 0; k < len(wrappedName); k++ {
				pdf.SetX(offsetNewX)
				pdf.SetY(typeOffsetY + float64(k)*9)
				_ = pdf.Cell(nil, wrappedName[k])
			}
		} else {
			pdf.SetX(offsetNewX)
			pdf.SetY(offsetNewY)
			_ = pdf.Cell(nil, data.name)
		}
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		offsetNewX = offsetNewX + 86
		wrappedBatchNumber := splitVaccInfoIfLengthIsLonger(pdf, data.batchNumber)
		if len(wrappedBatchNumber) > 1 {
			if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
				log.Print(err.Error())
				return nil, err
			}
			typeOffsetY := offsetNewY - float64(3*(len(wrappedBatchNumber)))
			for k := 0; k < len(wrappedBatchNumber); k++ {
				pdf.SetX(offsetNewX)
				pdf.SetY(typeOffsetY + float64(k)*9)
				_ = pdf.Cell(nil, wrappedBatchNumber[k])
			}
		} else {
			pdf.SetX(offsetNewX)
			pdf.SetY(offsetNewY)
			_ = pdf.Cell(nil, data.batchNumber)
		}
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		offsetNewX = offsetNewX + 73
		wrappedVaccinationType := splitVaccinationTypeIfLengthIsLonger(pdf, data.vaccineType)
		if len(wrappedVaccinationType) > 1 {
			if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
				log.Print(err.Error())
				return nil, err
			}
			typeOffsetY := offsetNewY - float64(3*(len(wrappedVaccinationType)))
			for k := 0; k < len(wrappedVaccinationType); k++ {
				pdf.SetX(offsetNewX)
				pdf.SetY(typeOffsetY + float64(k)*9)
				_ = pdf.Cell(nil, wrappedVaccinationType[k])
			}
		} else {
			pdf.SetX(offsetNewX)
			pdf.SetY(offsetNewY)
			_ = pdf.Cell(nil, data.vaccineType)
		}
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		offsetNewX = offsetNewX + 109
		wrappedVaccManufacturer := splitVaccManufIfLengthIsLonger(pdf, data.manufacturer)
		if len(wrappedVaccManufacturer) > 1 {
			if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
				log.Print(err.Error())
				return nil, err
			}
			typeOffsetY := offsetNewY - float64(3*(len(wrappedVaccManufacturer)))
			for k := 0; k < len(wrappedVaccManufacturer); k++ {
				pdf.SetX(offsetNewX)
				pdf.SetY(typeOffsetY + float64(k)*9)
				_ = pdf.Cell(nil, wrappedVaccManufacturer[k])
			}
		} else {
			pdf.SetX(offsetNewX)
			pdf.SetY(offsetNewY)
			_ = pdf.Cell(nil, data.manufacturer)
		}
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 7); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		offsetNewY = offsetNewY + 30
		pdf.SetY(offsetNewY)
	}
	e := pasteQrCodeOnPage(latestCertificateText, &pdf, 352, 576)
	if e != nil {
		log.Errorf("error in pasting qr code %v", e)
		return nil, e
	}

	//pdf.Image("qr.png", 200, 50, nil)
	//pdf.WritePdf("new_certificate.pdf")
	var b bytes.Buffer
	_ = pdf.Write(&b)
	return b.Bytes(), nil
}

func getDataForDose(doseWiseData []DoseWiseData, dose int) (DoseWiseData, error) {
	for i := 0; i < len(doseWiseData); i++ {
		if dose == doseWiseData[i].dose {
			return doseWiseData[i], nil
		}
	}
	log.Errorf("Dose data doesn't exist %v", dose)
	return DoseWiseData{
		dose:        dose,
		doseDate:    "-",
		batchNumber: "-",
		country:     "-",
	}, errors.New("dose data doesn't exist")
}

func getCertificateAsPdfV2(latestCertificateText string, provisionalSignedJson string, language string) ([]byte, error) {
	var certificate models.Certificate
	if err := json.Unmarshal([]byte(latestCertificateText), &certificate); err != nil {
		log.Error("Unable to parse certificate string", err)
		return nil, err
	}
	if len(language) == 0 {
		language = stateLanguageMapping[certificate.GetStateNameInLowerCaseLetter()]
	}
	if len(language) == 0 {
		language = "ENG"
	}
	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})
	pdf.AddPage()

	if err := pdf.AddTTFFont("Proxima-Nova-Bold", "config/FontsFree-Net-proxima_nova_bold-webfont.ttf"); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	totalDoses := toInteger(certificate.Evidence[0].TotalDoses, 2)
	tpl1 := pdf.ImportPage(certificate.GetTemplateName(certificate.Evidence[0].Dose, totalDoses, strings.ToUpper(language)), 1, "/MediaBox")
	// Draw pdf onto page
	pdf.UseImportedTemplate(tpl1, 0, 0, 600, 0)

	if err := pdf.SetFont("Proxima-Nova-Bold", "", 12); err != nil {
		log.Print(err.Error())
		return nil, err
	}

	// header dose
	doffsetX := 300.0
	doffsetY := 159.0
	pdf.SetTextColor(41, 73, 121) // blue
	pdf.SetX(doffsetX)
	pdf.SetY(doffsetY)
	dText := formatDose(certificate.Evidence[0].Dose)
	_ = pdf.Cell(nil, dText)
	pdf.SetTextColor(0, 0, 0)

	offsetX := 310.0
	offsetY := 211.0
	offsetNewX := 310.0
	offsetNewY := 403.0
	rowSize := 6
	var provisionalCertificate *models.Certificate = nil
	provisionalDoseDate := ""
	if provisionalSignedJson != "" {
		if err := json.Unmarshal([]byte(provisionalSignedJson), &provisionalCertificate); err != nil {
			log.Error("Unable to parse certificate string", err)
			return nil, err
		} else {
			provisionalDoseDate = formatDateWithBatchNumber(provisionalCertificate.Evidence[0].Date, provisionalCertificate.Evidence[0].Batch)
		}
	}
	displayLabels := showLabelsAsPerTemplateV2(certificate, provisionalDoseDate)
	displayLabels = splitAddressTextIfLengthIsLonger(pdf, displayLabels)
	//offsetYs := []float64{0, 20.0, 40.0, 60.0}
	i := 0
	wrappedNames := splitNameIfLengthIsLonger(pdf, displayLabels)
	if len(wrappedNames) > 1 {
		if err := pdf.SetFont("Proxima-Nova-Bold", "", 10); err != nil {
			log.Print(err.Error())
			return nil, err
		}
		nameOffsetY := offsetY - float64(5*(len(wrappedNames)))
		for k := 0; k < len(wrappedNames); k++ {
			pdf.SetX(offsetX)
			pdf.SetY(nameOffsetY + float64(k)*14.7)
			_ = pdf.Cell(nil, wrappedNames[k])
		}
		i += 1
	}
	if err := pdf.SetFont("Proxima-Nova-Bold", "", 12); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	for ; i < rowSize; i++ {
		pdf.SetX(offsetX)
		pdf.SetY(offsetY + float64(i)*24.7)
		_ = pdf.Cell(nil, displayLabels[i])
	}
	j := 0
	for i = rowSize; i < len(displayLabels); i++ {
		pdf.SetX(offsetNewX)
		pdf.SetY(offsetNewY + float64(j)*27)
		_ = pdf.Cell(nil, displayLabels[i])
		j++
	}
	e := pasteQrCodeOnPage(latestCertificateText, &pdf, 352, 576)
	if e != nil {
		log.Errorf("error in pasting qr code %v", e)
		return nil, e
	}

	//pdf.Image("qr.png", 200, 50, nil)
	//pdf.WritePdf("new_certificate.pdf")
	var b bytes.Buffer
	_ = pdf.Write(&b)
	return b.Bytes(), nil
}

func wrapLongerText(text string, lineWidth int) []string {
	words := strings.Fields(strings.TrimSpace(text))
	if len(words) == 0 {
		return []string{text}
	}
	wrapped := []string{words[0]}
	spaceLeft := lineWidth - len(words[0])
	for _, word := range words[1:] {
		if len(word)+1 > spaceLeft {
			wrapped = append(wrapped, word)
			spaceLeft = lineWidth - len(word)
		} else {
			wrapped[len(wrapped)-1] += " " + word
			spaceLeft -= 1 + len(word)
		}
	}

	return wrapped

}

func splitAddressTextIfLengthIsLonger(pdf gopdf.GoPdf, displayLabels []string) []string {
	address := displayLabels[len(displayLabels)-1]
	wrap := wrapLongerText(address, MaxDisplayCharacters)
	displayLabels = displayLabels[:len(displayLabels)-1]
	displayLabels = append(displayLabels, wrap...)
	return displayLabels
}

func splitNameIfLengthIsLonger(pdf gopdf.GoPdf, displayLabels []string) []string {
	name := displayLabels[0]
	wrap := wrapLongerText(name, 45)
	return wrap
}

func splitVaccinationStatusIfLengthIsLonger(pdf gopdf.GoPdf, vaccinationStatus string) []string {
	wrap := wrapLongerText(vaccinationStatus, 50)
	return wrap
}

func splitVaccinationTypeIfLengthIsLonger(pdf gopdf.GoPdf, vaccinationType string) []string {
	wrap := wrapLongerText(vaccinationType, 28)
	return wrap
}

func splitVaccManufIfLengthIsLonger(pdf gopdf.GoPdf, vaccInfo string) []string {
	wrap := wrapLongerText(vaccInfo, 32)
	return wrap
}

func splitVaccInfoIfLengthIsLonger(pdf gopdf.GoPdf, vaccInfo string) []string {
	wrap := wrapLongerText(vaccInfo, 21)
	return wrap
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

	e := pasteQrCodeOnPage(certificateText, &pdf, 290, 30)
	if e != nil {
		log.Errorf("error in pasting qr code %v", e)
		return nil, e
	}

	//pdf.Image("qr.png", 200, 50, nil)
	pdf.WritePdf("certificate.pdf")
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
	loc, _ := time.LoadLocation(config.Config.Digilocker.LocalTimeZone)
	localDate := date.In(loc)
	return localDate.Format("02 Jan 2006")
}

func formatDateYYYYMMDD(date time.Time) string {
	loc, _ := time.LoadLocation(config.Config.Digilocker.LocalTimeZone)
	localDate := date.In(loc)
	return localDate.Format("2006-01-02")
}

func formatDose(dose int) string {
	return ordinalSuffixOf(dose) + " Dose"
}

func ordinalSuffixOf(i int) string {
	j := i % 10
	k := i % 100
	if j == 1 && k != 11 {
		return pkg.ToString(i) + "st"
	}
	if j == 2 && k != 12 {
		return pkg.ToString(i) + "nd"
	}
	if j == 3 && k != 13 {
		return pkg.ToString(i) + "rd"
	}
	return pkg.ToString(i) + "th"
}

func maskId(id string) string {
	reg, _ := regexp.Compile(".")
	limit := int(math.Ceil(float64(len(id)) * .6))
	return reg.ReplaceAllString(id[:limit], "X") + id[limit:]
}

func getPassportIdValue(identity string) string {
	split := strings.Split(identity, ":")
	lastFragment := split[len(split)-1]
	identityLowerCase := strings.ToLower(identity)
	if strings.Contains(identityLowerCase, "passport") {
		return lastFragment
	}
	return ""
}

func formatId(identity string) string {
	split := strings.Split(identity, ":")
	lastFragment := split[len(split)-1]
	identityLowerCase := strings.ToLower(identity)
	if strings.Contains(identityLowerCase, "adhaar") {
		if len(lastFragment) > 0 {
			return "Aadhaar # " + maskId(lastFragment)
		} else {
			return "Aadhaar"
		}
	}
	if strings.Contains(identityLowerCase, "driving") {
		return "Driver’s License # " + lastFragment
	}
	if strings.Contains(identityLowerCase, "mnrega") {
		return "MNREGA Job Card # " + lastFragment
	}
	if strings.Contains(identityLowerCase, "pan") {
		return "PAN Card # " + lastFragment
	}
	if strings.Contains(identityLowerCase, "passbooks") {
		return "Passbook # " + lastFragment
	}
	if strings.Contains(identityLowerCase, "passport") {
		return "Passport # " + lastFragment
	}
	if strings.Contains(identityLowerCase, "pension") {
		return "Pension Document # " + lastFragment
	}
	if strings.Contains(identityLowerCase, "voter") {
		return "Voter ID # " + lastFragment
	}
	if strings.Contains(strings.ToLower(identityLowerCase), "npr") {
		return "NPR Smart Card # " + lastFragment
	}
	if strings.Contains(strings.ToLower(identityLowerCase), "disability") {
		return "Unique Disability # " + lastFragment
	}
	if strings.Contains(strings.ToLower(identityLowerCase), "identity") {
		return "Service Identity Card # " + lastFragment
	}
	if strings.Contains(strings.ToLower(identityLowerCase), "ration") {
		return "Ration Card # " + lastFragment
	}
	if strings.Contains(strings.ToLower(identityLowerCase), "student") {
		return "Student Photo Id Card # " + lastFragment
	}
	return lastFragment
}

func pasteQrCodeOnPage(certificateText string, pdf *gopdf.GoPdf, offSetX float64, offSetY float64) error {
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
	err = pdf.ImageByHolder(holder, offSetX, offSetY, nil)
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

func getCertificateIdWithDoseHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("get certificate id ")
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	if dose, err := strconv.ParseInt(vars[Dose], 10, 64); err != nil {
		w.WriteHeader(400)
	} else {
		signedJson, _, err := getCertificateSignedJsonByDose(preEnrollmentCode, dose)

		if err != nil {
			log.Infof("Error %+v", err)
			w.WriteHeader(500)
			publishEvent(preEnrollmentCode, EventTagInternal+EventTagError, "Certificate id fetch internal error")
			return
		}

		if signedJson != "" {
			var certificate models.Certificate
			if err := json.Unmarshal([]byte(signedJson), &certificate); err != nil {
				log.Errorf("Error in converting json %+v", err)
				w.WriteHeader(500)
			} else {
				response := map[string]string{"certificateId": certificate.Evidence[0].CertificateId}
				writeResponse(w, 200, response)
			}

		} else {
			log.Errorf("No certificates found for request %v", preEnrollmentCode)
			w.WriteHeader(404)
			publishEvent(preEnrollmentCode, EventTagInternal+EventTagFailed, "Certificate not found")
		}
	}
}

func headCertificateWithDoseHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	if dose, err := strconv.ParseInt(vars[Dose], 10, 64); err != nil {
		w.WriteHeader(400)
	} else {
		exists, err := isCertificatePresent(preEnrollmentCode, dose)
		if err != nil {
			w.WriteHeader(500)
			return
		}
		if exists {
			w.WriteHeader(200)
		} else {
			w.WriteHeader(404)
		}
	}
}
func getCertificateSignedJsonByDose(preEnrollmentCode string, dose int64) (string, string, error) {
	//if cachedCertificate, err := redisClient.Get(ctx, preEnrollmentCode+"-cert").Result(); err != nil {
	//	log.Infof("Error while looking up cache %+v", err)
	//} else {
	//	if cachedCertificate != "" {
	//		log.Infof("Got certificate from cache %s", preEnrollmentCode)
	//		var certificate models.Certificate
	//		if err := json.Unmarshal([]byte(cachedCertificate), &certificate); err == nil {
	//			if int64(certificate.Evidence[0].Dose) == dose {
	//				return cachedCertificate, nil
	//			}
	//		}
	//	}
	//}
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = pkg.SortCertificatesByCreateAt(certificateArr)
		certificatesByDose := pkg.GetDoseWiseCertificates(certificateArr)
		var doseMatchingCertificates []map[string]interface{}
		if certificates, found := certificatesByDose[int(dose)]; found {
			doseMatchingCertificates = certificates
		}
		log.Infof("Certificate query return %d records", len(doseMatchingCertificates))
		if len(doseMatchingCertificates) > 0 {
			certificateObj := doseMatchingCertificates[len(doseMatchingCertificates)-1]
			log.Infof("certificate resp %v", certificateObj)
			signedJson := certificateObj["certificate"].(string)
			provisionalCertificate := getProvisionalCertificate(certificatesByDose)
			provisionalSignedJson := ""
			if provisionalCertificate != nil {
				provisionalSignedJson = provisionalCertificate["certificate"].(string)
			}
			return signedJson, provisionalSignedJson, nil
		} else {
			return "", "", nil
		}
	} else {
		log.Errorf("Error in accessing registery %+v", err)
		return "", "", errors.New("Internal error")
	}
}

func getCertificateByDoseHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("get pdf certificate")
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	if dose, err := strconv.ParseInt(vars[Dose], 10, 64); err != nil {
		w.WriteHeader(400)
	} else {
		certificatesByDoses, err := getCertificatesByDosesForDose(preEnrollmentCode, dose)

		if err != nil {
			log.Infof("Error %+v", err)
			w.WriteHeader(500)
			publishEvent(preEnrollmentCode, EventTagInternal+EventTagError, "Internal error")
			return
		}

		if certificatesByDoses != nil {
			if pdfBytes, err := getCertificateAsPdfV3(certificatesByDoses, getLanguageFromQueryParams(r)); err != nil {
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
}

func isCertificatePresent(preEnrollmentCode string, dose int64) (bool, error) {
	if certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode); err != nil {
		log.Errorf("Error in querying from registry %+v", err)
		return false, errors.New("Internal error (registry)")
	} else {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		return isCertificatePresentInCertificatesForGivenDose(certificateArr, dose), nil
	}
}

func isCertificatePresentInCertificatesForGivenDose(certificateArr []interface{}, dose int64) bool {
	for _, cert := range certificateArr {
		if isCertificateDosePresent(cert, dose) {
			return true
		}
	}
	return false
}

func isCertificateDosePresent(cert interface{}, dose int64) bool {
	if certificateMap, ok := cert.(map[string]interface{}); ok {
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
	return false
}

func headPDFHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	latestSignedJson, _, err := getSignedJson(preEnrollmentCode)
	if err != nil {
		log.Infof("Error %+v", err)
		w.WriteHeader(500)
		publishEvent(preEnrollmentCode, EventTagInternalHead+EventTagFailed, "Internal error")
		return
	}
	if latestSignedJson != "" {
		w.WriteHeader(200)
	} else {
		w.WriteHeader(404)
	}
}

func getPDFHandler(w http.ResponseWriter, r *http.Request) {
	if getCertificateTypeFromQueryParams(r) == "ddcc" {
		getDDCCPDFHandlerV3(w, r)
	} else {
		getPDFHandlerV3(w, r)
	}
}

func verifyIfLatestCertificateIsDDCCCompliant(certificateByDoses map[int][]map[string]interface{}) bool {
	latestCertificate := getLatestCertificate(certificateByDoses)
	var certificate models.Certificate
	if err := json.Unmarshal([]byte(latestCertificate["certificate"].(string)), &certificate); err != nil {
		log.Error("Unable to parse certificate string", err)
	} else {
		totalDoses := toInteger(certificate.Evidence[0].TotalDoses, 2)
		if certificate.Evidence[0].Dose >= totalDoses && certificate.Context[1] == VaccinationContextV2 {
			return true
		}
	}
	return false
}
func getDDCCPDFHandlerV3(w http.ResponseWriter, r *http.Request) {
	log.Info("get ddcc pdf certificate")
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	certificatesByDoses, err := getCertificatesByDoses(preEnrollmentCode)

	if err != nil {
		log.Infof("Error %+v", err)
		w.WriteHeader(500)
		publishEvent(preEnrollmentCode, EventTagInternal+EventTagError, "Internal error")
		return
	}

	if verifyIfLatestCertificateIsDDCCCompliant(certificatesByDoses) {
		if pdfBytes, err := getDDCCCertificateAsPdfV3(certificatesByDoses); err != nil {
			log.Errorf("Error in creating certificate pdf")
			w.WriteHeader(500)
			publishEvent(preEnrollmentCode, EventTagInternal+EventTagError, "Error in creating pdf")
		} else {
			w.WriteHeader(200)
			_, _ = w.Write(pdfBytes)
			publishEvent(preEnrollmentCode, EventTagInternal+EventTagSuccess, "Certificate found")
		}
	} else {
		log.Infof("Beneficiary not fully vaccinated")
		w.WriteHeader(400)
		return
	}

}

func getPDFHandlerV3(w http.ResponseWriter, r *http.Request) {
	log.Info("get pdf certificate")
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	certificatesByDoses, err := getCertificatesByDoses(preEnrollmentCode)

	if err != nil {
		log.Infof("Error %+v", err)
		w.WriteHeader(500)
		publishEvent(preEnrollmentCode, EventTagInternal+EventTagError, "Internal error")
		return
	}

	if certificatesByDoses != nil {
		if pdfBytes, err := getCertificateAsPdfV3(certificatesByDoses, getLanguageFromQueryParams(r)); err != nil {
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

func getPDFHandlerV2(w http.ResponseWriter, r *http.Request) {
	log.Info("get pdf certificate")
	vars := mux.Vars(r)
	preEnrollmentCode := vars[PreEnrollmentCode]
	latestSignedJson, provisionalSignedJson, err := getSignedJson(preEnrollmentCode)

	if err != nil {
		log.Infof("Error %+v", err)
		w.WriteHeader(500)
		publishEvent(preEnrollmentCode, EventTagInternal+EventTagError, "Internal error")
		return
	}

	if latestSignedJson != "" {
		if pdfBytes, err := getCertificateAsPdfV2(latestSignedJson, provisionalSignedJson, getLanguageFromQueryParams(r)); err != nil {
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

func postCertificateRevoked(w http.ResponseWriter, r *http.Request) {
	typeId := "RevokedCertificate"
	var rb interface{}
	err := json.NewDecoder(r.Body).Decode(&rb)
	requestBody, err := json.Marshal(rb)
	if err != nil {
		log.Errorf("JSON marshalling error %v", err)
		w.WriteHeader(400)
		return
	}

	var certificate models.Certificate
	err = json.Unmarshal(requestBody, &certificate)
	if err != nil {
		log.Errorf("Error while converting requestBody to Certificate object %v", err)
		w.WriteHeader(400)
		return
	}
	if len(certificate.Evidence) == 0 {
		log.Errorf("Error while getting Evidence array in requestBody %v", certificate)
		w.WriteHeader(400)
		return
	}

	preEnrollmentCode := certificate.CredentialSubject.RefId
	certificateId := certificate.Evidence[0].CertificateId
	dose := certificate.Evidence[0].Dose

	filter := map[string]interface{}{
		"previousCertificateId": map[string]interface{}{
			"eq": certificateId,
		},
		"dose": map[string]interface{}{
			"eq": dose,
		},
		"preEnrollmentCode": map[string]interface{}{
			"eq": preEnrollmentCode,
		},
	}
	if resp, err := services.QueryRegistry(typeId, filter); err == nil {
		if revokedCertificates, ok := resp[typeId].([]interface{}); ok {
			if len(revokedCertificates) > 0 {
				w.WriteHeader(200)
				return
			}
			w.WriteHeader(404)
			return
		}
	}
	w.WriteHeader(400)
	return
}

func getCertificateTypeFromQueryParams(r *http.Request) string {
	if language := r.URL.Query().Get("type"); language != "" {
		return language
	} else {
		return ""
	}
}

func getLanguageFromQueryParams(r *http.Request) string {
	if language := r.URL.Query().Get("language"); language != "" {
		return language
	} else {
		return ""
	}
}

var redisClient *redis.Client

func initRedis() {
	options, err := redis.ParseURL(config.Config.Redis.Url)
	if err != nil {
		panic(err)
	}
	redisClient = redis.NewClient(options)
}

func getCertificatesByDoses(preEnrollmentCode string) (map[int][]map[string]interface{}, error) {
	if cachedCertificate, err := redisClient.Get(ctx, preEnrollmentCode+"-cert").Result(); err != nil {
		log.Infof("Error while looking up cache %+v", err)
	} else {
		if cachedCertificate != "" {
			log.Infof("Got certificate from cache %s", preEnrollmentCode)
			var certificate models.Certificate
			if err := json.Unmarshal([]byte(cachedCertificate), &certificate); err != nil {
				log.Error("Unable to parse certificate string", err)
			} else {
				if certificate.Evidence[0].Dose == 1 && vaccinatedRecently(certificate.Evidence[0].Date, config.Config.Certificate.CacheRecentThreshold) {
					// converting cert string to certificatesByDoses
					result := map[string]interface{}{"certificate": cachedCertificate}
					return map[int][]map[string]interface{}{
						1: {result},
					}, nil
				}
			}
		}
	}
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = pkg.SortCertificatesByCreateAt(certificateArr)
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificatesByDose := pkg.GetDoseWiseCertificates(certificateArr)
			return certificatesByDose, nil
		}
	}
	return nil, err
}

func getCertificatesByDosesForDose(preEnrollmentCode string, dose int64) (map[int][]map[string]interface{}, error) {
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = pkg.SortCertificatesByCreateAt(certificateArr)
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificatesByDose := pkg.GetDoseWiseCertificates(certificateArr)

			if _, found := certificatesByDose[int(dose)]; !found {
				return nil, nil
			}

			for d := range certificatesByDose {
				if d > int(dose) {
					delete(certificatesByDose, d)
				}
			}
			return certificatesByDose, nil
		}
	}
	return nil, err
}

func getSignedJson(preEnrollmentCode string) (string, string, error) {
	if cachedCertificate, err := redisClient.Get(ctx, preEnrollmentCode+"-cert").Result(); err != nil {
		log.Infof("Error while looking up cache %+v", err)
	} else {
		if cachedCertificate != "" {
			log.Infof("Got certificate from cache %s", preEnrollmentCode)
			//return cachedCertificate, nil
			var certificate models.Certificate
			if err := json.Unmarshal([]byte(cachedCertificate), &certificate); err != nil {
				log.Error("Unable to parse certificate string", err)
			} else {
				if certificate.Evidence[0].Dose == 1 && vaccinatedRecently(certificate.Evidence[0].Date, config.Config.Certificate.CacheRecentThreshold) {
					latestSignedJson := cachedCertificate
					provisionalSignedJson := ""
					return latestSignedJson, provisionalSignedJson, nil
				}
			}
		}
	}
	certificateFromRegistry, err := getCertificateFromRegistry(preEnrollmentCode)
	if err == nil {
		certificateArr := certificateFromRegistry[CertificateEntity].([]interface{})
		certificateArr = pkg.SortCertificatesByCreateAt(certificateArr)
		log.Infof("Certificate query return %d records", len(certificateArr))
		if len(certificateArr) > 0 {
			certificatesByDose := pkg.GetDoseWiseCertificates(certificateArr)
			latestCertificate := getLatestCertificate(certificatesByDose)
			provisionalCertificate := getProvisionalCertificate(certificatesByDose)
			log.Infof("certificate resp %v", latestCertificate)
			latestSignedJson := latestCertificate["certificate"].(string)
			provisionalSignedJson := ""
			if provisionalCertificate != nil {
				provisionalSignedJson = provisionalCertificate["certificate"].(string)
			}
			return latestSignedJson, provisionalSignedJson, nil
		} else {
			return "", "", nil
		}
	} else {
		log.Errorf("Error in accessing registery %+v", err)
		return "", "", errors.New("Internal error")
	}
}

func vaccinatedRecently(vaccinationDate time.Time, recentThreshold int) bool {
	threshold := time.Now().AddDate(0, 0, -recentThreshold)
	return vaccinationDate.After(threshold)
}

func getProvisionalCertificate(certificatesByDose map[int][]map[string]interface{}) map[string]interface{} {
	if len(certificatesByDose) == 1 {
		return nil
	}
	minDose := 999
	for key, _ := range certificatesByDose {
		if key <= minDose {
			minDose = key
		}
	}
	return certificatesByDose[minDose][len(certificatesByDose[minDose])-1]
}

func getLatestCertificate(certificatesByDose map[int][]map[string]interface{}) map[string]interface{} {
	maxDose := 0
	for key, _ := range certificatesByDose {
		if key >= maxDose {
			maxDose = key
		}
	}
	return certificatesByDose[maxDose][len(certificatesByDose[maxDose])-1]
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
		publishEvent("", eventTag+EventTagFailed, "Unauthorized access")
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
	r.HandleFunc("/cert/api/v2/certificatePDF/{preEnrollmentCode}", timed(authorize(getPDFHandlerV3, []string{ApiRole}, EventTagInternal))).Methods("GET")
	r.HandleFunc("/cert/api/v3/ddcc/certificatePDF/{preEnrollmentCode}", timed(authorize(getDDCCPDFHandlerV3, []string{ApiRole}, EventTagInternal))).Methods("GET")
	r.HandleFunc("/cert/api/certificate/{preEnrollmentCode}", timed(authorize(headPDFHandler, []string{ApiRole}, EventTagInternal))).Methods("HEAD")
	r.HandleFunc("/cert/api/certificateId/{preEnrollmentCode}/{dose}", timed(authorize(getCertificateIdWithDoseHandler, []string{ApiRole}, EventTagInternal))).Methods("GET")
	r.HandleFunc("/cert/api/certificate/{preEnrollmentCode}/{dose}", timed(authorize(headCertificateWithDoseHandler, []string{ApiRole}, EventTagInternal))).Methods("HEAD")
	r.HandleFunc("/cert/api/certificatePDF/{preEnrollmentCode}/{dose}", timed(authorize(getCertificateByDoseHandler, []string{ApiRole}, EventTagInternal))).Methods("GET")
	r.HandleFunc("/cert/pdf/certificate", timed(authorize(handleFetchPDFPostRequest, []string{ApiRole}, EventTagInternal))).Methods("POST")

	r.HandleFunc("/cert/api/certificate/revoked", timed(postCertificateRevoked)).Methods("POST")

	r.HandleFunc("/certificatePDF/{preEnrollmentCode}", timed(authorize(getPDFHandler, []string{ApiRole}, EventTagInternal))).Methods("GET")
	//external
	r.HandleFunc("/cert/external/api/certificates", timed(authorize(getCertificates, []string{ArogyaSetuRole}, EventTagExternal))).Methods("POST")
	r.HandleFunc("/cert/external/pdf/certificate", timed(authorize(getCertificatePDFExternalApiHandler, []string{ArogyaSetuRole}, EventTagExternal))).Methods("POST")
	r.HandleFunc("/cert/external/kyc/{preEnrollmentCode}", timed(authorize(getCertificateKYCDetailsExternalApiHandler, []string{ApiRole}, EventTagExternal))).Methods("GET")

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
