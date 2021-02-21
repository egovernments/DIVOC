package pkg

import (
	"errors"
	kernelService "github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
)

func getFacilityProgramSchedule(facilityId string, programId string) (map[string]interface{}, error) {
	entityType := "FacilityProgramSlot"
	limit, offset := getLimitAndOffset(nil, nil)
	filter := map[string]interface{}{
		"facilityId": map[string]interface{}{
			"eq": facilityId,
		},
		"programId": map[string]interface{}{
			"eq": programId,
		},
	}
	response, err := kernelService.QueryRegistry(entityType, filter, limit, offset)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return nil, err
	}

	respArr, ok := response[entityType].([]interface{})
	if !ok {
		log.Errorf("Error while converting to interface", response[entityType])
		return nil, errors.New("error while converting to interface")
	}

	if len(respArr) > 0 {
		return respArr[0].(map[string]interface{}), nil
	}

	return nil, errors.New("no entry found in DB")
}
