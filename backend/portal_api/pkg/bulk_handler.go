package pkg

import (
	"bytes"
	"fmt"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/services"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"strconv"
	"strings"
	"text/template"
)

const FacilityRegistered = "facilityRegistered"

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
	kernelService.MakeRegistryCreateRequest(vaccinator, "Vaccinator")
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
	var admins []*models.FacilityAdmin
	var index int64
	facilityCode := data.Text("facilityCode")
	adminStatus := "Active"
	for index = 1; index <= data.int64("totalAdmins"); index++ {
		adminPrefix := fmt.Sprintf("%s%d", "admin", index)
		name := data.Text(adminPrefix + "Name")
		mobileNumber := data.Text(adminPrefix + "Mobile")
		admins = append(admins, &models.FacilityAdmin{
			Name:   name,
			Mobile: mobileNumber,
			Status: adminStatus,
		})
	}
	facility := models.Facility{
		SerialNum:          serialNum,
		FacilityCode:       facilityCode,
		FacilityName:       data.Text("facilityName"),
		Contact:            data.Text("contact"),
		OperatingHourStart: data.Text("operatingHourStart"),
		OperatingHourEnd:   data.Text("operatingHourEnd"),
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
	kernelService.MakeRegistryCreateRequest(facility, "Facility")
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
			},
		}

		resp, err := CreateKeycloakUser(userRequest)
		log.Infof("Create keycloak user %+v", resp)
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

func sendFacilityRegisteredNotification(facility models.Facility) {

	facilityRegisteredTemplateString := kernelService.FlagrConfigs.NotificationTemplates[FacilityRegistered].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[FacilityRegistered].Subject

	var facilityRegisteredTemplate = template.Must(template.New("").Parse(facilityRegisteredTemplateString))

	buf := bytes.Buffer{}
	err := facilityRegisteredTemplate.Execute(&buf, facility)
	if err == nil {
		services.PublishNotificationMessage("mailto:"+facility.Email, subject, buf.String())
	} else {
		log.Errorf("Failed generating notification template", err)
	}
}
