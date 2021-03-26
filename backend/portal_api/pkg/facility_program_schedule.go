package pkg

import (
	"errors"
	"sort"

	kernelService "github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
)

func getFacilityProgramSchedule(facilityId string, programId string) (map[string]interface{}, error) {
	res, err := getAllFacilitySchedules(&facilityId, &programId)
	if err != nil {
		return nil, err
	}
	return res[0].(map[string]interface{}), nil
}

func getAllFacilitySchedules(facilityId *string, programId *string) ([]interface{}, error) {
	entityType := "FacilityProgramSlot"
	limit, offset := getLimitAndOffset(nil, nil)
	filter := map[string]interface{}{}
	if facilityId != nil {
		filter["facilityId"] = map[string]interface{}{"eq": *facilityId}
	}
	if programId != nil {
		filter["programId"] = map[string]interface{}{"eq": *programId}
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
		for _ , res := range respArr {
			// sort the appointment schedules
			appointmentSchedules := res.(map[string]interface{})["appointmentSchedule"].([]interface{})
			sort.Slice(appointmentSchedules, func(i, j int) bool {
				return appointmentSchedules[i].(map[string]interface{})["startTime"].(string) < appointmentSchedules[j].(map[string]interface{})["startTime"].(string)
			})
			response["appointmentSchedule"] = appointmentSchedules
		}
		return respArr, nil
	}
	return nil, errors.New("no entry found in DB")
}