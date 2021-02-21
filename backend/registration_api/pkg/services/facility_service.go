package services

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"strconv"
	"time"
)

const FacilityEntity = "Facility"

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
	/*filter := map[string]interface{}{
		"facilityId": map[string]interface{}{
			"eq": facilityId,
		},
	}
	facilitySchedulesArr, err := services.QueryRegistry(FacilityEntity, filter, 100, 0)
	if err == nil {
		facilitySchedules := facilitySchedulesArr[FacilityEntity].([]interface{})
		if len(facilitySchedules) > 0 {
			convertToProgramWiseDaySchedule(facilitySchedules)
		}
	}*/
	facilitySchedules := `
[
  {
    "facilityId": "7589hrfi756asdr4589",
    "programId": "1-b58ec6ec-c971-455c-ade5-7dce34ea0b09",
    "appointmentSchedule": [
      {
        "osid": "yu76ht656tg",
        "startTime": "09:00",
        "endTime": "12:00",
        "days": [
          {
            "day": "mon",
            "maxAppointments": 100
          },
          {
            "day": "tue",
            "maxAppointments": 100
          }
        ]
      },
      {
        "osid": "hgr67yhu898iu",
        "startTime": "14:00",
        "endTime": "18:00",
        "days": [
          {
            "day": "mon",
            "maxAppointments": 80
          },
          {
            "day": "tue",
            "maxAppointments": 80
          }
        ]
      }
    ],
    "walkInSchedule": [
      {
        "days": ["wed", "thu"],
        "startTime": "17:00",
        "endTime": "18:00"
      }
    ]
  }
]
`
	var result []map[string]interface{}

	err := json.Unmarshal([]byte(facilitySchedules), &result)
	if err != nil {
		log.Errorf("%v", err)
	}
	programWiseDaySchedules := convertToProgramWiseDaySchedule(result)
	log.Infof("%v", programWiseDaySchedules)
	return programWiseDaySchedules
}

func convertToProgramWiseDaySchedule(schedules []map[string]interface{}) ProgramDaySchedule {
	programWiseDaySchedule := make(ProgramDaySchedule)
	for _, schedule := range schedules {
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
