package services

import "github.com/divoc/kernel_library/services"

const FacilityEntity string = "Facility"

func GetFacilityByCode(facilityCode string) (map[string]interface{}, error) {
	filter := map[string]interface{}{
		"facilityCode": map[string]interface{}{
			"eq": facilityCode,
		},
	}
	return services.QueryRegistry(FacilityEntity, filter)
}
