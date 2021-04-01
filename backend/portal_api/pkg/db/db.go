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

	// total records
	TotalRecords int64

	// user Id
	UserID string

	// uploadType
	// Enum: [Facility, Vaccinator,PreEnrollment]
	UploadType string
}

type CSVUploadInfo struct {
	CSVUploads
	TotalErrorRows	uint
}

type CSVUploadErrors struct {
	gorm.Model

	// ID of CSVUploads
	CSVUploadID uint `gorm:"index"`

	Errors string `json:"errors"`

	RowData string
	
	InProgress bool
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
	log.Infof("Connecting to DB %s", dbPath)
	if e != nil {
		log.Error(e)
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

// GetUploadsForUser - Get all uploads for given User and Type
func GetUploadsForUser(userID, uploadType string) ([]*CSVUploadInfo, error) {
	var uploads []*CSVUploadInfo
	if err := db.Raw(`
					SELECT csv_uploads.*, count(csv_upload_errors.id) as total_error_rows
					FROM csv_uploads LEFT JOIN csv_upload_errors 
						ON csv_upload_errors.csv_upload_id = csv_uploads.id 
						AND csv_upload_errors.in_progress != true
					WHERE user_id = ? AND upload_type = ? GROUP BY csv_uploads.id`, userID, uploadType,
				).Scan(&uploads).Error; err != nil {
		errMsg := fmt.Sprintf("Error occurred while retrieving %s CSVUploads for user %s. Error: %s", uploadType, userID, err.Error())
		log.Errorf(errMsg)
		return nil, errors.New(errMsg)
	}
	return uploads, nil
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

func DeleteCSVUploadError(id uint) error {
	if r := db.Unscoped().Delete(&CSVUploadErrors{}, id); r.Error != nil {
		errMsg := fmt.Sprintf("Error while deleting CSVUpload Error id = %d, error: %s", id, r.Error.Error())
		log.Error(errMsg)
		return errors.New(errMsg)
	}
	log.Info("Deleted CSVUploadError for ID = ", id)
	return nil
}

func UpdateCSVUploadError(id uint, errorMsg string, inProgess bool) error {
	csvUploadErrors := &CSVUploadErrors{}
	if r := db.First(&csvUploadErrors, id); r.Error != nil {
		errMsg := fmt.Sprintf("Error occurred while fetching CSVUploadError ID=%d", id)
		log.Error(errMsg)
		return errors.New(errMsg)
	}
	csvUploadErrors.InProgress = inProgess
	csvUploadErrors.Errors = errorMsg

	r := db.Save(csvUploadErrors)
	if r.Error != nil {
		log.Error("Error while saving CSVUploadError ID=", id)
	} 
	return r.Error
}

func GetCSVUploadErrorsForUploadID(uploadId int64) ([]*CSVUploadErrors, error) {
	var csvUploadErrors []*CSVUploadErrors
	if result := db.Find(&csvUploadErrors, "csv_upload_id = ?", uploadId); result.Error != nil {
		log.Error("Error occurred while retrieving CSVUploads for user ", uploadId)
		return nil, errors.New("error occurred while retrieving CSVUploads")
	}
	return csvUploadErrors, nil
}
