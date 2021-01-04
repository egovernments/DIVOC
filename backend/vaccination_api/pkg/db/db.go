package db

import (
	"errors"
	"fmt"

	"github.com/divoc/api/config"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres" //required for gorm to work
	log "github.com/sirupsen/logrus"
)

var db *gorm.DB

type CertifyUploads struct {
	gorm.Model

	// filename
	Filename string

	// status
	// Enum: [Success Failed Processing]
	Status string

	// total error rows
	TotalErrorRows int64

	// total records
	TotalRecords int64

	// user Id
	UserID string
}

type CertifyUploadErrors struct {
	gorm.Model

	// ID of CertifyUploads
	CertifyUploadID uint `gorm:"index"`

	Errors string	`json:"errors"`

	CertifyUploadFields
}

type CertifyUploadFields struct {
	RecipientName             string	`json:"recipientName"`
	RecipientMobileNumber     string	`json:"recipientMobileNumber"`
	RecipientDOB              string	`json:"recipientDOB"`
	RecipientGender           string	`json:"recipientGender"`
	RecipientNationality      string	`json:"recipientNationality"`
	RecipientIdentity         string	`json:"recipientIdentity"`
	VaccinationBatch          string	`json:"vaccinationBatch"`
	VaccinationDate           string	`json:"vaccinationDate"`
	VaccinationEffectiveStart string	`json:"vaccinationEffectiveStart"`
	VaccinationEffectiveEnd   string	`json:"vaccinationEffectiveEnd"`
	VaccinationManufacturer   string	`json:"vaccinationManufacturer"`
	VaccinationName           string	`json:"vaccinationName"`
	VaccinatorName            string	`json:"vaccinatorName"`
	FacilityName              string	`json:"facilityName"`
	FacilityAddressLine1      string	`json:"facilityAddressLine1"`
	FacilityAddressLine2      string	`json:"facilityAddressLine2"`
	FacilityDistrict          string	`json:"facilityDistrict"`
	FacilityState             string	`json:"facilityState"`
	FacilityPincode           int64		`json:"facilityPincode"`
}

func Init() {
	var e error
	dbPath := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.Config.Database.Host, config.Config.Database.Port,
		config.Config.Database.User, config.Config.Database.Password, config.Config.Database.DBName,
	)
	db, e = gorm.Open("postgres", dbPath)

	// No need to close the connection
	// As we will be reusing it
	// defer db.Close()

	if e != nil {
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
