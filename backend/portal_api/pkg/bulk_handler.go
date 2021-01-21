package pkg

import (
	"bytes"
	"fmt"
	"github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	kafkaServices "github.com/divoc/portal-api/pkg/services"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"strconv"
	"strings"
	"text/template"
)

const facilityRegisteredTemplateString = `
Welcome {{.FacilityName}}.
Your facility has been registered under divoc. 
You can login at https://divoc.xiv.in/portal using {{.Admins}} contact numbers.
`

var facilityRegisteredTemplate = template.Must(template.New("").Parse(facilityRegisteredTemplateString))

func createVaccinator(data *Scanner) error {
	mobileNumber := data.Text("mobileNumber")
	nationalIdentifier := data.Text("nationalIdentifier")
	code := data.Text("code")
	name := data.Text("name")
	status := data.Text("status")
	facilityIds := strings.Split(data.Text("facilityIds"), ",")
	averageRating := 0.0
	trainingCertificate := ""
	vaccinator := models.Vaccinator{
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
	var admins []*models.Vaccinator
	var index int64
	facilityCode := data.Text("facilityCode")
	adminStatus := "Active"
	for index = 1; index <= data.int64("totalAdmins"); index++ {
		adminPrefix := fmt.Sprintf("%s%d", "admin", index)
		code := data.Text(adminPrefix + "Code")
		nationalIdentifier := data.Text(adminPrefix + "NationalIdentifier")
		name := data.Text(adminPrefix + "Name")
		mobileNumber := data.Text(adminPrefix + "Mobile")
		averageRating := 0.0
		trainingCertificate := ""
		admins = append(admins, &models.Vaccinator{
			Code:                &code,
			NationalIdentifier:  &nationalIdentifier,
			Name:                &name,
			FacilityIds:         []string{facilityCode},
			MobileNumber:        &mobileNumber,
			Status:              &adminStatus,
			AverageRating:       &averageRating,
			Signatures:          []*models.Signature{},
			TrainingCertificate: &trainingCertificate,
		})
	}
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
	services.MakeRegistryCreateRequest(facility, "Facility")
	sendFacilityRegisteredNotification(facility)
	for _, mobile := range facility.Admins {
		//create keycloak user for
		log.Infof("Creating administrative login for the facility :%s [%s]", facility.FacilityName, mobile)
		userRequest := KeyCloakUserRequest{
			Username: *mobile.MobileNumber,
			Enabled:  true,
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

func sendFacilityRegisteredNotification(facility models.Facility) {
	buf := bytes.Buffer{}
	err := facilityRegisteredTemplate.Execute(&buf, facility)
	if err == nil {
		kafkaServices.PublishNotificationMessage("mailto:"+facility.Email, "DIVOC - Facility registration", buf.String())
	}
}
