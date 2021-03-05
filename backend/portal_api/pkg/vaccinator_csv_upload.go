package pkg

import (
	"errors"
	"strings"

	"github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/swagger_gen/models"
)

type VaccinatorCSV struct {
	CSVMetadata
}

func (vaccinatorCSV VaccinatorCSV) CreateCsvUploadHistory() *db.CSVUploads {
	return vaccinatorCSV.CSVMetadata.CreateCsvUploadHistory("Vaccinator")
}

func (vaccinatorCSV VaccinatorCSV) ValidateRow() []string {
	requiredHeaders := strings.Split(config.Config.Vaccinator.Upload.Required, ",")
	return vaccinatorCSV.CSVMetadata.ValidateRow(requiredHeaders)
}

func (vaccinatorCSV VaccinatorCSV) ProcessRow(uploadID uint) error {
	data := vaccinatorCSV.Data
	mobileNumber := data.Text("mobileNumber")
	nationalIdentifier := data.Text("nationalIdentifier")
	code := data.Text("code")
	name := data.Text("name")
	status := data.Text("status")
	facilityIds := strings.Split(data.Text("facilityIds"), ",")
	averageRating := 0.0
	trainingCertificate := ""
	email := data.Text("email")
	vaccinator := models.Vaccinator{
		MobileNumber:        &mobileNumber,
		NationalIdentifier:  &nationalIdentifier,
		Code:                &code,
		Name:                &name,
		Status:              &status,
		FacilityIds:         facilityIds,
		AverageRating:       &averageRating,
		Signatures:          []*models.Signature{},
		TrainingCertificate: &trainingCertificate,
		Programs:            []*models.VaccinatorProgramsItems0{},
		Email:               email,
	}
	//services.MakeRegistryCreateRequest(vaccinator, "Vaccinator")
	_, errorVaccinator := services.CreateNewRegistry(vaccinator, "Vaccinator")
	if errorVaccinator != nil {
		errmsg := errorVaccinator.Error()
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

func (vaccinatorCSV VaccinatorCSV) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) *db.CSVUploadErrors {
	return vaccinatorCSV.CSVMetadata.SaveCsvErrors(rowErrors, csvUploadHistoryId)
}
