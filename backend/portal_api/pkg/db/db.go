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

	// file header
	FileHeaders string

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

type CSVUploadErrors struct {
	gorm.Model

	// ID of CSVUploads
	CSVUploadID uint `gorm:"index"`

	Errors string `json:"errors"`

	RowData string
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
	db.AutoMigrate(&CSVUploadErrors{})
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
	if result := db.Order("created_at desc").Find(&facilityUploads, "user_id = ? AND upload_type = ?", userID, "Facility"); result.Error != nil {
		log.Error("Error occurred while retrieving CSVUploads for user ", userID)
		return nil, errors.New("error occurred while retrieving CSVUploads")
	}
	return facilityUploads, nil
}

func GetEnrollmentUploadsForUser(userID string) ([]*CSVUploads, error) {
	var facilityUploads []*CSVUploads
	if result := db.Order("created_at desc").Find(&facilityUploads, "user_id = ? AND upload_type = ?", userID, "PreEnrollment"); result.Error != nil {
		log.Error("Error occurred while retrieving CSVUploads for user ", userID)
		return nil, errors.New("error occurred while retrieving CSVUploads")
	}
	return facilityUploads, nil
}

func GetCSVUploadsForUser(userID string, uploadType string) ([]*CSVUploads, error) {
	var facilityUploads []*CSVUploads
	if result := db.Order("created_at desc").Find(&facilityUploads, "user_id = ? AND upload_type = ?", userID, uploadType); result.Error != nil {
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

func CreateCSVUploadError(data *CSVUploadErrors) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occurred while creating CSVUploadErrors for ", data, result.Error)
		return errors.New("error occurred while saving FacilityUpload")
	}
	log.Info("Created FacilityUploadError for fileUploadID - ", data.CSVUploadID)
	return nil
}

func GetCSVUploadsForID(id int64) (*CSVUploads, error) {
	facilityUpload := &CSVUploads{}
	if result := db.First(&facilityUpload, "id = ?", id); result.Error != nil {
		log.Error("Error occurred while retrieving CSVUploads for ID ", id, result.Error)
		return nil, result.Error
	}
	return facilityUpload, nil

}

func GetCSVUploadErrorsForUploadID(uploadId int64) ([]*CSVUploadErrors, error) {
	var csvUploadErrors []*CSVUploadErrors
	if result := db.Find(&csvUploadErrors, "csv_upload_id = ?", uploadId); result.Error != nil {
		log.Error("Error occurred while retrieving CSVUploads for user ", uploadId)
		return nil, errors.New("error occurred while retrieving CSVUploads")
	}
	return csvUploadErrors, nil
}
