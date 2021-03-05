package pkg

import (
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/pkg/services"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/go-openapi/strfmt"
)

type PreEnrollmentCSV struct {
	CSVMetadata
	ProgramId string
}

func (preEnrollmentCsv PreEnrollmentCSV) CreateCsvUploadHistory() *db.CSVUploads {
	return preEnrollmentCsv.CSVMetadata.CreateCsvUploadHistory("PreEnrollment")
}

func (preEnrollmentCsv PreEnrollmentCSV) ValidateRow() []string {
	requiredHeaders := strings.Split(config.Config.PreEnrollment.Upload.Required, ",")
	return preEnrollmentCsv.CSVMetadata.ValidateRow(requiredHeaders)
}

func (preEnrollmentCsv PreEnrollmentCSV) ProcessRow(uploadID uint) error {
	err := sendForEnrollment(preEnrollmentCsv, uploadID)
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
	return nil
}

func sendForEnrollment(preEnrollmentCsv PreEnrollmentCSV, uploadID uint) error {

	ptrOf := func (s string) *string  { return &s}
	data := preEnrollmentCsv.Data
	dob, err := time.Parse(strfmt.RFC3339FullDate, data.Text("dob"))
	if err != nil {
		return err
	}

	enrollment := models.Enrollment{
		Phone:             data.Text("phone"),
		NationalID:        ptrOf(data.Text("nationalId")),
		Dob:               strfmt.Date(dob),
		Gender:            data.Text("gender"),
		Name:              data.Text("name"),
		Email:             data.Text("email"),
		Address:           &models.EnrollmentAddress{
			AddressLine1: ptrOf(data.Text("addressLine1")),
			AddressLine2: data.Text("addressLine2"),
			District: ptrOf(data.Text("district")),
			State: ptrOf(data.Text("state")),
			Pincode: ptrOf(data.Text("pincode")),
		},
		Appointments: []*models.EnrollmentAppointmentsItems0{
			{
				ProgramID: preEnrollmentCsv.ProgramId,
			},
		},
		Yob: int64(dob.Year()),
		Comorbidities: []string{},
	}

	csvUploadErr := preEnrollmentCsv.SaveCsvErrors(nil, uploadID)
	
	enrollmentMsg, err := json.Marshal(struct{
		RowID uint	`json:"rowID"`
		models.Enrollment
	}{
		RowID: csvUploadErr.ID,
		Enrollment: enrollment,
	})
	if err != nil {
		return err
	}
	services.PublishEnrollmentMessage(enrollmentMsg)
	return nil
}

func (preEnrollmentCsv PreEnrollmentCSV) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) *db.CSVUploadErrors {
	return preEnrollmentCsv.CSVMetadata.SaveCsvErrors(rowErrors, csvUploadHistoryId)
}
