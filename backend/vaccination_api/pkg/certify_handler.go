package pkg

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/divoc/api/config"
	eventsModel "github.com/divoc/api/pkg/models"
	"github.com/divoc/api/pkg/services"

	"github.com/divoc/api/pkg/db"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/go-openapi/strfmt"
	log "github.com/sirupsen/logrus"
)

// uploadId, rowId to be specified in case if its file upload

func publishSimpleEvent(source string, event string) {
	services.PublishEvent(eventsModel.Event{
		Date:          time.Now(),
		Source:        source,
		TypeOfMessage: "download",
	})
}

func createCertificate(data *Scanner, uploadDetails *db.CertifyUploads) error {

	dateAdr := func(d strfmt.Date) *strfmt.Date { return &d }
	dateTimeAdr := func(dt strfmt.DateTime) *strfmt.DateTime { return &dt }

	uploadDetails.TotalRecords = uploadDetails.TotalRecords + 1

	// convert to certificate csv fields
	certifyData := convertToCertifyUploadFields(data)

	var certifyUploadErrors db.CertifyUploadErrors
	certifyUploadErrors.CertifyUploadID = uploadDetails.ID
	certifyUploadErrors.CertifyUploadFields = *certifyData
	certifyUploadErrors.Status = db.CERTIFY_UPLOAD_PROCESSING_STATUS
	db.CreateCertifyUploadError(&certifyUploadErrors)
	// validating data errors
	if err := validateBulkCertifyCSVRowData(data); err != nil {
		log.Info("validationErrors : ", err.Error())
		certifyUploadErrors.Errors = err.Error()
		certifyUploadErrors.Status = db.CERTIFY_UPLOAD_FAILED_STATUS
		return db.UpdateCertifyUploadError(&certifyUploadErrors)
	}

	contact := []string{"tel:" + certifyData.RecipientMobileNumber}
	dob, terr := time.Parse("2006-01-02", certifyData.RecipientDOB)
	if terr != nil {
		dob2, terr := time.Parse("02-Jan-2006", certifyData.RecipientDOB)
		if terr != nil {
			log.Info("error while parsing DOB ", certifyData.RecipientDOB)
		} else {
			dob = dob2
		}
	}

	recipientAge := certifyData.RecipientAge
	if recipientAge == "" {
		recipientAge = calcAge(strfmt.Date(dob))
		log.Info("calculated Age : ", recipientAge)
	}

	recipient := &models.CertificationRequestRecipient{
		Name: &certifyData.RecipientName,
		Age:  recipientAge,
		Address: &models.CertificationRequestRecipientAddress{
			AddressLine1: &certifyData.RecipientAddressLine1,
			AddressLine2: certifyData.RecipientAddressLine2,
			District:     &certifyData.RecipientDistrict,
			Pincode:      &certifyData.RecipientPincode,
			State:        &certifyData.RecipientState,
		},
		Contact:     contact,
		Dob:         dateAdr(strfmt.Date(dob)),
		Gender:      &certifyData.RecipientGender,
		Nationality: &certifyData.RecipientNationality,
		Identity:    &certifyData.RecipientIdentity,
	}

	vaccinationDate, terr := time.Parse(time.RFC3339, certifyData.VaccinationDate)
	if terr != nil {
		log.Info("error while parsing vaccinationDate ", certifyData.VaccinationDate)
	}
	effectiveStart, terr := time.Parse("2006-01-02", certifyData.VaccinationEffectiveStart)
	if terr != nil {
		log.Info("error while parsing effectiveStart ", certifyData.VaccinationEffectiveStart)
	}
	effectiveUntil, terr := time.Parse("2006-01-02", certifyData.VaccinationEffectiveEnd)
	if terr != nil {
		log.Info("error while parsing effectiveUntil ", certifyData.VaccinationEffectiveEnd)
	}
	dose, terr := strconv.ParseFloat(certifyData.VaccinationDose, 64)
	if terr != nil {
		log.Info("error while parsing dose ", certifyData.VaccinationDose)
	}
	totalDoses, terr := strconv.ParseFloat(certifyData.VaccinationTotalDoses, 64)
	if terr != nil {
		log.Info("error while parsing totalDoses ", certifyData.VaccinationTotalDoses)
	}
	vaccination := &models.CertificationRequestVaccination{
		Batch:          certifyData.VaccinationBatch,
		Date:           dateTimeAdr(strfmt.DateTime(vaccinationDate)),
		EffectiveStart: dateAdr(strfmt.Date(effectiveStart)),
		EffectiveUntil: dateAdr(strfmt.Date(effectiveUntil)),
		Manufacturer:   &certifyData.VaccinationManufacturer,
		Name:           &certifyData.VaccinationName,
		Dose:           &dose,
		TotalDoses:     &totalDoses,
	}

	vaccinator := &models.CertificationRequestVaccinator{
		Name: &certifyData.VaccinatorName,
	}

	facility := &models.CertificationRequestFacility{
		Name: &certifyData.FacilityName,
		Address: &models.CertificationRequestFacilityAddress{
			AddressLine1: &certifyData.FacilityAddressLine1,
			AddressLine2: certifyData.FacilityAddressLine2,
			District:     &certifyData.FacilityDistrict,
			State:        &certifyData.FacilityState,
			Pincode:      &certifyData.FacilityPincode,
		},
	}

	certificate := models.CertificationRequest{
		PreEnrollmentCode: &certifyData.PreEnrollmentCode,
		Facility:    facility,
		Recipient:   recipient,
		Vaccination: vaccination,
		Vaccinator:  vaccinator,
	}
	if jsonRequestString, err := json.Marshal(certificate); err == nil {
		log.Infof("Certificate request %+v", string(jsonRequestString))
		uploadId, _ := json.Marshal(uploadDetails.ID)
		jrowId, _ := json.Marshal(certifyUploadErrors.ID)
		services.PublishCertifyMessage(jsonRequestString, uploadId, jrowId)
	} else {
		return err
	}
	return nil
}

func validateBulkCertifyCSVRowData(data *Scanner) error {
	requiredFields := strings.Split(config.Config.Certificate.Upload.RequiredFields, ",")
	return validateBulkCertifyCSV(
		"Fields",
		requiredFields,
		func(field string) bool { return data.Text(field) == ""},
	)
}

func convertToCertifyUploadFields(data *Scanner) *db.CertifyUploadFields {
	return &db.CertifyUploadFields{
		PreEnrollmentCode:         data.Text("preEnrollmentCode"),
		RecipientName:             data.Text("recipientName"),
		RecipientMobileNumber:     data.Text("recipientMobileNumber"),
		RecipientDOB:              data.Text("recipientDOB"),
		RecipientGender:           data.Text("recipientGender"),
		RecipientNationality:      data.Text("recipientNationality"),
		RecipientIdentity:         data.Text("recipientIdentity"),
		RecipientAge:              data.Text("recipientAge"),
		RecipientAddressLine1:     data.Text("recipientAddressLine1"),
		RecipientAddressLine2:     data.Text("recipientAddressLine2"),
		RecipientDistrict:         data.Text("recipientDistrict"),
		RecipientState:            data.Text("recipientState"),
		RecipientPincode:          data.Text("recipientPincode"),
		VaccinationBatch:          data.Text("vaccinationBatch"),
		VaccinationDate:           data.Text("vaccinationDate"),
		VaccinationDose:           data.Text("vaccinationDose"),
		VaccinationTotalDoses:     data.Text("vaccinationTotalDoses"),
		VaccinationEffectiveStart: data.Text("vaccinationEffectiveStart"),
		VaccinationEffectiveEnd:   data.Text("vaccinationEffectiveEnd"),
		VaccinationManufacturer:   data.Text("vaccinationManufacturer"),
		VaccinationName:           data.Text("vaccinationName"),
		VaccinatorName:            data.Text("vaccinatorName"),
		FacilityName:              data.Text("facilityName"),
		FacilityAddressLine1:      data.Text("facilityAddressLine1"),
		FacilityAddressLine2:      data.Text("facilityAddressLine2"),
		FacilityDistrict:          data.Text("facilityDistrict"),
		FacilityState:             data.Text("facilityState"),
		FacilityPincode:           data.Text("facilityPincode"),
	}
}

func validateBulkCertifyCSVHeaders(headers []string) error {
	requiredHeaders := strings.Split(config.Config.Certificate.Upload.Columns, ",")
	return validateBulkCertifyCSV(
		"Headers",
		requiredHeaders,
		func(field string) bool { return !contains(headers, field)},
	)
}

func validateBulkCertifyCSV(targetType string, required []string, isMissing func(field string) bool) error {
	var errMsgs []string
	missing := map[string]bool{}
	for _, f := range required {
		if isMissing(f) {
			missing[f] = true
		}
	}

	if missing["recipientAge"] && missing["recipientDOB"] {
		errMsgs = append(errMsgs, fmt.Sprintf("Both recipientAge and recipientDOB %s are missing[at least one required]", targetType))
	}
	delete(missing, "recipientAge")
	delete(missing, "recipientDOB")

	if len(missing) > 0 {
		var missedFields []string
		for k := range missing {
			missedFields = append(missedFields, k)
		}
		errMsgs = append(errMsgs, fmt.Sprintf("Missing %s : %s", targetType, strings.Join(missedFields, ",")))
	}
	if len(errMsgs) > 0 {
		return errors.New(strings.Join(errMsgs, "; "))
	}
	return nil
}
