package pkg

import (
	"errors"
	"github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"strconv"
	"strings"
)

type FacilityCSV struct {
	CSVMetadata
}

func (facilityCsv FacilityCSV) CreateCsvUploadHistory() *db.CSVUploads {
	return facilityCsv.CSVMetadata.CreateCsvUploadHistory("Facility")
}

func (facilityCsv FacilityCSV) ValidateRow() []string {
	requiredHeaders := strings.Split(config.Config.Facility.Upload.Required, ",")
	return facilityCsv.CSVMetadata.ValidateRow(requiredHeaders)
}

func (facilityCsv FacilityCSV) CreateCsvUpload() error {
	data := facilityCsv.Data
	//serialNum, facilityCode,facilityName,contact,operatingHourStart, operatingHourEnd, category, type, status,
	//admins,addressLine1,addressLine2, district, state, pincode, geoLocationLat, geoLocationLon,adminName,adminMobile
	serialNum, err := strconv.ParseInt(data.Text("serialNum"), 10, 64)
	if err != nil {
		return err
	}
	addressline1 := data.Text("addressLine1")
	addressline2 := data.Text("addressLine2")
	district := data.Text("district")
	state := data.Text("state")
	pincode := data.int64("pincode")

	var admins []*models.Vaccinator
	admins = append(admins, buildVaccinator(data))

	facilityCode := data.Text("facilityCode")
	facility := models.Facility{
		SerialNum:          serialNum,
		FacilityCode:       facilityCode,
		FacilityName:       data.Text("facilityName"),
		Contact:            data.Text("contact"),
		OperatingHourStart: data.int64("operatingHourStart"),
		OperatingHourEnd:   data.int64("operatingHourEnd"),
		Category:           data.Text("category"),
		Type:               data.Text("type"),
		Status:             data.Text("status"),
		Admins:             admins,
		Address: &models.Address{
			AddressLine1: &addressline1,
			AddressLine2: &addressline2,
			District:     &district,
			State:        &state,
			Pincode:      &pincode,
		},
		Email:       data.Text("email"),
		GeoLocation: data.Text("geoLocationLat") + "," + data.Text("geoLocationLon"),
		WebsiteURL:  data.Text("websiteURL"),
		Programs:    []*models.FacilityProgramsItems0{},
	}
	err = services.CreateNewRegistry(facility, "Facility")
	if err != nil {
		errmsg := err.Error()
		if strings.Contains(errmsg, "Detail:") {
			split := strings.Split(errmsg, "Detail:")
			if len(split) > 0 {
				m1 := split[len(split)-1]
				errmsg = strings.ReplaceAll(m1, "\"", "")
				errmsg = strings.ReplaceAll(errmsg, "'", "")
			}
		}
		return errors.New(errmsg)
	}
	sendFacilityRegisteredNotification(facility)
	for _, mobile := range facility.Admins {
		//create keycloak user for
		log.Infof("Creating administrative login for the facility :%s [%s]", facility.FacilityName, mobile)
		userRequest := KeyCloakUserRequest{
			Username: *mobile.MobileNumber,
			Enabled:  "true",
			Attributes: KeycloakUserAttributes{
				MobileNumber: []string{*mobile.MobileNumber},
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

func buildVaccinator(data *Scanner) *models.Vaccinator {
	adminStatus := "Active"
	index := int64(1)
	code := ""
	nationalIdentifier := ""
	name := data.Text("adminName")
	mobileNumber := data.Text("adminMobile")
	averageRating := 0.0
	trainingCertificate := ""
	facilityCode := data.Text("facilityCode")
	return &models.Vaccinator{
		SerialNum:           &index,
		Code:                &code,
		NationalIdentifier:  &nationalIdentifier,
		Name:                &name,
		FacilityIds:         []string{facilityCode},
		MobileNumber:        &mobileNumber,
		Status:              &adminStatus,
		AverageRating:       &averageRating,
		Signatures:          []*models.Signature{},
		TrainingCertificate: &trainingCertificate,
	}
}

func (facilityCsv FacilityCSV) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) {
	facilityCsv.CSVMetadata.SaveCsvErrors(rowErrors, csvUploadHistoryId)
}
