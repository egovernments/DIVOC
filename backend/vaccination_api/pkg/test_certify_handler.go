package pkg

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/services"

	"github.com/divoc/api/pkg/db"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/go-openapi/strfmt"
	log "github.com/sirupsen/logrus"
)

// uploadId, rowId to be specified in case if its file upload
func createTestCertificate(data *Scanner, uploadDetails *db.TestCertifyUploads) error {

	dateAdr := func(d strfmt.Date) *strfmt.Date { return &d }
	dateTimeAdr := func(dt strfmt.DateTime) *strfmt.DateTime { return &dt }

	uploadDetails.TotalRecords = uploadDetails.TotalRecords + 1

	// convert to certificate csv fields
	certifyData := convertToTestCertifyUploadFields(data)

	var certifyUploadErrors db.TestCertifyUploadErrors
	certifyUploadErrors.CertifyUploadID = uploadDetails.ID
	certifyUploadErrors.TestCertifyUploadFields = *certifyData
	certifyUploadErrors.Status = db.CERTIFY_UPLOAD_PROCESSING_STATUS
	db.CreateTestCertifyUploadError(&certifyUploadErrors)
	// validating data errors
	if err := validateBulkTestCertifyCSVRowData(data); err != nil {
		log.Info("validationErrors : ", err.Error())
		certifyUploadErrors.Errors = err.Error()
		certifyUploadErrors.Status = db.CERTIFY_UPLOAD_FAILED_STATUS
		return db.UpdateTestCertifyUploadError(&certifyUploadErrors)
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

	recipient := &models.TestCertificationRequestRecipient{
		Name: &certifyData.RecipientName,
		Address: &models.TestCertificationRequestRecipientAddress{
			AddressLine1: &certifyData.RecipientAddressLine1,
			AddressLine2: certifyData.RecipientAddressLine2,
			District:     &certifyData.RecipientDistrict,
			Pincode:      certifyData.RecipientPincode,
			State:        &certifyData.RecipientState,
		},
		Contact:     contact,
		Dob:         dateAdr(strfmt.Date(dob)),
		Gender:      &certifyData.RecipientGender,
		Nationality: certifyData.RecipientNationality,
		Identity:    &certifyData.RecipientIdentity,
	}

	sampleCollectionTimestamp, terr := time.Parse(time.RFC3339, certifyData.SampleCollectionTimestamp)
	if terr != nil {
		log.Info("error while parsing sampleCollectionTimestamp ", certifyData.SampleCollectionTimestamp)
	}
	resultTimestamp, terr := time.Parse(time.RFC3339, certifyData.ResultTimestamp)
	if terr != nil {
		log.Info("error while parsing resultTimestamp ", certifyData.ResultTimestamp)
	}
	testDetails := &models.TestCertificationRequestTestDetails{
		Batch:                     certifyData.TestBatch,
		Disease:                   &certifyData.Disease,
		Manufacturer:              certifyData.Manufacturer,
		Result:                    &certifyData.Result,
		ResultTimestamp:           dateTimeAdr(strfmt.DateTime(resultTimestamp)),
		SampleCollectionTimestamp: dateTimeAdr(strfmt.DateTime(sampleCollectionTimestamp)),
		SampleOrigin:              certifyData.SampleOrigin,
		TestName:                  certifyData.TestName,
		TestType:                  &certifyData.TestType,
	}

	verifier := &models.TestCertificationRequestVerifier{
		Name: &certifyData.Verifier,
	}

	facility := &models.TestCertificationRequestFacility{
		Name: &certifyData.FacilityName,
		Address: &models.TestCertificationRequestFacilityAddress{
			AddressLine1: &certifyData.FacilityAddressLine1,
			AddressLine2: certifyData.FacilityAddressLine2,
			District:     &certifyData.FacilityDistrict,
			State:        &certifyData.FacilityState,
			Pincode:      certifyData.FacilityPincode,
		},
	}

	certificate := models.TestCertificationRequest{
		PreEnrollmentCode: &certifyData.PreEnrollmentCode,
		Facility:          facility,
		Recipient:         recipient,
		TestDetails:       testDetails,
		Verifier:          verifier,
	}
	if jsonRequestString, err := json.Marshal(certificate); err == nil {
		log.Infof("Certificate request %+v", string(jsonRequestString))
		uploadId, _ := json.Marshal(uploadDetails.ID)
		jrowId, _ := json.Marshal(certifyUploadErrors.ID)
		services.PublishTestCertifyMessage(jsonRequestString, uploadId, jrowId)
	} else {
		return err
	}
	return nil
}

func validateBulkTestCertifyCSVRowData(data *Scanner) error {
	requiredFields := strings.Split(config.Config.Testcertificate.Upload.RequiredFields, ",")
	return validateBulkTestCertifyCSV(
		"Fields",
		requiredFields,
		func(field string) bool { return data.Text(field) == ""},
	)
}

func convertToTestCertifyUploadFields(data *Scanner) *db.TestCertifyUploadFields {
	return &db.TestCertifyUploadFields{
		PreEnrollmentCode:         data.Text("preEnrollmentCode"),
		RecipientName:             data.Text("recipientName"),
		RecipientMobileNumber:     data.Text("recipientMobileNumber"),
		RecipientDOB:              data.Text("recipientDOB"),
		RecipientGender:           data.Text("recipientGender"),
		RecipientNationality:      data.Text("recipientNationality"),
		RecipientIdentity:         data.Text("recipientIdentity"),
		RecipientAddressLine1:     data.Text("recipientAddressLine1"),
		RecipientAddressLine2:     data.Text("recipientAddressLine2"),
		RecipientDistrict:         data.Text("recipientDistrict"),
		RecipientState:            data.Text("recipientState"),
		RecipientPincode:          data.Text("recipientPincode"),
		TestBatch:                 data.Text("testBatch"),
		Disease:                   data.Text("disease"),
		TestName:                  data.Text("testName"),
		TestType:                  data.Text("testType"),
		Result:                    data.Text("result"),
		ResultTimestamp:           data.Text("resultTimestamp"),
		Manufacturer:              data.Text("manufacturer"),
		SampleCollectionTimestamp: data.Text("sampleCollectionTimestamp"),
		SampleOrigin:              data.Text("sampleOrigin"),
		Verifier:				   data.Text("verifier"),
		FacilityName:              data.Text("facilityName"),
		FacilityAddressLine1:      data.Text("facilityAddressLine1"),
		FacilityAddressLine2:      data.Text("facilityAddressLine2"),
		FacilityDistrict:          data.Text("facilityDistrict"),
		FacilityState:             data.Text("facilityState"),
		FacilityPincode:           data.Text("facilityPincode"),
	}
}

func validateTestBulkCertifyCSVHeaders(headers []string) error {
	requiredHeaders := strings.Split(config.Config.Testcertificate.Upload.Columns, ",")
	log.Infof("required headers %+v", config.Config.Testcertificate)
	return validateBulkTestCertifyCSV(
		"Headers",
		requiredHeaders,
		func(field string) bool { return !contains(headers, field)},
	)
}

func validateBulkTestCertifyCSV(targetType string, required []string, isMissing func(field string) bool) error {
	var errMsgs []string
	missing := map[string]bool{}
	for _, f := range required {
		if isMissing(f) {
			missing[f] = true
		}
	}

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
