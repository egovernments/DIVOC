package pkg

import (
	"errors"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
	cache "github.com/patrickmn/go-cache"
	"strings"
	"time"
)

var cacheStore = cache.New(5*time.Minute, 10*time.Minute)

type KeyCloakUserRequest struct {
	Username   string                 `json:"username"`
	Enabled    string                 `json:"enabled"`
	Attributes KeycloakUserAttributes `json:"attributes"`
}

type KeycloakUserAttributes struct {
	MobileNumber []string `json:"mobile_number"`
}

func CreateRecipientUserId(mobile string) error {
	userRequest := KeyCloakUserRequest{
		Username: mobile,
		Enabled:  "true",
		Attributes: KeycloakUserAttributes{
			MobileNumber: []string{mobile},
		},
	}
	authHeader := "Bearer " + getAuthToken()
	resp, err := CreateKeycloakUser(userRequest, authHeader)
	log.Infof("Create keycloak user %d %s", resp.Response().StatusCode, resp.String())
	if err != nil || !isUserCreatedOrAlreadyExists(resp) {
		log.Errorf("Error while creating keycloak user : %s", mobile)
		return errors.New("error while creating keycloak user")
	} else {
		log.Infof("Setting up roles for the user %s", mobile)
		keycloakUserId := getKeycloakUserId(resp, userRequest, authHeader)
		if keycloakUserId != "" {
			_ = addUserToGroup(keycloakUserId, config.Config.Keycloak.RecipientGroupId, authHeader)
			return nil
		} else {
			log.Errorf("Unable to map keycloak user id for %s", mobile)
			return errors.New("unable to map keycloak user for recipient group")
		}
	}
}

func getAuthToken() string {
	if authToken, found := cacheStore.Get("authToken"); found {
		return authToken.(string)
	}

	url := config.Config.Keycloak.Url + "/realms/" + config.Config.Keycloak.Realm + "/protocol/openid-connect/token"
	if resp, err := req.Post(url, req.Param{
		"grant_type":    "client_credentials",
		"client_id":     "admin-api",
		"client_secret": config.Config.Keycloak.AdminApiClientSecret,
	}); err!=nil {
		log.Errorf("Error in getting the token from keycloak %+v", err)
	} else {
		log.Debugf("Response %d %+v",resp.Response().StatusCode, resp)
		if resp.Response().StatusCode == 200 {
			responseObject := map[string]interface{}{}
			if err := resp.ToJSON(&responseObject); err != nil {
				log.Errorf("Error in parsing json response from keycloak %+v", err)
			} else {
				token := responseObject["access_token"].(string)
				cacheStore.Set("authToken", token, cache.DefaultExpiration)
				return token
			}
		}
	}

	return config.Config.Keycloak.AuthHeader
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
	url := config.Config.Keycloak.Url + "/admin/realms/divoc/users"
	log.Info("Checking with keycloak for userid mapping ", url)
	resp, err := req.Get(url, req.QueryParam{"username": username, "exact": true}, req.Header{"Authorization": authHeader})
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
		log.Errorf("Error while adding user to group, status code %d", response.Response().StatusCode)
		return errors.New("Error while adding user to group for " + userId + "" + groupId)
	}
	return nil
}


