package pkg

import (
	"errors"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/pkg/models"
	"github.com/divoc/portal-api/pkg/services"
	"github.com/divoc/portal-api/pkg/utils"
	log "github.com/sirupsen/logrus"
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
	err, enrollment := createPreEnrollmentRegistry(preEnrollmentCsv, 1)
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

func createPreEnrollmentRegistry(preEnrollmentCsv PreEnrollmentCSV, currentRetryCount int) (error, models.Enrollment) {
	log.Info("Current number of tries for createPreEnrollmentRegistry ", currentRetryCount)
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
		Code:              utils.GenerateEnrollmentCode(data.Text("phone")),
		Certified:         false,
		ProgramId:         preEnrollmentCsv.ProgramId,
		Address:           GetAddressObject(data),
	}
	_, err := kernelService.CreateNewRegistry(enrollment, "Enrollment")
	log.Info("Received error response from the create new registry", err)
	if err != nil && currentRetryCount <= config.Config.EnrollmentCreation.MaxRetryCount {
		return createPreEnrollmentRegistry(preEnrollmentCsv, currentRetryCount+1)
	}
	return err, enrollment
}

func (preEnrollmentCsv PreEnrollmentCSV) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) {
	preEnrollmentCsv.CSVMetadata.SaveCsvErrors(rowErrors, csvUploadHistoryId)
}
