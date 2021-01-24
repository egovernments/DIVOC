package pkg

import (
	"errors"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/pkg/models"
	"github.com/divoc/portal-api/pkg/services"
	"math/rand"
	"strconv"
	"strings"
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

func (preEnrollmentCsv PreEnrollmentCSV) CreateCsvUpload() error {
	data := preEnrollmentCsv.Data
	//Name, Mobile, National Identifier, DOB, facilityId
	//EnrollmentScopeId instead of facility so that we can have flexibility of getting preenrollment at geo attribute like city etc.
	enrollment := models.Enrollment{
		Phone:             data.Text("phone"),
		EnrollmentScopeId: data.Text("enrollmentScopeId"),
		NationalId:        data.Text("nationalId"),
		Dob:               data.Text("dob"),
		Gender:            data.Text("gender"),
		Name:              data.Text("name"),
		Email:             data.Text("email"),
		Code:              generateEnrollmentCode(),
		Certified:         false,
		ProgramId:         preEnrollmentCsv.ProgramId,
	}
	err := kernelService.CreateNewRegistry(enrollment, "Enrollment")
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
	errNotify := services.NotifyRecipient(enrollment)
	return errNotify
}

func (preEnrollmentCsv PreEnrollmentCSV) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) {
	preEnrollmentCsv.CSVMetadata.SaveCsvErrors(rowErrors, csvUploadHistoryId)
}

func generateEnrollmentCode() string {
	return strconv.Itoa(10000 + rand.Intn(90000)) //five digit random code
}
