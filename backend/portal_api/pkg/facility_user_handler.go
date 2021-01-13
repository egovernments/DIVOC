package pkg

import (
	"errors"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
)

func GetFacilityUsers(authHeader string) ([]*models.FacilityUser, error) {
	bearerToken, err := getToken(authHeader)
	claimBody, err := getClaimBody(bearerToken)
	if err != nil {
		log.Errorf("Error while parsing token : %s", bearerToken)
		return nil, err
	}
	if claimBody.FacilityCode == "" {
		return nil, errors.New("unauthorized")
	}
	users, err := getFacilityUsers(claimBody.FacilityCode)

	return users, err
}

func CreateFacilityUser(user *models.FacilityUser, authHeader string) error {
	userRequest, e := getKeycloakUserRepFromFacilityUserModel(authHeader, user)
	if e != nil {
		return e
	}
	resp, err := CreateKeycloakUser(userRequest)
	log.Info("Created keycloak user ", resp.Response().StatusCode, " ", resp.String())
	if err != nil || !isUserCreatedOrAlreadyExists(resp) {
		log.Errorf("Error while creating keycloak user : %s", user.MobileNumber)
		return err
	} else {
		log.Info("Setting up roles for the user ", user.MobileNumber)
		keycloakUserId := getKeycloakUserId(resp, userRequest)
		if keycloakUserId != "" {
			_ = addUserToGroup(keycloakUserId, user.Groups[0].ID)
		} else {
			log.Error("Unable to map keycloak user id for ", user.MobileNumber)
		}
	}
	return nil
}

func UpdateFacilityUser(user *models.FacilityUser, authHeader string) error {
	// get the user from keycloak
	keycloakUserId, err := searchAndGetKeyCloakUserId(user.MobileNumber)
	if err != nil {
		log.Errorf("Error while getting userId with username %s from keycloak", user.MobileNumber)
		return err
	}

	// update user in keycloak with newer user details
	userRequest, e := getKeycloakUserRepFromFacilityUserModel(authHeader, user)
	if e != nil {
		return e
	}
	resp, err := UpdateKeycloakUser(keycloakUserId, userRequest)
	log.Info("Updated keycloak user ", resp.Response().StatusCode, " ", resp.String())
	if err != nil {
		log.Errorf("Error while updating user %s", user.MobileNumber)
		return err
	} else {
		if resp.Response().StatusCode == 200 {
			var responseObject FacilityUserResponse
			if err := resp.ToJSON(&responseObject); err != nil {
				log.Errorf("Error in parsing json response from keycloak %+v", err)
			} else {
				// check if group has changed, if yes, delete the old and update the new
				if hasUserGroupChanged(user.Groups, responseObject.Groups) {
					log.Info("Updating roles for the user ", user.MobileNumber)
					updateUserGroupForUser(responseObject.ID, user.Groups, responseObject.Groups)
				}
			}
		}
	}
	return nil
}

func getKeycloakUserRepFromFacilityUserModel(authHeader string, user *models.FacilityUser) (KeyCloakUserRequest, error) {
	bearerToken, err := getToken(authHeader)
	claimBody, err := getClaimBody(bearerToken)
	if err != nil {
		log.Errorf("Error while parsing token : %s", bearerToken)
		return KeyCloakUserRequest{}, err
	}
	userRequest := KeyCloakUserRequest{
		Username: user.MobileNumber,
		Enabled:  "true",
		Attributes: KeycloakUserAttributes{
			MobileNumber: []string{user.MobileNumber},
			EmployeeID:   user.EmployeeID,
			FullName:     user.Name,
			FacilityCode: claimBody.FacilityCode,
		},
	}
	return userRequest, nil
}

func updateUserGroupForUser(keycloakUserId string, existingUserGroups []*models.UserGroup, newUserGroups []*models.UserGroup) {
	// delete user from existing groups
	for _, g := range existingUserGroups {
		_ = deleteUserFromGroup(keycloakUserId, g.ID)
	}

	// add user to new groups
	for _, g := range newUserGroups {
		_ = addUserToGroup(keycloakUserId, g.ID)
	}
}

func hasUserGroupChanged(newGroups []*models.UserGroup, existingGroups []*models.UserGroup) bool {
	if (newGroups == nil) != (existingGroups == nil) {
		return false
	}

	var newGroupIds []string
	var existingGroupIds []string
	for _, g := range newGroups {
		if g != nil {
			newGroupIds = append(newGroupIds, g.ID)
		}
	}
	for _, g := range existingGroups {
		if g != nil{
			existingGroupIds = append(existingGroupIds, g.ID)
		}
	}

	return !isEqual(newGroupIds, existingGroupIds)

}

func GetFacilityGroups() ([]*models.UserGroup, error) {
	return getUserGroups("facility")
}
