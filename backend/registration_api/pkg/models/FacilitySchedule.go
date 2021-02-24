package models

import (
	"fmt"
	"strings"
	"time"
)

const DateFormat = "2006-01-02"

type FacilitySchedule struct {
	FacilityCode string
	ProgramId    string
	Date         time.Time
	Time         string
	Slots        string
}

func (schedule FacilitySchedule) Key() string {
	return fmt.Sprintf("%s_%s_%s_%s", schedule.FacilityCode, schedule.ProgramId, schedule.Date.Format(DateFormat), schedule.Time)
}

func (schedule FacilitySchedule) DateString() string {
	return schedule.Date.Format(DateFormat)
}

func ToFacilitySchedule(key string) FacilitySchedule {
	facilityDetails := strings.Split(key, "_")
	date, _ := time.Parse(DateFormat, facilityDetails[2])
	return FacilitySchedule{
		FacilityCode: facilityDetails[0],
		ProgramId:    facilityDetails[1],
		Date:         date,
		Time:         facilityDetails[3] + "-" + facilityDetails[4],
		Slots:        "",
	}
}
