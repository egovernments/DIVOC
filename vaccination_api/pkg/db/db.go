package db

import (
	"errors"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres" //required for gorm to work
	log "github.com/sirupsen/logrus"
)

var db *gorm.DB

const dbPath = "host=0.0.0.0 port=5432 user=postgres dbname=postgres sslmode=disable  password=postgres"

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

	Errors string

	CertifyUploadFields
}

type CertifyUploadFields struct {
	RecipientName             string
	RecipientMobileNumber     string
	RecipientDOB              string
	RecipientGender           string
	RecipientNationality      string
	RecipientIdentity         string
	VaccinationBatch          string
	VaccinationDate           string
	VaccinationEffectiveStart string
	VaccinationEffectiveEnd   string
	VaccinationManufacturer   string
	VaccinationName           string
	VaccinatorName            string
	FacilityName              string
	FacilityAddressLine1      string
	FacilityAddressLine2      string
	FacilityDistrict          string
	FacilityState             string
	FacilityPincode           int64
}

func Init() {
	var e error
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
