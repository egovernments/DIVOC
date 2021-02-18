package pkg

import (
	"errors"
	"net/http"

	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/pkg/services"
	"github.com/divoc/portal-api/pkg/utils"
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
	users, err := getFacilityUsers(claimBody.FacilityCode, claimBody.PreferredUsername)

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
			return errors.New("Unable to map keycloak user id for " + user.MobileNumber)
		}
	}
	return nil
}

func UpdateFacilityUser(user *models.FacilityUser, authHeader, facilityCode string) error {
	keycloakUserId := user.ID

	// update user in keycloak with newer user details
	userRequest := KeyCloakUserRequest{
		Username:   user.MobileNumber,
		Enabled:    user.Enabled,
		Attributes: KeycloakUserAttributes{
			MobileNumber: []string{user.MobileNumber},
			EmployeeID: user.EmployeeID,
			FullName: user.Name,
			FacilityCode: facilityCode,
			VaccinationRateLimits: user.VaccinationRateLimits,
		},
	}

	resp, err := UpdateKeycloakUser(keycloakUserId, userRequest)
	if err != nil {
		log.Errorf("Error while updating user %s", user.MobileNumber)
		return err
	} else {
		log.Infof("Updated keycloak user %s %+v ", resp.Response().StatusCode, resp.Response().Body)
		if resp.Response().StatusCode == http.StatusNoContent {
			// get groups for the user
			var responseObject []*models.UserGroup
			r, _ := getUserGroups(keycloakUserId)
			if err := r.ToJSON(&responseObject); err != nil {
				log.Errorf("Error in parsing json response from keycloak %+v", err)
			} else {
				// check if group has changed, if yes, delete the old and update the new
				if hasUserGroupChanged(user.Groups, responseObject) {
					log.Info("Updating roles for the user ", user.MobileNumber)
					updateUserGroupForUser(keycloakUserId, responseObject, user.Groups)
				}
				for _, group := range user.Groups {
					if group.Name == "facility admin" {
						return updateRegistryFacilityAdmin(facilityCode, user)
					}
				}
			}
		} else {
			return errors.New("update keycloak user call doesn't responded with 204 status")
		}
	}
	return nil
}

func updateRegistryFacilityAdmin(facilityCode string, user *models.FacilityUser) error {
	searchResponse, err := services.GetFacilityByCode(facilityCode, 1, 0)
	if err != nil {
		return err
	}
	facility := searchResponse["Facility"].([]interface{})[0].(map[string]interface{})
	var facilityAdmins []map[string]interface{}
	for _, obj := range facility["admins"].([]interface{}) {
		facilityAdmins = append(facilityAdmins, obj.(map[string]interface{}))
	}

	for _, fa := range facilityAdmins {
		if fa["osid"] == user.Osid {
			fa["name"] = user.Name
			fa["email"] = user.Email
			fa["mobile"] = user.MobileNumber
		}
	}
	
	updatedFacility := map[string]interface{}{
		"osid": facility["osid"].(string),
		"admins": facilityAdmins,
		"programs": facility["programs"],
	}
	if _, err := kernelService.UpdateRegistry("Facility", updatedFacility); err != nil {
		return err
	}
	return nil
}

func DeleteFacilityUser(keycloakUserId string) error {
	resp, err := DeleteKeycloakUser(keycloakUserId)
	if err != nil {
		log.Errorf("Error while deleting user %s", keycloakUserId)
		return err
	} else {
		log.Infof("Deleted keycloak user %s %+v ", resp.Response().StatusCode, resp.Response().Body)
		if resp.Response().StatusCode != http.StatusNoContent {
			return errors.New("delete keycloak user call doesn't responded with 204 status")
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
		Enabled:  user.Enabled,
		Attributes: KeycloakUserAttributes{
			MobileNumber: []string{user.MobileNumber},
			EmployeeID:   user.EmployeeID,
			FullName:     user.Name,
			FacilityCode: claimBody.FacilityCode,
			VaccinationRateLimits: user.VaccinationRateLimits,
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

	return !utils.IsEqual(newGroupIds, existingGroupIds)

}

func GetFacilityGroups() ([]*models.UserGroup, error) {
	return getKeycloakGroups("facility")
}
