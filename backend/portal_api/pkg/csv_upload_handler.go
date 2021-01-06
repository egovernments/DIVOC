package pkg

import (
	"github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"strconv"
	"strings"
)

type FacilityCSV struct {
	Data     *Scanner
	Columns  []string
	FileName string
	UserName string
}

func (facilityCsv FacilityCSV) ValidateHeaders() *models.Error {
	// csv template validation
	csvHeaders := facilityCsv.Data.GetHeaders()
	for _, c := range facilityCsv.Columns {
		if !contains(csvHeaders, c) {
			code := "INVALID_TEMPLATE"
			message := c + " column doesn't exist in uploaded csv file"
			e := &models.Error{
				Code:    &code,
				Message: &message,
			}
			return e
		}
	}
	return nil
}

func (facilityCsv FacilityCSV) CreateCsvUploadHistory() db.CSVUploads {
	// Initializing CSVUploads entity
	uploadEntry := db.CSVUploads{}
	uploadEntry.Filename = facilityCsv.FileName
	uploadEntry.UserID = facilityCsv.UserName
	uploadEntry.Status = "Processing"
	uploadEntry.UploadType = "Facility"
	uploadEntry.TotalRecords = 0
	uploadEntry.TotalErrorRows = 0
	db.CreateCSVUpload(&uploadEntry)
	return uploadEntry
}

func (facilityCsv FacilityCSV) ValidateRow() []string {
	data := facilityCsv.Data
	var errorMsgs []string
	if data.Text("facilityCode") == "" {
		errorMsgs = append(errorMsgs, "FacilityCode is missing")
	}
	if data.Text("facilityName") == "" {
		errorMsgs = append(errorMsgs, "FacilityName is missing")
	}
	if data.Text("contact") == "" {
		errorMsgs = append(errorMsgs, "Contact is missing")
	}
	/*if data.Text("admin") == "" {
		errorMsgs = append(errorMsgs, "Admin details is missing")
	}
	if data.Text("addressLine1") == "" {
		errorMsgs = append(errorMsgs, "AddressLine1 details is missing")
	}
	if data.Text("addressLine1") == "" {
		errorMsgs = append(errorMsgs, "AddressLine2 details is missing")
	}
	if data.Text("district") == "" {
		errorMsgs = append(errorMsgs, "District details is missing")
	}
	if data.Text("state") == "" {
		errorMsgs = append(errorMsgs, "State details is missing")
	}
	if data.Text("pincode") == "" {
		errorMsgs = append(errorMsgs, "Pincode details is missing")
	}*/
	return errorMsgs
}

func (facilityCsv FacilityCSV) CreateCsvUpload() error {
	data := facilityCsv.Data
	serialNum, err := strconv.ParseInt(data.Text("serialNum"), 10, 64)
	if err != nil {
		return err
	}
	addressline1 := data.Text("addressLine1")
	addressline2 := data.Text("addressLine2")
	district := data.Text("district")
	state := data.Text("state")
	pincode := data.int64("pincode")
	facility := models.Facility{
		SerialNum:          serialNum,
		FacilityCode:       data.Text("facilityCode"),
		FacilityName:       data.Text("facilityName"),
		Contact:            data.Text("contact"),
		OperatingHourStart: data.int64("operatingHourStart"),
		OperatingHourEnd:   data.int64("operatingHourEnd"),
		Category:           data.Text("category"),
		Type:               data.Text("type"),
		Status:             data.Text("status"),
		Admins:             strings.Split(data.Text("admins"), ","),
		Address: &models.Address{
			AddressLine1: &addressline1,
			AddressLine2: &addressline2,
			District:     &district,
			State:        &state,
			Pincode:      &pincode,
		},
	}
	services.MakeRegistryCreateRequest(facility, "Facility")
	for _, mobile := range facility.Admins {
		//create keycloak user for
		log.Infof("Creating administrative login for the facility :%s [%s]", facility.FacilityName, mobile)
		userRequest := KeyCloakUserRequest{
			Username: mobile,
			Enabled:  "true",
			Attributes: KeycloakUserAttributes{
				MobileNumber: []string{mobile},
				FacilityCode: facility.FacilityCode,
			},
		}

		resp, err := CreateKeycloakUser(userRequest)
		log.Infof("Create keycloak user %+v", resp)
		if err != nil || !isUserCreatedOrAlreadyExists(resp) {
			log.Errorf("Error while creating keycloak user : %s", mobile)
		} else {
			log.Info("Setting up roles for the user ", mobile)
			keycloakUserId := getKeycloakUserId(resp, userRequest)
			if keycloakUserId != "" {
				_ = addUserToGroup(keycloakUserId, config.Config.Keycloak.FacilityAdmin.GroupId)
			} else {
				log.Error("Unable to map keycloak user id for ", mobile)
			}
		}

	}
	return nil
}
