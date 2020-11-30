package pkg

import (
	"errors"
	"fmt"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
	"strings"
)

type KeyCloakUserRequest struct {
	Username   string                 `json:"username"`
	Enabled    string                 `json:"enabled"`
	Attributes KeycloakUserAttributes `json:"attributes"`
}

type KeycloakUserAttributes struct {
	MobileNumber []string `json:"mobile_number"`
	EmployeeID   string   `json:"employee_id"`
	FullName     string   `json:"full_name"`
	FacilityCode string   `json:"facility_code"`
}

func CreateKeycloakUser(user KeyCloakUserRequest, authHeader string) (*req.Resp, error) {
	return req.Post(config.Config.Keycloak.Url+"/admin/realms/divoc/users", req.BodyJSON(user),
		req.Header{"Authorization": authHeader},
	)
}

func isUserCreatedOrAlreadyExists(resp *req.Resp) bool {
	return resp.Response().StatusCode == 201 || resp.Response().StatusCode == 409
}

func getKeycloakUserId(resp *req.Resp, userRequest KeyCloakUserRequest, authHeader string) string {
	userUrl := resp.Response().Header.Get("Location") //https://divoc.xiv.in/keycloak/auth/admin/realms/divoc/users/f8c7067d-c0c8-4518-95b1-6681afbbf986
	slices := strings.Split(userUrl, "/")
	var keycloakUserId = ""
	if len(slices) > 1 {
		keycloakUserId = strings.Split(userUrl, "/")[len(slices)-1]
		log.Info("Key cloak user id is ", keycloakUserId) //d9438bdf-68cb-4630-8093-fd36a5de5db8
	} else {
		log.Info("No user id in response checking with keycloak for the userid ", userRequest.Username)
		keycloakUserId, _ = searchAndGetKeyCloakUserId(userRequest.Username, authHeader)
	}
	return keycloakUserId
}

func searchAndGetKeyCloakUserId(username string, authHeader string) (string, error) {
	url := config.Config.Keycloak.Url + "/admin/realms/divoc/users?username=" + username + "&exact=true"
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

func ensureRoleAccess(userId string, clientId string, rolePayload string, authHeader string) error {

	roleUpdateUrl := config.Config.Keycloak.Url + "/admin/realms/divoc/users/" + userId + "/role-mappings/clients/" + clientId

	log.Info("POST ", roleUpdateUrl)
	response, err := req.Post(roleUpdateUrl, req.BodyJSON(rolePayload), req.Header{"Authorization": authHeader})
	if err != nil {
		log.Errorf("Error while updating role for the user %s", userId)
		return errors.New("Error while updating the role for the user")
	}
	log.Infof("Updating role on keycloak %d : %s", response.Response().StatusCode, response.String())
	if response.Response().StatusCode != 204 {
		log.Errorf("Error while updating role, status code %s", response.Response().StatusCode)
		return errors.New("Error while adding role for " + userId)
	}
	return nil
}

func addUserToGroup(userId string, groupId string, authHeader string) error {
	addUserToGroupURL := config.Config.Keycloak.Url + "/admin/realms/divoc/users/" + userId + "/groups/" + groupId
	log.Info("POST ", addUserToGroupURL)
	payload := fmt.Sprintf(`{ 
							"userId": "%s",
							"groupId": "%s", 
							"realm": "%s" }`, userId, groupId, config.Config.Keycloak.Realm)
	response, err := req.Put(addUserToGroupURL, req.BodyJSON(payload), req.Header{"Authorization": authHeader})
	if err != nil {
		log.Errorf("Error while adding user %s to group %s", userId, groupId)
		return errors.New("Error while adding user to group")
	}
	log.Infof("Added user to group on keycloak %d : %s", response.Response().StatusCode, response.String())
	if response.Response().StatusCode != 204 {
		log.Errorf("Error while adding user to group, status code %s", response.Response().StatusCode)
		return errors.New("Error while adding user to group for " + userId + "" + groupId)
	}
	return nil
}

func getFacilityUsers(facilityCode string, authHeader string) ([]*models.FacilityStaff, error) {
	url := config.Config.Keycloak.Url + "/realms/divoc/facility/" + facilityCode + "/users"
	log.Info("Checking with keycloak for facility code mapping ", facilityCode)
	resp, err := req.Get(url, req.Header{"Authorization": authHeader})
	if err != nil {
		return nil, err
	}
	log.Infof("Got response %+v", resp.String())
	type FacilityStaff struct {
		UserName   string                 `json:"userName"`
		Attributes map[string]interface{} `json:"attributes"`
	}
	var responseObject []FacilityStaff
	if err := resp.ToJSON(&responseObject); err == nil {
		var facilityUsers []*models.FacilityStaff
		for _, user := range responseObject {
			var employeeId, fullName, mobileNumber string
			if v, ok := user.Attributes["employee_id"]; ok {
				employeeId = v.(string)
			}
			if v, ok := user.Attributes["mobile_number"]; ok {
				mobileNumber = v.([]interface{})[0].(string)
			}
			if v, ok := user.Attributes["full_name"]; ok {
				fullName = v.(string)
			}
			facilityUsers = append(facilityUsers, &models.FacilityStaff{
				EmployeeID:   employeeId,
				MobileNumber: mobileNumber,
				Name:         fullName,
				RoleID:       "",
			})
		}
		return facilityUsers, nil
	}
	return nil, errors.New("Unable to get userid from keycloak")
}
