package pkg

import (
	"errors"
	"strings"

	"github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
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

func (facilityCsv FacilityCSV) ProcessRow(uploadID uint) error {
	data := facilityCsv.Data
	//facilityCode,facilityName,contact,operatingHourStart, operatingHourEnd, category, type, status,
	//admins,addressLine1,addressLine2, district, state, pincode, geoLocationLat, geoLocationLon,adminName,adminMobile

	var admins []*models.FacilityAdmin
	admins = append(admins, buildVaccinator(data))

	facilityCode := data.Text("facilityCode")
	facility := models.Facility{
		FacilityCode:       facilityCode,
		FacilityName:       data.Text("facilityName"),
		Contact:            data.Text("contact"),
		OperatingHourStart: data.Text("operatingHourStart"),
		OperatingHourEnd:   data.Text("operatingHourEnd"),
		Category:           data.Text("category"),
		Type:               data.Text("type"),
		Status:             data.Text("status"),
		Admins:             admins,
		Address:            GetAddressObject(data),
		Email:              data.Text("email"),
		GeoLocation:        data.Text("geoLocationLat") + "," + data.Text("geoLocationLon"),
		WebsiteURL:         data.Text("websiteURL"),
		Programs:           []*models.FacilityProgramsItems0{},
	}
	_, err := services.CreateNewRegistry(facility, "Facility")
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
	for _, admin := range facility.Admins {
		//create keycloak user for
		log.Infof("Creating administrative login for the facility :%s [%s]", facility.FacilityName, admin)
		userRequest := KeyCloakUserRequest{
			Username: admin.Mobile,
			Enabled:  true,
			Attributes: KeycloakUserAttributes{
				MobileNumber: []string{admin.Mobile},
				FacilityCode: facility.FacilityCode,
				FullName:     admin.Name,
			},
		}

		resp, err := CreateKeycloakUser(userRequest)
		log.Debugf("Create keycloak user %+v", resp)
		if err != nil || !isUserCreatedOrAlreadyExists(resp) {
			log.Errorf("Error while creating keycloak user : %s", admin)
		} else {
			log.Info("Setting up roles for the user ", admin)
			keycloakUserId := getKeycloakUserId(resp, userRequest)
			if keycloakUserId != "" {
				_ = addUserToGroup(keycloakUserId, config.Config.Keycloak.FacilityAdmin.GroupId)
			} else {
				log.Error("Unable to map keycloak user id for ", admin)
			}
		}

	}
	return nil
}

func buildVaccinator(data *Scanner) *models.FacilityAdmin {
	adminStatus := "Active"
	name := data.Text("adminName")
	mobileNumber := data.Text("adminMobile")
	return &models.FacilityAdmin{
		Name:   name,
		Mobile: mobileNumber,
		Status: adminStatus,
	}
}

func (facilityCsv FacilityCSV) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint, inProgress bool) *db.CSVUploadErrors {
	return facilityCsv.CSVMetadata.SaveCsvErrors(rowErrors, csvUploadHistoryId, inProgress)
}
