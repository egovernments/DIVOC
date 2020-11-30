package pkg

import "github.com/divoc/portal-api/swagger_gen/models"

func CreateFacilityStaff(staff *models.FacilityStaff, authHeader string) {
	_, _ = CreateKeycloakUser(KeyCloakUserRequest{
		Username: staff.MobileNumber,
		Enabled:  "true",
		Attributes: KeycloakUserAttributes{
			MobileNumber: []string{staff.MobileNumber},
			EmployeeID:   staff.EmployeeID,
			FullName:     staff.Name,
			FacilityCode: "",
		},
	}, authHeader)
}
