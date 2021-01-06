package db

import (
	"errors"
	"fmt"
	"github.com/divoc/portal-api/config"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres" //required for gorm to work
	log "github.com/sirupsen/logrus"
)

var db *gorm.DB

type CSVUploads struct {
	gorm.Model

	// filename
	Filename string

	// status
	// Enum: [Success,Processing,Failed]
	Status string

	// total error rows
	TotalErrorRows int64

	// total records
	TotalRecords int64

	// user Id
	UserID string

	// uploadType
	// Enum: [Facility, Vaccinator,PreEnrollment]
	UploadType string
}

type FacilityUploadErrors struct {
	gorm.Model

	// ID of CSVUploads
	FacilityUploadID uint `gorm:"index"`

	Errors string `json:"errors"`

	FacilityUploadFields
}

type FacilityUploadFields struct {
	SerialNum          string `json:"serialNum"`
	FacilityCode       string `json:"facilityCode"`
	FacilityName       string `json:"facilityName"`
	Contact            string `json:"contact"`
	OperatingHourStart string `json:"operatingHourStart"`
	OperatingHourEnd   string `json:"operatingHourEnd"`
	Category           string `json:"category"`
	Type               string `json:"type"`
	Status             string `json:"status"`
	Admins             string `json:"admins"`
	AddressLine1       string `json:"addressLine1"`
	AddressLine2       string `json:"addressLine2"`
	District           string `json:"district"`
	State              string `json:"state"`
	Pincode            string `json:"pincode"`
	GeoLocationLat     string `json:"geoLocationLat"`
	GeoLocationLon     string `json:"geoLocationLon"`
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

	db.AutoMigrate(&CSVUploads{})
}

// CreateCSVUpload - Create new Facility upload entry in DB
func CreateCSVUpload(data *CSVUploads) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occurred while creating FacilityUpload for ", data, result.Error)
		return errors.New("error occurred while saving FacilityUpload")
	}
	log.Info("Created CSVUploads for file ", data.Filename)
	return nil
}

// GetFacilityUploadsForUser - Get all Facility file uploads for giver user
func GetFacilityUploadsForUser(userID string) ([]*CSVUploads, error) {
	var facilityUploads []*CSVUploads
	if result := db.Order("created_at desc").Find(&facilityUploads, "user_id = ?", userID); result.Error != nil {
		log.Error("Error occurred while retrieving CSVUploads for user ", userID)
		return nil, errors.New("error occurred while retrieving CSVUploads")
	}
	return facilityUploads, nil
}

func UpdateCSVUpload(data *CSVUploads) error {
	if result := db.Save(data); result.Error != nil {
		log.Error("Error occurred while saving CSVUploads with ID - ", data.ID)
		return errors.New("error occurred while saving CSVUploads")
	}
	return nil
}

func CreateFacilityUploadError(data *FacilityUploadErrors) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occurred while creating FacilityUploadErrors for ", data, result.Error)
		return errors.New("error occurred while saving FacilityUpload")
	}
	log.Info("Created FacilityUploadError for fileUploadID - ", data.FacilityUploadID)
	return nil
}

func GetFacilityUploadsForID(id uint) (*CSVUploads, error) {
	facilityUpload := &CSVUploads{}
	if result := db.First(&facilityUpload, "id = ?", id); result.Error != nil {
		log.Error("Error occurred while retrieving CSVUploads for ID ", id, result.Error)
		return nil, result.Error
	}
	return facilityUpload, nil

}

func GetFacilityUploadErrorsForUploadID(uploadId int64) ([]*FacilityUploadErrors, error) {
	var facilityUploadErrors []*FacilityUploadErrors
	if result := db.Find(&facilityUploadErrors, "Facility_upload_id = ?", uploadId); result.Error != nil {
		log.Error("Error occurred while retrieving CSVUploads for user ", uploadId)
		return nil, errors.New("error occurred while retrieving CSVUploads")
	}
	return facilityUploadErrors, nil
}
