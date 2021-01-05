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

type FacilityUploads struct {
	gorm.Model

	// filename
	Filename string

	// status
	// Enum: [Success Failed]
	Status string

	// total error rows
	TotalErrorRows int64

	// total records
	TotalRecords int64

	// user Id
	UserID string
}

type FacilityUploadErrors struct {
	gorm.Model

	// ID of FacilityUploads
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

	db.AutoMigrate(&FacilityUploads{})
}

// CreateFacilityUpload - Create new Facility upload entry in DB
func CreateFacilityUpload(data *FacilityUploads) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occurred while creating FacilityUpload for ", data, result.Error)
		return errors.New("error occurred while saving FacilityUpload")
	}
	log.Info("Created FacilityUploads for file ", data.Filename)
	return nil
}

// GetFacilityUploadsForUser - Get all Facility file uploads for giver user
func GetFacilityUploadsForUser(userID string) ([]*FacilityUploads, error) {
	var facilityUploads []*FacilityUploads
	if result := db.Order("created_at desc").Find(&facilityUploads, "user_id = ?", userID); result.Error != nil {
		log.Error("Error occurred while retrieving FacilityUploads for user ", userID)
		return nil, errors.New("error occurred while retrieving FacilityUploads")
	}
	return facilityUploads, nil
}

func UpdateFacilityUpload(data *FacilityUploads) error {
	if result := db.Save(data); result.Error != nil {
		log.Error("Error occurred while saving FacilityUploads with ID - ", data.ID)
		return errors.New("error occurred while saving FacilityUploads")
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

func GetFacilityUploadsForID(id uint) (*FacilityUploads, error) {
	facilityUpload := &FacilityUploads{}
	if result := db.First(&facilityUpload, "id = ?", id); result.Error != nil {
		log.Error("Error occurred while retrieving FacilityUploads for ID ", id, result.Error)
		return nil, result.Error
	}
	return facilityUpload, nil

}

func GetFacilityUploadErrorsForUploadID(uploadId int64) ([]*FacilityUploadErrors, error) {
	var facilityUploadErrors []*FacilityUploadErrors
	if result := db.Find(&facilityUploadErrors, "Facility_upload_id = ?", uploadId); result.Error != nil {
		log.Error("Error occurred while retrieving FacilityUploads for user ", uploadId)
		return nil, errors.New("error occurred while retrieving FacilityUploads")
	}
	return facilityUploadErrors, nil
}
