package db

import (
	"errors"
	"fmt"
	"strings"

	"github.com/divoc/api/config"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres" //required for gorm to work
	log "github.com/sirupsen/logrus"
)

var db *gorm.DB

const CERTIFY_UPLOAD_FAILED_STATUS = "Failed"
const CERTIFY_UPLOAD_SUCCESS_STATUS = "Success"
const CERTIFY_UPLOAD_PROCESSING_STATUS = "Processing"

type CertifyUploads struct {
	gorm.Model

	// filename
	Filename string

	// total records
	TotalRecords int64

	// user Id
	UserID string
}

type CertifyUploadErrors struct {
	gorm.Model

	// ID of CertifyUploads
	CertifyUploadID uint `gorm:"index"`

	Errors string `json:"errors"`

	// status
	// Enum: [Success Failed Processing]
	Status string `json:"status"`

	CertifyUploadFields
}

type CertifyUploadFields struct {
	RecipientName             string `json:"recipientName"`
	RecipientMobileNumber     string `json:"recipientMobileNumber"`
	RecipientDOB              string `json:"recipientDOB"`
	RecipientGender           string `json:"recipientGender"`
	RecipientNationality      string `json:"recipientNationality"`
	RecipientIdentity         string `json:"recipientIdentity"`
	RecipientAge              string `json:"recipientAge"`
	RecipientAddressLine1     string `json:"recipientAddressLine1"`
	RecipientAddressLine2     string `json:"recipientAddressLine2"`
	RecipientDistrict         string `json:"recipientDistrict"`
	RecipientState            string `json:"recipientState"`
	RecipientPincode          int64  `json:"recipientPincode"`
	VaccinationBatch          string `json:"vaccinationBatch"`
	VaccinationDate           string `json:"vaccinationDate"`
	VaccinationDose           string `json:"vaccinationDose"`
	VaccinationTotalDoses     string `json:"vaccinationTotalDoses"`
	VaccinationEffectiveStart string `json:"vaccinationEffectiveStart"`
	VaccinationEffectiveEnd   string `json:"vaccinationEffectiveEnd"`
	VaccinationManufacturer   string `json:"vaccinationManufacturer"`
	VaccinationName           string `json:"vaccinationName"`
	VaccinatorName            string `json:"vaccinatorName"`
	FacilityName              string `json:"facilityName"`
	FacilityAddressLine1      string `json:"facilityAddressLine1"`
	FacilityAddressLine2      string `json:"facilityAddressLine2"`
	FacilityDistrict          string `json:"facilityDistrict"`
	FacilityState             string `json:"facilityState"`
	FacilityPincode           int64  `json:"facilityPincode"`
}

func Init() {
	var e error
	dbPath := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.Config.Database.Host, config.Config.Database.Port,
		config.Config.Database.User, config.Config.Database.Password, config.Config.Database.DBName,
	)
	log.Infof("Using db %s", dbPath)
	db, e = gorm.Open("postgres", dbPath)

	// No need to close the connection
	// As we will be reusing it
	// defer db.Close()

	if e != nil {
		log.Errorf("Error %+v", e)
		panic("failed to connect to database")
	}

	db.AutoMigrate(&CertifyUploads{})
	db.AutoMigrate(&CertifyUploadErrors{})
}

// CreateCertifyUpload - Create new certify upload entry in DB
func CreateCertifyUpload(data *CertifyUploads) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occurred while creating certifyUpload for ", data, result.Error)
		return errors.New("error occurred while saving certifyUpload")
	}
	log.Info("Created certifyUploads for file ", data.Filename)
	return nil
}

// GetCertifyUploadsForUser - Get all certify file uploads for giver user
func GetCertifyUploadsForUser(userID string) ([]*CertifyUploads, error) {
	var certifyUploads []*CertifyUploads
	if result := db.Order("created_at desc").Find(&certifyUploads, "user_id = ?", userID); result.Error != nil {
		log.Error("Error occurred while retrieving certifyUploads for user ", userID)
		return nil, errors.New("error occurred while retrieving certifyUploads")
	}
	return certifyUploads, nil
}

func UpdateCertifyUpload(data *CertifyUploads) error {
	if result := db.Save(data); result.Error != nil {
		log.Error("Error occurred while saving certifyUploads with ID - ", data.ID)
		return errors.New("error occurred while saving certifyUploads")
	}
	return nil
}

func CreateCertifyUploadError(data *CertifyUploadErrors) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occurred while creating CertifyUploadErrors for ", data, result.Error)
		return errors.New("error occurred while saving certifyUpload")
	}
	log.Info("Created certifyUploadError for fileUploadID - ", data.CertifyUploadID)
	return nil
}

func GetCertifyUploadsForID(id uint) (*CertifyUploads, error) {
	certifyUpload := &CertifyUploads{}
	if result := db.First(&certifyUpload, "id = ?", id); result.Error != nil {
		log.Error("Error occurred while retrieving certifyUploads for ID ", id, result.Error)
		return nil, result.Error
	}
	return certifyUpload, nil

}

func GetCertifyUploadErrorsForUploadID(uploadId int64) ([]*CertifyUploadErrors, error) {
	var certifyUploadErrors []*CertifyUploadErrors
	if result := db.Find(&certifyUploadErrors, "certify_upload_id = ?", uploadId); result.Error != nil {
		log.Error("Error occurred while retrieving certifyUploads for user ", uploadId)
		return nil, errors.New("error occurred while retrieving certifyUploads")
	}
	return certifyUploadErrors, nil

}

func GetCertifyUploadErrorsStatusForUploadId(uploadId uint) ([]string, error) {
	var statuses []string
	var certifyUploadErrors []*CertifyUploadErrors
	if result := db.Model(&CertifyUploadErrors{}).Select("status").Find(&certifyUploadErrors, "certify_upload_id = ?", uploadId); result.Error != nil {
		log.Error("Error occurred while retrieving certifyUploads for user ", uploadId)
		return statuses, errors.New("error occurred while retrieving certifyUploads")
	}
	for _, c := range certifyUploadErrors {
		statuses = append(statuses, c.Status)
	}

	return statuses, nil
}

func UpdateCertifyUploadError(data *CertifyUploadErrors) error {
	if result := db.Save(data); result.Error != nil {
		log.Error("Error occurred while saving certifyUploadErrors with ID - ", data.ID)
		return errors.New("error occurred while saving certifyUploadErrors")
	}
	return nil
}

func DeleteCertifyUploadError(id uint) error {
	if result := db.Unscoped().Delete(&CertifyUploadErrors{}, id); result.Error != nil {
		log.Error("Error occurred while deleting CertifyUploadErrors with id ", id, result.Error)
		return errors.New("error occurred while deleting certifyUploadErrors")
	}
	log.Info("Deleted certifyUploadError for ID - ", id)
	return nil
}

func UpdateCertifyUploadErrorStatusAndErrorMsg(id uint, status string, errorMsg string) error {
	certifyUploadErrors := &CertifyUploadErrors{}
	if result := db.First(&certifyUploadErrors, id); result.Error != nil {
		log.Error("Error occurred while retrieving certifyUploads for user ", id, result.Error)
		return errors.New("error occurred while retrieving certifyUploads")
	}
	certifyUploadErrors.Status = status
	certifyUploadErrors.Errors = strings.Join([]string{certifyUploadErrors.Errors, errorMsg}, ",")
	return UpdateCertifyUploadError(certifyUploadErrors)
}
