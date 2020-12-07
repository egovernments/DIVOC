package pkg

import (
	"encoding/json"
	"errors"
	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
)

func findEnrollmentScopeAndCode(scopeId string, code string) (*models.PreEnrollment, error) {
	typeId := "Enrollment"
	filter := map[string]interface{}{
		"@type": map[string]interface{}{
			"eq": typeId,
		},
		"enrollmentScopeId": map[string]interface{}{
			"eq": scopeId,
		},
		"code": map[string]interface{}{
			"eq": code,
		},
	}
	if enrollmentsJson, err := services.QueryRegistry(typeId, filter); err == nil {
		log.Infof("Enrollments %+v", enrollmentsJson)
		enrollmentsJsonArray := enrollmentsJson["Enrollment"]
		if jsonArray, err := json.Marshal(enrollmentsJsonArray); err == nil {
			var listOfEnrollments []*models.PreEnrollment //todo: we can rename preEnrollment to Enrollment
			err := json.Unmarshal(jsonArray, &listOfEnrollments)
			if err != nil {
				log.Errorf("JSON marshalling error for enrollment list %+v", jsonArray)
				return nil, errors.New("marshalling error for enrollment list response")
			}
			log.Infof("Number of enrollments %v", len(listOfEnrollments))
			if len(listOfEnrollments) >= 1 {
				log.Infof("Enrollment %+v", listOfEnrollments[0])
				return listOfEnrollments[0], nil
			} else {
				log.Infof("No enrollment found for the scope %s code %s", scopeId, code)
				return nil, errors.New("no enrollment found")
			}
		}
	}
	return nil, errors.New("unable to get the enrollment " + code)
}

func findEnrollmentsForScope(facilityCode string) ([]*models.PreEnrollment, error) {
	typeId := "Enrollment"
	filter := map[string]interface{}{
		"@type": map[string]interface{}{
			"eq": typeId,
		},
		"enrollmentScopeId": map[string]interface{}{
			"eq": facilityCode,
		},
	}
	if enrollmentsJson, err := services.QueryRegistry(typeId, filter); err == nil {
		log.Info("Response ", enrollmentsJson)
		enrollmentsJsonArray := enrollmentsJson["Enrollment"]
		if jsonArray, err := json.Marshal(enrollmentsJsonArray); err == nil {
			var listOfEnrollments []*models.PreEnrollment //todo: we can rename preEnrollment to Enrollment
			err := json.Unmarshal(jsonArray, &listOfEnrollments)
			if err != nil {
				log.Errorf("JSON marshalling error for enrollment list %+v", jsonArray)
				return nil, errors.New("marshalling error for enrollment list response")
			}
			log.Infof("Number of enrollments %v", len(listOfEnrollments))
			return listOfEnrollments, nil
		}
	}
	return nil, nil
}

func getUserAssociatedFacility(authHeader string) (string, error) {
	bearerToken, err := auth.GetToken(authHeader)
	claimBody, err := auth.GetClaimBody(bearerToken)
	if err != nil {
		log.Errorf("Error while parsing token : %s", bearerToken)
		return "", err
	}
	if claimBody.FacilityCode == "" {
		return "", errors.New("unauthorized")
	}
	return claimBody.FacilityCode, nil
}
