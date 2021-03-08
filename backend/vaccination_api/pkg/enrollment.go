package pkg

import (
	"encoding/json"
	"errors"

	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/api/swagger_gen/restapi/operations/vaccination"
	"github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
)

func filterEnrollemntAppointments(enrollments []*models.Enrollment, criteria func(ea *models.EnrollmentAppointmentsItems0) bool ) []*models.Enrollment {
	var relEnrollments []*models.Enrollment
	for _, enrmt:= range enrollments {
		var relAppointments []*models.EnrollmentAppointmentsItems0
		for _, apnt := range enrmt.Appointments {
			if criteria(apnt) {
				relAppointments = append(relAppointments, apnt)
			}
		}
		if len(relAppointments) > 0 {
			enrmt.Appointments = relAppointments
			relEnrollments = append(relEnrollments, enrmt)
		}
	}
	return relEnrollments
}

func findEnrollmentScopeAndCode(scopeID string, code string, limit int, offset int) (*models.Enrollment, error) {
	typeID := "Enrollment"
	filter := map[string]interface{}{
		"code": map[string]interface{}{
			"eq": code,
		},
		"appointments.enrollmentScopeId": map[string]interface{}{
			"eq": scopeID,
		},
	}
	if enrollmentsJSON, err := services.QueryRegistry(typeID, filter, limit, offset); err == nil {
		log.Infof("Enrollments %+v", enrollmentsJSON)
		if jsonArray, err := json.Marshal(enrollmentsJSON["Enrollment"]); err == nil {
			var listOfEnrollments []*models.Enrollment //todo: we can rename preEnrollment to Enrollment
			err := json.Unmarshal(jsonArray, &listOfEnrollments)
			if err != nil {
				log.Errorf("JSON marshalling error for enrollment list %+v", jsonArray)
				return nil, errors.New("marshalling error for enrollment list response")
			}
			log.Infof("Number of enrollments %v", len(listOfEnrollments))
			if len(listOfEnrollments) >= 1 {
				log.Infof("Enrollment %+v", listOfEnrollments[0])
				return filterEnrollemntAppointments(listOfEnrollments,func(ea *models.EnrollmentAppointmentsItems0) bool {
						return ea.EnrollmentScopeID == scopeID
					})[0], nil
			}
			log.Infof("No enrollment found for the scope %s code %s", scopeID, code)
			return nil, errors.New("no enrollment found")
		}
	}
	return nil, errors.New("unable to get the enrollment " + code)
}

func findEnrollmentsForScope(facilityCode string, params vaccination.GetPreEnrollmentsForFacilityParams) ([]*models.Enrollment, error) {
	limit, offset := getLimitAndOffset(params.Limit, params.Offset)
	typeID := "Enrollment"
	filter := map[string]interface{}{
		"appointments.enrollmentScopeId": map[string]interface{}{
			"eq": facilityCode,
		},
		"appointments.certified": map[string]interface{}{
			"eq": false,
		},
	}
	if params.Date != nil {
		filter["appointments.appointmentDate"] = map[string]interface{}{
			"eq": params.Date.String(),
		}
	}

	if enrollmentsJSON, err := services.QueryRegistry(typeID, filter, limit, offset); err == nil {
		log.Info("Response ", enrollmentsJSON)
		if jsonArray, err := json.Marshal(enrollmentsJSON["Enrollment"]); err == nil {
			var listOfEnrollments []*models.Enrollment //todo: we can rename preEnrollment to Enrollment
			err := json.Unmarshal(jsonArray, &listOfEnrollments)
			if err != nil {
				log.Errorf("JSON marshalling error for enrollment list %+v", jsonArray)
				return nil, errors.New("marshalling error for enrollment list response")
			}
			log.Infof("Number of enrollments %v", len(listOfEnrollments))
			return filterEnrollemntAppointments(listOfEnrollments, func(ea *models.EnrollmentAppointmentsItems0) bool {
				facilityCodeMatch := ea.EnrollmentScopeID == facilityCode
				appointmentDateMatch := params.Date == nil || ea.AppointmentDate.String() == params.Date.String()
				certifiedMatch := ea.Certified == nil || !*ea.Certified
				return facilityCodeMatch && appointmentDateMatch && certifiedMatch
			}), nil
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
