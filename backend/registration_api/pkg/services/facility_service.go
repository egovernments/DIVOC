package services

import (
	"encoding/json"
	"strconv"
	"time"

	"github.com/divoc/kernel_library/services"
	"github.com/go-openapi/strfmt"
	log "github.com/sirupsen/logrus"
)

const FacilityProgramSlot = "FacilityProgramSlot"
const Program = "Program"

type daySchedule map[time.Weekday][]map[string]string
type ProgramDaySchedule map[string]daySchedule

type TimeInterval struct{
	Start	time.Time
	End		time.Time
}

func (pse TimeInterval) Has(date time.Time) bool {
	startTimeDiff := date.Sub(pse.Start)
	endTimeDiff := date.Sub(pse.End)
	return startTimeDiff >= 0 && endTimeDiff <= 0
}

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

func GetActiveProgramDates() (map[string]TimeInterval, error) {
	var programs []struct{
		StartDate	strfmt.Date	`json:"startDate"`
		EndDate		strfmt.Date	`json:"endDate"`
		Osid 		string		`json:"osid"`
	}
	filter := map[string]interface{}{
		"status": map[string]interface{}{
			"eq": "Active",
		},
	}

	programsResp, err := services.QueryRegistry(Program, filter, -1, 0)
	if err != nil {
		log.Errorf("Error fetching Programs [%s]", err.Error())
		return nil, err
	}
	programsStr, _ := json.Marshal(programsResp[Program])
	if err := json.Unmarshal(programsStr, &programs); err != nil {
		log.Errorf("Error parsing response to required format [%s]", err.Error())
		return nil, err
	}

	programDates := make(map[string]TimeInterval)
	for _, p := range programs {
		programDates[p.Osid] = TimeInterval{
			Start: time.Time(p.StartDate),
			End: time.Time(p.EndDate),
		}
	}
	return programDates, nil
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
						"startTime":       startTime,
						"endTime":         endTime,
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
