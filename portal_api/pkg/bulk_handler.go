package pkg

import (
	"errors"
	"fmt"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/imroc/req"
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
		SerialNum:          &serialNum,
		MobileNumber:       &mobileNumber,
		NationalIdentifier: &nationalIdentifier,
		OperatorCode:       &operatorCode,
		OperatorName:       &operatorName,
		Status:             &status,
		FacilityIds:        facilityIds,
		AverageRating: &averageRating,
		Signatures: []*models.Signature{},
		TrainingCertificate: &trainingCertificate,
	}
	makeRegistryCreateRequest(vaccinator, "Vaccinator")
	return nil
}

type KeyCloakUserRequest struct {
	Username string `json:"username"`
	Enabled string `json:"enabled"`
	Attributes struct{
		MobileNumber []string `json:"mobile_number"`
	} `json:"attributes"`
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
		SerialNum: serialNum,
		FacilityCode: data.Text("facilityCode"),
		FacilityName: data.Text("facilityName"),
		Contact: data.Text("contact"),
		OperatingHourStart: data.int64("operatingHourStart"),
		OperatingHourEnd: data.int64("operatingHourEnd"),
		Category: data.Text("category"),
		Type: data.Text("type"),
		Status: data.Text("status"),
		Admins: strings.Split(data.Text("admins"), ","),
		Address: &models.Address{
			AddressLine1: &addressline1,
			AddressLine2: &addressline2,
			District: &district,
			State: &state,
			Pincode: &pincode,
		},
	}
	makeRegistryCreateRequest(facility, "Facility")
	for _, mobile := range facility.Admins {
		//create keycloak user for
		log.Infof("Creating administrative login for the facility :%s [%s]", facility.FacilityName, mobile)
		resp, err := req.Post(config.Config.Keycloak.Url + "/admin/realms/divoc/users", req.BodyJSON(KeyCloakUserRequest{
			Username: mobile,
			Enabled: "true",
			Attributes: struct {
				MobileNumber []string `json:"mobile_number"`
			}{
				MobileNumber: []string{mobile},
			},
		}),
			req.Header{"Authorization":authHeader},
		)
		log.Info("Created keycloak user " , resp.Response().StatusCode, " ", resp.String());
		if err != nil || !isUserCreatedOrAlreadyExists(resp) {
			log.Errorf("Error while creating keycloak user : %s", mobile)
		} else {
			log.Info("Setting up roles for the user ", mobile)
			userUrl := resp.Response().Header.Get("Location") //https://divoc.xiv.in/keycloak/auth/admin/realms/divoc/users/f8c7067d-c0c8-4518-95b1-6681afbbf986
			slices := strings.Split(userUrl, "/")
			var keycloakUserId = ""
			if len(slices) > 1 {
				keycloakUserId = strings.Split(userUrl, "/")[len(slices)-1]
				log.Info("Key cloak user id is ", keycloakUserId) //d9438bdf-68cb-4630-8093-fd36a5de5db8
			} else {
				log.Info("No user id in response checking with keycloak for the userid ", mobile)
				keycloakUserId, err = getKeyCloakUserId(mobile, authHeader)
			}
			if keycloakUserId != "" {
				_ = ensureRoleAccess(keycloakUserId, "facility-admin", authHeader)
			} else {
				log.Error("Unable to map keycloak user id for ", mobile)
			}
		}

	}
	return nil
}

func getKeyCloakUserId(username string, authHeader string) (string, error) {
	url :=config.Config.Keycloak.Url + "/admin/realms/divoc/users?username=" + username + "&exact=true"
	log.Info("Checking with keycloak for userid mapping ", url)
	resp, err := req.Get(url, req.Header{"Authorization": authHeader})
	if err != nil {
		return "", err
	}
	log.Infof("Got response %+v", resp.String())
	type JSONObject map[string]interface{}
	var responseObject []JSONObject
	if err := resp.ToJSON(&responseObject); err == nil {
		if userId, ok := responseObject[0]["id"].(string); ok {
			log.Info("Keycloak user id ", userId)
			return userId, nil
		}
	}
	return "", errors.New("Unable to get userid from keycloak")
}

func isUserCreatedOrAlreadyExists(resp *req.Resp) bool {
	return (resp.Response().StatusCode == 201 || resp.Response().StatusCode == 409)
}

func ensureRoleAccess(id string, s string, authHeader string) error {
	clientId := config.Config.Keycloak.FacilityAdmin.ClientId
	roleId := config.Config.Keycloak.FacilityAdmin.RoleId
	roleUpdateUrl := "https://divoc.xiv.in/keycloak/auth/admin/realms/divoc/users/" + id + "/role-mappings/clients/" + clientId
	payload := fmt.Sprintf(`[ { "id": "%s",
		"name": "%s", 
		"composite": false, 
		"clientRole": true, 
		"containerId": "%s" } ]`, roleId, config.Config.Keycloak.FacilityAdmin.RoleName, clientId)
	log.Info("POST ", roleUpdateUrl)
	response, err := req.Post(roleUpdateUrl, req.BodyJSON(payload), req.Header{"Authorization": authHeader})
	if err != nil {
		log.Errorf("Error while updating role for the user %s", id)
		return errors.New("Error while updating the role for the user")
	}
	log.Infof("Updating role on keycloak %d : %s", response.Response().StatusCode, response.String())
	if response.Response().StatusCode != 204 {
		log.Errorf("Error while updating role, status code %s", response.Response().StatusCode)
		return errors.New("Error while adding role for " + id)
	}
	return nil
}