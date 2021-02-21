package services

import (
	"fmt"
	"github.com/divoc/registration-api/config"
	log "github.com/sirupsen/logrus"
	"time"
)

type FacilitySchedule struct {
	FacilityCode string
	ProgramId    string
	Date         time.Time
	Time         string
	Slots        int
}

var (
	appointmentScheduleChannel chan FacilitySchedule
)

func InitializeAppointmentScheduler() {
	appointmentScheduleChannel = make(chan FacilitySchedule, config.Config.AppointmentScheduler.ChannelSize)
	createAppointmentSchedulers()
}

func createAppointmentSchedulers() {
	for i := 0; i < config.Config.AppointmentScheduler.ChannelWorkers; i++ {
		go worker(i, appointmentScheduleChannel)
	}
}

func worker(workerID int, appointmentSchedulerChannel <-chan FacilitySchedule) {
	prefix := fmt.Sprintf("[WORKER_%d] ", workerID)
	prefix = fmt.Sprintf("%15s", prefix)
	log.Infof("%s : Started listening to service request channel\n", prefix)
	for appointmentSchedule := range appointmentSchedulerChannel {
		createFacilityWiseAppointmentSlots(appointmentSchedule)
	}
}

func AddFacilityScheduleToChannel(serviceReq FacilitySchedule) {
	appointmentScheduleChannel <- serviceReq
}

func createFacilityWiseAppointmentSlots(schedule FacilitySchedule) {
	log.Infof("Creating slot for facility %s at time : %s %s", schedule.FacilityCode, schedule.Date, schedule.Time)
	key := fmt.Sprintf("%s_%s_%s_%s", schedule.FacilityCode, schedule.ProgramId, schedule.Date.Format("2006-01-02"), schedule.Time)
	_, err := AddToSet(schedule.FacilityCode, key, float64(schedule.Date.Unix()))
	if err == nil {
		err = SetValueWithoutExpiry(key, schedule.Slots)
		if err != nil {
			log.Print("Error while creating key: %s slots: %s", key, schedule.Slots, err)
		}
	} else {
		log.Errorf("Error while inserting %s to set %s", key, schedule.FacilityCode, err)

	}
}
