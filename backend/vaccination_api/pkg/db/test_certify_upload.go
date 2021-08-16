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

// GetCertifyUploadsForUser - Get all certify file uploads for giver user
func GetTestCertifyUploadsForUser(userID string) ([]*TestCertifyUploads, error) {
	var certifyUploads []*TestCertifyUploads
	if result := db.Order("created_at desc").Find(&certifyUploads, "user_id = ?", userID); result.Error != nil {
		log.Error("Error occurred while retrieving testCertifyUploads for user ", userID)
		return nil, errors.New("error occurred while retrieving testCertifyUploads")
	}
	return certifyUploads, nil
}

func CreateTestCertifyUploadError(data *TestCertifyUploadErrors) error {
	if result := db.Create(&data); result.Error != nil {
		log.Error("Error occurred while creating CertifyUploadErrors for ", data, result.Error)
		return errors.New("error occurred while saving certifyUpload")
	}
	log.Info("Created testCertifyUploadError for fileUploadID - ", data.CertifyUploadID)
	return nil
}

func UpdateTestCertifyUploadError(data *TestCertifyUploadErrors) error {
	if result := db.Save(data); result.Error != nil {
		log.Error("Error occurred while saving testCertifyUploadErrors with ID - ", data.ID)
		return errors.New("error occurred while saving testCertifyUploadErrors")
	}
	return nil
}

func GetTestCertifyUploadsForID(id uint) (*TestCertifyUploads, error) {
	certifyUpload := &TestCertifyUploads{}
	if result := db.First(&certifyUpload, "id = ?", id); result.Error != nil {
		log.Error("Error occurred while retrieving testCertifyUploads for ID ", id, result.Error)
		return nil, result.Error
	}
	return certifyUpload, nil

}

func GetTestCertifyUploadErrorsForUploadID(uploadId int64) ([]*TestCertifyUploadErrors, error) {
	var certifyUploadErrors []*TestCertifyUploadErrors
	if result := db.Find(&certifyUploadErrors, "certify_upload_id = ?", uploadId); result.Error != nil {
		log.Error("Error occurred while retrieving testCertifyUploadErrors for user ", uploadId)
		return nil, errors.New("error occurred while retrieving testCertifyUploadErrors")
	}
	return certifyUploadErrors, nil
}

func GetTestCertifyUploadErrorsStatusForUploadId(uploadId uint) ([]string, error) {
	var statuses []string
	var certifyUploadErrors []*TestCertifyUploadErrors
	if result := db.Model(&TestCertifyUploadErrors{}).Select("status").Find(&certifyUploadErrors, "certify_upload_id = ?", uploadId); result.Error != nil {
		log.Error("Error occurred while retrieving testCertifyUploadErrors for user ", uploadId)
		return statuses, errors.New("error occurred while retrieving testCertifyUploadErrors")
	}
	for _, c := range certifyUploadErrors {
		statuses = append(statuses, c.Status)
	}

	return statuses, nil
}

func UpdateTestCertifyUpload(data *TestCertifyUploads) error {
	if result := db.Save(data); result.Error != nil {
		log.Error("Error occurred while saving testCertifyUploads with ID - ", data.ID)
		return errors.New("error occurred while saving testCertifyUploads")
	}
	return nil
}