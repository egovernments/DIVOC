package services

import (
	"encoding/json"
	"github.com/divoc/registration-api/config"
	"strconv"
	"time"

	"github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
)

const FacilityProgramSlot = "FacilityProgramSlot"

type daySchedule map[time.Weekday][]map[string]string
type ProgramDaySchedule map[string]daySchedule

var DaysMap = map[string]time.Weekday{
	"sun": time.Sunday,
	"mon": time.Monday,
	"tue": time.Tuesday,
	"wed": time.Wednesday,
	"thu": time.Thursday,
	"fri": time.Friday,
	"sat": time.Saturday,
}

type FacilityMinifiedDetails struct {
	FacilityName string `json:"facilityName"`
	State        string `json:"state"`
	Pincode      string `json:"pincode"`
	District     string `json:"district"`
}

func GetFacilityAppointmentSchedule(facilityId string) ProgramDaySchedule {
	filter := map[string]interface{}{
		"facilityId": map[string]interface{}{
			"eq": facilityId,
		},
	}
	facilitySchedulesArr, err := services.QueryRegistry(FacilityProgramSlot, filter, 100, 0)
	if err == nil {
		facilitySchedules := facilitySchedulesArr[FacilityProgramSlot].([]interface{})
		if len(facilitySchedules) > 0 {
			programWiseDaySchedules := convertToProgramWiseDaySchedule(facilitySchedules)
			log.Infof("%v", programWiseDaySchedules)
			return programWiseDaySchedules
		}
	}
	return ProgramDaySchedule{}
}

func convertToProgramWiseDaySchedule(schedules []interface{}) ProgramDaySchedule {
	programWiseDaySchedule := make(ProgramDaySchedule)
	for _, scheduleObj := range schedules {
		schedule := scheduleObj.(map[string]interface{})
		programId := schedule["programId"].(string)
		programWiseDaySchedule[programId] = make(daySchedule)
		for _, appointmentScheduleObj := range schedule["appointmentSchedule"].([]interface{}) {
			appointmentSchedule := appointmentScheduleObj.(map[string]interface{})
			startTime := appointmentSchedule["startTime"].(string)
			endTime := appointmentSchedule["endTime"].(string)
			if appointmentSchedule["days"] != nil {
				for _, dayScheduleObj := range appointmentSchedule["days"].([]interface{}) {
					dayScheduleObj := dayScheduleObj.(map[string]interface{})
					day := dayScheduleObj["day"].(string)
					schedule := map[string]string{
						"startTime": startTime,
						"endTime":   endTime,
					}
					if dayScheduleObj["maxAppointments"] != nil {
						schedule["maxAppointments"] = strconv.Itoa(int(dayScheduleObj["maxAppointments"].(float64)))
					}
					weekday := DaysMap[day]
					if programWiseDaySchedule[programId] == nil {
						programWiseDaySchedule[programId] = make(daySchedule)
					}
					if programWiseDaySchedule[programId][weekday] == nil {
						programWiseDaySchedule[programId][weekday] = []map[string]string{}
					}
					programWiseDaySchedule[programId][weekday] = append(programWiseDaySchedule[programId][weekday], schedule)
				}
			}
		}
	}
	return programWiseDaySchedule
}

func GetMinifiedFacilityDetails(facilityCode string) FacilityMinifiedDetails {
	redisKey := facilityCode + "-info"
	var facilityDetails FacilityMinifiedDetails
	if cachedFacilityDetails, err := GetValue(redisKey); err == nil {
		if err = json.Unmarshal([]byte(cachedFacilityDetails), &facilityDetails); err != nil {
			log.Errorf("Error in marshalling json %+v", err)
		}
	} else {
		log.Errorf("Unable to get the value in Cache (%v)", err)
		filter := map[string]interface{}{}
		filter["facilityCode"] = map[string]interface{}{
			"eq": facilityCode,
		}
		if responseFromRegistry, err := services.QueryRegistry("Facility", filter, 100, 0); err == nil {
			if facilityArr := responseFromRegistry["Facility"].([]interface{}); len(facilityArr) > 0 {
				facility := facilityArr[0].(map[string]interface{})
				facilityDetails.FacilityName = facility["facilityName"].(string)
				facilityAddress := facility["address"].(map[string]interface{})
				facilityDetails.State = facilityAddress["state"].(string)
				facilityDetails.Pincode = facilityAddress["pincode"].(string)
				facilityDetails.District = facilityAddress["district"].(string)
				if facilityDetailsBytes, err := json.Marshal(facilityDetails); err != nil {
					log.Errorf("Error in Marshaling the facility details %+v", err)
				} else {
					err := SetValue(redisKey, facilityDetailsBytes, time.Duration(config.Config.Redis.CacheTTL))
					if err != nil {
						log.Errorf("Unable to set the value in Cache (%v)", err)
					}
				}
			}
		} else {
			log.Errorf("Error occurred while fetching the details of facility (%v)", err)
		}
	}
	return facilityDetails
}
