package pkg

import (
	"errors"
	"github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/pkg/db"
	"strings"
)

type PreEnrollmentCSV struct {
	CSVMetadata
}

func (preEnrollmentCsv PreEnrollmentCSV) CreateCsvUploadHistory() *db.CSVUploads {
	return preEnrollmentCsv.CSVMetadata.CreateCsvUploadHistory("PreEnrollment")
}

func (preEnrollmentCsv PreEnrollmentCSV) ValidateRow() []string {
	data := preEnrollmentCsv.Data
	var errorMsgs []string
	if data.Text("phone") == "" {
		errorMsgs = append(errorMsgs, "Phone is missing")
	}
	if data.Text("enrollmentScopeId") == "" {
		errorMsgs = append(errorMsgs, "Facility code is missing")
	}
	if data.Text("nationalId") == "" {
		errorMsgs = append(errorMsgs, "National Id is missing")
	}
	if data.Text("dob") == "" {
		errorMsgs = append(errorMsgs, "DOB details is missing")
	}
	if data.Text("gender") == "" {
		errorMsgs = append(errorMsgs, "Gender details is missing")
	}
	if data.Text("name") == "" {
		errorMsgs = append(errorMsgs, "Name is missing")
	}
	if data.Text("email") == "" {
		errorMsgs = append(errorMsgs, "Email details is missing")
	}
	return errorMsgs
}

func (preEnrollmentCsv PreEnrollmentCSV) CreateCsvUpload() error {
	data := preEnrollmentCsv.Data
	//Name, Mobile, National Identifier, DOB, facilityId
	//EnrollmentScopeId instead of facility so that we can have flexibility of getting preenrollment at geo attribute like city etc.
	enrollment := Enrollment{
		Phone:             data.Text("phone"),
		EnrollmentScopeId: data.Text("enrollmentScopeId"),
		NationalId:        data.Text("nationalId"),
		Dob:               data.Text("dob"),
		Gender:            data.Text("gender"),
		Name:              data.Text("name"),
		Email:             data.Text("email"),
		Code:              generateEnrollmentCode(),
	}
	err := services.CreateNewRegistry(enrollment, "Enrollment")
	if err != nil {
		errmsg := err.Error()
		if strings.Contains(errmsg, "Detail:") {
			split := strings.Split(errmsg, "Detail:")
			if len(split) > 0 {
				m1 := split[len(split)-1]
				return errors.New(m1)
			}
		}
		return errors.New(errmsg)
	}
	errNotify := notifyRecipient(enrollment)
	return errNotify
}

func (preEnrollmentCsv PreEnrollmentCSV) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) {
	preEnrollmentCsv.CSVMetadata.SaveCsvErrors(rowErrors, csvUploadHistoryId)
}
