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
}

// CreateCertifyUpload - Create new certify upload entry in DB
func CreateCertifyUpload(data *CertifyUploads) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occured while creating certifyUpload for ", data, result.Error)
		return errors.New("Error occurred while saving certifyUpload")
	}
	log.Info("Created certifyUploads for file ", data.Filename)
	return nil
}

// GetCertifyUploadsForUser - Get all certify file uploads for giver user
func GetCertifyUploadsForUser(userID string) ([]*CertifyUploads, error) {
	var certifyUploads []*CertifyUploads
	if result := db.Find(&certifyUploads, "user_id = ?", userID); result.Error != nil {
		log.Error("Error occurred while retrieving certifyUploads for user ", userID)
		return nil, errors.New("Error occurred while retrieving certifyUploads")
	}
	return certifyUploads, nil
}
