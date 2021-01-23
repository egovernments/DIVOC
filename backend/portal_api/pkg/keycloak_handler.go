package pkg

import (
	"errors"
	"fmt"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
	"strings"
	cache "github.com/patrickmn/go-cache"
	"time"
	"encoding/json"
	"strconv"
)

const RateLimitAttrSuffix = "_rate"
var cacheStore = cache.New(5*time.Minute, 10*time.Minute)

type KeyCloakUserRequest struct {
	Username   string                 `json:"username"`
	Enabled    bool                   `json:"enabled"`
	Attributes KeycloakUserAttributes `json:"attributes"`
}

type KeycloakUserAttributes struct {
	MobileNumber []string `json:"mobile_number"`
	EmployeeID   string   `json:"employee_id"`
	FullName     string   `json:"full_name"`
	FacilityCode string   `json:"facility_code"`
	VaccinationRateLimits []*models.VaccinationRateLimit	`json:"-"`
}

func (k KeycloakUserAttributes) MarshalJSON() ([]byte, error) {
	attributes := map[string]interface{}{
		"mobile_number": k.MobileNumber,
		"employee_id": k.EmployeeID,
		"full_name": k.FullName,
		"facility_code": k.FacilityCode,
	}
	for _, vrl := range k.VaccinationRateLimits {
		attributes[vrl.ProgramName + RateLimitAttrSuffix] = vrl.RateLimit
	}
	return json.Marshal(attributes)
}

func getVaccinationRateLimits(attributes map[string]interface{}) []*models.VaccinationRateLimit {
	vaccinationRateLimits := []*models.VaccinationRateLimit{}
	for key, value := range attributes {
		if strings.HasSuffix(key, RateLimitAttrSuffix) {
			var rateLimit int
			if v, ok := value.([]interface{}); ok {
				rateLimit, _ = strconv.Atoi(v[0].(string));
			} else {
				rateLimit = value.(int)
			}
			vaccinationRateLimits = append(vaccinationRateLimits, &models.VaccinationRateLimit{
				ProgramName: key[ : len(key) - len(RateLimitAttrSuffix) ],
				RateLimit: int64(rateLimit),
			})
		}
	}
	return vaccinationRateLimits
}

func (k *KeycloakUserAttributes) UnmarshalJson(data []byte) error {
	attributes := map[string]interface{}{}
	if err := json.Unmarshal(data, &attributes); err != nil {
		return err
	}
	k.MobileNumber = attributes["mobile_number"].([]string)
	k.EmployeeID = attributes["employee_id"].(string)
	k.FullName = attributes["full_name"].(string)
	k.FacilityCode = attributes["facility_code"].(string)
	k.VaccinationRateLimits = getVaccinationRateLimits(attributes)
	return nil
}

func CreateKeycloakUser(user KeyCloakUserRequest) (*req.Resp, error) {
	authHeader := getAuthHeader()
	url := config.Config.Keycloak.Url + "/admin/realms/" + config.Config.Keycloak.Realm + "/users"
	log.Infof("creating user %s : %s, %+v", url, authHeader, user)
	return req.Post(url, req.BodyJSON(user),
		req.Header{"Authorization": authHeader},
	)
}

func UpdateKeycloakUser(keycloakUserId string, user KeyCloakUserRequest) (*req.Resp, error) {
	authHeader := getAuthHeader()
	url := config.Config.Keycloak.Url + "/admin/realms/" + config.Config.Keycloak.Realm + "/users/" + keycloakUserId
	log.Infof("Updating user %s body:  %+v", url, user)
	return req.Put(url, req.BodyJSON(user),
		req.Header{"Authorization": authHeader},
	)
}

func DeleteKeycloakUser(keycloakUserId string) (*req.Resp, error) {
	authHeader := getAuthHeader()
	url := config.Config.Keycloak.Url + "/admin/realms/" + config.Config.Keycloak.Realm + "/users/" + keycloakUserId
	log.Infof("Deleting user %s ", url)
	return req.Delete(url, req.Header{"Authorization": authHeader}, )
}

func isUserCreatedOrAlreadyExists(resp *req.Resp) bool {
	return resp.Response().StatusCode == 201 || resp.Response().StatusCode == 409
}

func getKeycloakUserId(resp *req.Resp, userRequest KeyCloakUserRequest) string {
	userUrl := resp.Response().Header.Get("Location") //https://divoc.xiv.in/keycloak/auth/admin/realms/divoc/users/f8c7067d-c0c8-4518-95b1-6681afbbf986
	slices := strings.Split(userUrl, "/")
	var keycloakUserId = ""
	if len(slices) > 1 {
		keycloakUserId = strings.Split(userUrl, "/")[len(slices)-1]
		log.Info("Key cloak user id is ", keycloakUserId) //d9438bdf-68cb-4630-8093-fd36a5de5db8
	} else {
		log.Info("No user id in response checking with keycloak for the userid ", userRequest.Username)
		keycloakUserId, _ = searchAndGetKeyCloakUserId(userRequest.Username)
	}
	return keycloakUserId
}

func searchAndGetKeyCloakUserId(username string) (string, error) {
	authHeader := getAuthHeader()
	url := config.Config.Keycloak.Url + "/admin/realms/" + config.Config.Keycloak.Realm + "/users?username=" + username + "&exact=true"
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

	roleUpdateUrl := config.Config.Keycloak.Url + "/admin/realms/" + config.Config.Keycloak.Realm + "/users/" + userId + "/role-mappings/clients/" + clientId

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

func addUserToGroup(userId string, groupId string) error {
	authHeader := getAuthHeader()
	addUserToGroupURL := config.Config.Keycloak.Url + "/admin/realms/" + config.Config.Keycloak.Realm + "/users/" + userId + "/groups/" + groupId
	log.Info("PUT ", addUserToGroupURL)
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

func getUserGroups(keycloakUserId string) (*req.Resp, error) {
	authHeader := getAuthHeader()
	url := config.Config.Keycloak.Url + "/admin/realms/" + config.Config.Keycloak.Realm + "/users/" + keycloakUserId + "/groups"
	log.Infof("Updating user %s ", url)
	return req.Get(url, req.Header{"Authorization": authHeader})
}

func deleteUserFromGroup(userId string, groupId string) error {
	authHeader := getAuthHeader()
	addUserToGroupURL := config.Config.Keycloak.Url + "/admin/realms/" + config.Config.Keycloak.Realm + "/users/" + userId + "/groups/" + groupId
	log.Info("DELETE ", addUserToGroupURL)
	payload := fmt.Sprintf(`{ 
							"userId": "%s",
							"groupId": "%s", 
							"realm": "%s" }`, userId, groupId, config.Config.Keycloak.Realm)
	response, err := req.Delete(addUserToGroupURL, req.BodyJSON(payload), req.Header{"Authorization": authHeader})
	if err != nil {
		log.Errorf("Error while deleting user %s to group %s", userId, groupId)
		return errors.New("Error while deleting user to group")
	}
	log.Infof("Deleted user to group on keycloak %d : %s", response.Response().StatusCode, response.String())
	if response.Response().StatusCode != 204 {
		log.Errorf("Error while deleting user to group, status code %s", response.Response().StatusCode)
		return errors.New("Error while deleting user to group for " + userId + "" + groupId)
	}
	return nil
}

type FacilityUserResponse struct {
	ID         string                 `json:"id"`
	UserName   string                 `json:"userName"`
	Attributes map[string]interface{} `json:"attributes"`
	Groups     []*models.UserGroup    `json:"groups"`
	Enabled    bool                   `json:"enabled"`
}

func getFacilityUsers(facilityCode string, username string) ([]*models.FacilityUser, error) {
	authHeader := getAuthHeader()
	url := config.Config.Keycloak.Url + "/realms/" + config.Config.Keycloak.Realm + "/facility/" + facilityCode + "/users"
	log.Info("Checking with keycloak for facility code mapping ", facilityCode)
	resp, err := req.Get(url, req.Header{"Authorization": authHeader})
	if err != nil {
		return nil, err
	}
	log.Infof("Got response %+v", resp.String())

	var responseObject []FacilityUserResponse
	if err := resp.ToJSON(&responseObject); err == nil {
		var facilityUsers []*models.FacilityUser
		for _, user := range responseObject {
			if username != user.UserName {
				var employeeId, fullName, mobileNumber string
				if v, ok := user.Attributes["employee_id"]; ok {
					employeeId = v.([]interface{})[0].(string)
				}
				if v, ok := user.Attributes["mobile_number"]; ok {
					mobileNumber = v.([]interface{})[0].(string)
				}
				if v, ok := user.Attributes["full_name"]; ok {
					fullName = v.([]interface{})[0].(string)
				}
				facilityUsers = append(facilityUsers, &models.FacilityUser{
					ID:           user.ID,
					EmployeeID:   employeeId,
					MobileNumber: mobileNumber,
					Name:         fullName,
					Groups:       user.Groups,
					Enabled:      user.Enabled,
					VaccinationRateLimits: getVaccinationRateLimits(user.Attributes),
				})
			}
		}
		return facilityUsers, nil
	}
	return nil, errors.New("Unable to get userid from keycloak")
}

func isFacilityAdmin(user FacilityUserResponse) bool {
	if len(user.Groups) > 0 {
		for _, group := range user.Groups {
			if group.Name == "facility admin" {
				return true
			} // todo : check based on role
		}
	}
	return false
}
func getKeycloakGroups(groupSearchKey string) ([]*models.UserGroup, error) {
	authHeader := getAuthHeader()
	addUserToGroupURL := config.Config.Keycloak.Url + "/admin/realms/" + config.Config.Keycloak.Realm + "/groups?search=" + groupSearchKey
	log.Info("GET ", addUserToGroupURL)
	resp, err := req.Get(addUserToGroupURL, req.Header{"Authorization": authHeader})
	if err != nil {
		log.Errorf("Error while fetching user groups %s", groupSearchKey)
		return nil, err
	}
	if resp.Response().StatusCode != 200 {
		log.Errorf("Error while fetching user groups, status code %s", resp.Response().StatusCode)
		return nil, err
	}
	var userGroups []*models.UserGroup
	err = resp.ToJSON(&userGroups)
	if err == nil {
		return userGroups, nil
	}
	return nil, err
}

func getAuthHeader() string {

	if authToken, found := cacheStore.Get("authToken"); found {
		return "Bearer " + authToken.(string)
	}

	if token, done := getAuthToken(); done {
		cacheStore.Set("authToken", token, cache.DefaultExpiration)
		return "Bearer " + token
	}
	return ""
}

func getAuthToken() (string, bool) {
	url := config.Config.Keycloak.Url + "/realms/" + config.Config.Keycloak.Realm + "/protocol/openid-connect/token"
	if resp, err := req.Post(url, req.Param{
		"grant_type":    "client_credentials",
		"client_id":     "admin-api",
		"client_secret": config.Config.Keycloak.AdminApiClientSecret,
	}); err != nil {
		log.Errorf("Error in getting the token from keycloak %+v", err)
	} else {
		log.Debugf("Response %d %+v", resp.Response().StatusCode, resp)
		if resp.Response().StatusCode == 200 {
			responseObject := map[string]interface{}{}
			if err := resp.ToJSON(&responseObject); err != nil {
				log.Errorf("Error in parsing json response from keycloak %+v", err)
			} else {
				token := responseObject["access_token"].(string)
				return token, true
			}
		}
	}
	return "", false
}
