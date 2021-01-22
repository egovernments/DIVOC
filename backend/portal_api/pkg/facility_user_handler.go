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
	bearerToken, err := getToken(authHeader)
	claimBody, err := getClaimBody(bearerToken)
	if err != nil {
		log.Errorf("Error while parsing token : %s", bearerToken)
		return err
	}
	userRequest := KeyCloakUserRequest{
		Username: user.MobileNumber,
		Enabled:  "true",
		Attributes: KeycloakUserAttributes{
			MobileNumber: []string{user.MobileNumber},
			EmployeeID:   user.EmployeeID,
			FullName:     user.Name,
			FacilityCode: claimBody.FacilityCode,
			VaccinationRateLimits: user.VaccinationRateLimits,
		},
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

func GetFacilityGroups() ([]*models.UserGroup, error) {
	return getUserGroups("facility")
}
