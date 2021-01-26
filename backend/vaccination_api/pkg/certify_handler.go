package pkg

import (
	"encoding/json"
	"github.com/divoc/api/config"
	eventsModel "github.com/divoc/api/pkg/models"
	"github.com/divoc/api/pkg/services"
	"strconv"
	"strings"
	"time"
	"errors"

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
	errorMsgs := validateErrors(certifyData)
	if len(errorMsgs) > 0 {
		certifyUploadErrors.Errors = strings.Join(errorMsgs, ",")
		certifyUploadErrors.Status = db.CERTIFY_UPLOAD_FAILED_STATUS
		e := db.UpdateCertifyUploadError(&certifyUploadErrors)
		return e
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
	recipient := &models.CertificationRequestRecipient{
		Name: &certifyData.RecipientName,
		Age:  certifyData.RecipientAge,
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

func validateErrors(data *db.CertifyUploadFields) []string {
	var errorMsgs []string
	if data.RecipientMobileNumber == "" {
		errorMsgs = append(errorMsgs, "RecipientMobileNumber is missing")
	}
	if data.RecipientName == "" {
		errorMsgs = append(errorMsgs, "RecipientName is missing")
	}
	return errorMsgs
}

func convertToCertifyUploadFields(data *Scanner) *db.CertifyUploadFields {
	return &db.CertifyUploadFields{
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
		RecipientPincode:          data.int64("recipientPincode"),
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
		FacilityPincode:           data.int64("facilityPincode"),
	}
}

func validateBulkCertifyCSVHeaders(headers []string) error {
	columns := strings.Split(config.Config.Certificate.Upload.Columns, ",")
	missingHeaders := getDiff(columns, headers)

	var errMsgs []string
	if missingHeaders["recipientDOB"] && missingHeaders["recipientAge"] {
		errMsgs = append(errMsgs, "Alteast one of recipientDOB & recipientAge should be present")
	}
	missingHeaders["recipientDOB"] = false
	missingHeaders["recipientAge"] = false

	var missingHeaderList []string
	for k := range missingHeaders {
		if missingHeaders[k] {
			missingHeaderList = append(missingHeaderList, k)
		}
	}
	if len(missingHeaderList) > 0 {
		errMsgs = append(errMsgs, "Missing Headers : " + strings.Join(missingHeaderList, ","))
	}

	if len(errMsgs) == 0 {
		return nil
	} else {
		return errors.New(strings.Join(errMsgs, "; "))
	}
}
