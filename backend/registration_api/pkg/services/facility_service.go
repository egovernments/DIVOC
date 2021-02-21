package services

import (
	"github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
	"strconv"
	"time"
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
			for _, dayScheduleObj := range appointmentSchedule["days"].([]interface{}) {
				dayScheduleObj := dayScheduleObj.(map[string]interface{})
				day := dayScheduleObj["day"].(string)
				maxAppointments := strconv.Itoa(int(dayScheduleObj["maxAppointments"].(float64)))
				schedule := map[string]string{
					"startTime":       startTime,
					"endTime":         endTime,
					"maxAppointments": maxAppointments,
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
	return programWiseDaySchedule
}
