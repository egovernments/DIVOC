package pkg

import (
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
	operatorCode := data.Text("operatorCode")
	operatorName := data.Text("operatorName")
	status := data.Text("status")
	facilityIds := strings.Split(data.Text("facilityIds"), ",")
	averageRating := 0.0
	trainingCertificate := ""
	vaccinator := models.Operator{
		SerialNum:           &serialNum,
		MobileNumber:        &mobileNumber,
		NationalIdentifier:  &nationalIdentifier,
		OperatorCode:        &operatorCode,
		OperatorName:        &operatorName,
		Status:              &status,
		FacilityIds:         facilityIds,
		AverageRating:       &averageRating,
		Signatures:          []*models.Signature{},
		TrainingCertificate: &trainingCertificate,
	}
	makeRegistryCreateRequest(vaccinator, "Vaccinator")
	return nil
}

func createFacility(data *Scanner, authHeader string) error {
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
	makeRegistryCreateRequest(facility, "Facility")
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
		resp, err := CreateKeycloakUser(userRequest, authHeader)
		log.Info("Created keycloak user ", resp.Response().StatusCode, " ", resp.String())
		if err != nil || !isUserCreatedOrAlreadyExists(resp) {
			log.Errorf("Error while creating keycloak user : %s", mobile)
		} else {
			log.Info("Setting up roles for the user ", mobile)
			keycloakUserId := getKeycloakUserId(resp, userRequest, authHeader)
			if keycloakUserId != "" {
				_ = addUserToGroup(keycloakUserId, config.Config.Keycloak.FacilityAdmin.GroupId, authHeader)
			} else {
				log.Error("Unable to map keycloak user id for ", mobile)
			}
		}

	}
	return nil
}
