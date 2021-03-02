package models

import (
	"fmt"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

const DateFormat = "2006-01-02"
const TimeFormat = "15:04"

type FacilitySchedule struct {
	FacilityCode string
	ProgramId    string
	Date         time.Time
	StartTime    string
	EndTime 	string
	Slots       string
}

func (schedule FacilitySchedule) Key() string {
	return fmt.Sprintf("%s_%s_%s_%s_%s", schedule.FacilityCode, schedule.ProgramId, schedule.Date.Format(DateFormat), schedule.StartTime, schedule.EndTime)
}

func (schedule FacilitySchedule) DateString() string {
	return schedule.Date.Format(DateFormat)
}

func (fs FacilitySchedule) getStartTime() time.Time {
	startTime, err := time.ParseInLocation(DateFormat+TimeFormat, fs.Date.Format(DateFormat)+fs.StartTime, time.Local)
	if  err != nil {
		log.Errorf("Error parsing startTime %s", fs.StartTime)
	}
	return startTime
}

func (fs FacilitySchedule) GetStartTimeEpoch() int64 {
	return fs.getStartTime().Unix()
}

func (fs FacilitySchedule) GetTTL() time.Duration {
	return fs.getStartTime().Sub(time.Now())	
}

func ToFacilitySchedule(key string) FacilitySchedule {
	facilityDetails := strings.Split(key, "_")
	date, _ := time.Parse(DateFormat, facilityDetails[2])
	return FacilitySchedule{
		FacilityCode: facilityDetails[0],
		ProgramId:    facilityDetails[1],
		Date:         date,
		StartTime:         facilityDetails[3],
		EndTime: facilityDetails[4],
		Slots:        "",
	}
}
