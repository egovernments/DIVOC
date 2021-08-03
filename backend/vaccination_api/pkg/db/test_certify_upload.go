package db

import (
	"errors"
	"github.com/jinzhu/gorm"
	log "github.com/sirupsen/logrus"
)

type TestCertifyUploads struct {
	gorm.Model

	// filename
	Filename string

	// total records
	TotalRecords int64

	// user Id
	UserID string
}

type TestCertifyUploadErrors struct {
	gorm.Model

	// ID of CertifyUploads
	CertifyUploadID uint `gorm:"index"`

	Errors string `json:"errors"`

	// status
	// Enum: [Success Failed Processing]
	Status string `json:"status"`

	TestCertifyUploadFields
}

type TestCertifyUploadFields struct {
	PreEnrollmentCode         string `json:"preEnrollmentCode"`
	RecipientName             string `json:"recipientName"`
	RecipientMobileNumber     string `json:"recipientMobileNumber"`
	RecipientDOB              string `json:"recipientDOB"`
	RecipientGender           string `json:"recipientGender"`
	RecipientNationality      string `json:"recipientNationality"`
	RecipientIdentity         string `json:"recipientIdentity"`
	RecipientAddressLine1     string `json:"recipientAddressLine1"`
	RecipientAddressLine2     string `json:"recipientAddressLine2"`
	RecipientDistrict         string `json:"recipientDistrict"`
	RecipientState            string `json:"recipientState"`
	RecipientPincode          string  `json:"recipientPincode"`
	TestBatch          		  string `json:"testBatch"`
	Disease           		  string `json:"disease"`
	TestName          		  string `json:"testName"`
	TestType     			  string `json:"testType"`
	Result 					  string `json:"result"`
	ResultTimestamp   		  string `json:"resultTimestamp"`
	Manufacturer   			  string `json:"manufacturer"`
	SampleCollectionTimestamp string `json:"sampleCollectionTimestamp"`
	SampleOrigin              string `json:"sampleOrigin"`
	Verifier              	  string `json:"verifier"`
	FacilityName              string `json:"facilityName"`
	FacilityAddressLine1      string `json:"facilityAddressLine1"`
	FacilityAddressLine2      string `json:"facilityAddressLine2"`
	FacilityDistrict          string `json:"facilityDistrict"`
	FacilityState             string `json:"facilityState"`
	FacilityPincode           string  `json:"facilityPincode"`
}

// CreateCertifyUpload - Create new certify upload entry in DB
func CreateTestCertifyUpload(data *TestCertifyUploads) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occurred while creating testCertifyUpload for ", data, result.Error)
		return errors.New("error occurred while saving certifyUpload")
	}
	log.Info("Created testCertifyUploads for file ", data.Filename)
	return nil
}

func CreateTestCertifyUploadError(data *TestCertifyUploadErrors) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occurred while creating CertifyUploadErrors for ", data, result.Error)
		return errors.New("error occurred while saving certifyUpload")
	}
	log.Info("Created certifyUploadError for fileUploadID - ", data.CertifyUploadID)
	return nil
}

func UpdateTestCertifyUploadError(data *TestCertifyUploadErrors) error {
	if result := db.Save(data); result.Error != nil {
		log.Error("Error occurred while saving testCertifyUploadErrors with ID - ", data.ID)
		return errors.New("error occurred while saving certifyUploadErrors")
	}
	return nil
}

func UpdateTestCertifyUpload(data *TestCertifyUploads) error {
	if result := db.Save(data); result.Error != nil {
		log.Error("Error occurred while saving tcertifyUploads with ID - ", data.ID)
		return errors.New("error occurred while saving certifyUploads")
	}
	return nil
}