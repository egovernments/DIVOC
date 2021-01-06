package pkg

import (
	"github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"strconv"
	"strings"
)

func createVaccinator(data *Scanner) error {
	serialNum, err := strconv.ParseInt(data.Text("serialNum"), 10, 64)
	if err != nil {
		return err
	}
	mobileNumber := data.Text("mobileNumber")
	nationalIdentifier := data.Text("nationalIdentifier")
	code := data.Text("code")
	name := data.Text("name")
	status := data.Text("status")
	facilityIds := strings.Split(data.Text("facilityIds"), ",")
	averageRating := 0.0
	trainingCertificate := ""
	vaccinator := models.Vaccinator{
		SerialNum:           &serialNum,
		MobileNumber:        &mobileNumber,
		NationalIdentifier:  &nationalIdentifier,
		Code:                &code,
		Name:                &name,
		Status:              &status,
		FacilityIds:         facilityIds,
		AverageRating:       &averageRating,
		Signatures:          []*models.Signature{},
		TrainingCertificate: &trainingCertificate,
	}
	services.MakeRegistryCreateRequest(vaccinator, "Vaccinator")
	return nil
}

func createFacility(data *Scanner) error {
	//todo: pass it to queue and then process.
	//serialNum, facilityCode,facilityName,contact,operatingHourStart, operatingHourEnd, category, type, status,
	//admins,addressLine1,addressLine2, district, state, pincode, geoLocationLat, geoLocationLon
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
