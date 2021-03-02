package services

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/models"
	log "github.com/sirupsen/logrus"
)

var (
	appointmentScheduleChannel chan models.FacilitySchedule
)

func InitializeAppointmentScheduler() {
	appointmentScheduleChannel = make(chan models.FacilitySchedule, config.Config.AppointmentScheduler.ChannelSize)
	createAppointmentSchedulers()
}

func createAppointmentSchedulers() {
	for i := 0; i < config.Config.AppointmentScheduler.ChannelWorkers; i++ {
		go worker(i, appointmentScheduleChannel)
	}
}

func worker(workerID int, appointmentSchedulerChannel <-chan models.FacilitySchedule) {
	prefix := fmt.Sprintf("[WORKER_%d] ", workerID)
	prefix = fmt.Sprintf("%15s", prefix)
	log.Infof("%s : Started listening to service request channel\n", prefix)
	for appointmentSchedule := range appointmentSchedulerChannel {
		createFacilityWiseAppointmentSlots(appointmentSchedule)
	}
}

func AddFacilityScheduleToChannel(serviceReq models.FacilitySchedule) {
	log.Info("Published the message to channel")
	appointmentScheduleChannel <- serviceReq
}

func createFacilityWiseAppointmentSlots(schedule models.FacilitySchedule) {
	log.Infof("Creating slot for facility %s at time : %s %s-%s", schedule.FacilityCode, schedule.Date, schedule.StartTime, schedule.EndTime)
	key := schedule.Key()
	_, err := AddToSet(schedule.FacilityCode, key, float64(schedule.GetStartTimeEpoch()))
	if err == nil {
		err = SetValue(key, schedule.Slots, schedule.GetTTL())
		if err != nil {
			log.Errorf("Error while creating key: %s slots: %d %v", key, schedule.Slots, err)
		}
	} else {
		log.Errorf("Error while inserting %s to set %s %v", key, schedule.FacilityCode, err)

	}
}

func ClearOldSlots(facilityCode string, beforeTimeStamp int64) {
	if e := RemoveElementsByScoreInSet(facilityCode, "-inf", fmt.Sprintf("(%d", beforeTimeStamp)); e != nil {
		log.Errorf("Error clearing old slots for FacilityCode: %s, timeStamp: %d", facilityCode, beforeTimeStamp)
	}
	log.Infof("Clearing old slots for %d[FacilityCode] before %d[epoch]", facilityCode, beforeTimeStamp)
}

func BookAppointmentSlot(slotId string) error {
	//TODO: make the below transaction as atomic, use WATCH
	log.Infof("Blocking appointment slot: %s", slotId)
	remainingSlotsStr, err := GetValue(slotId)
	if err != nil {
		log.Errorf("Failed getting slots info: %s %v", slotId, err)
		return nil
	}
	remainingSlots, err := strconv.Atoi(remainingSlotsStr)
	if remainingSlots <= 0 {
		return errors.New("no slots available to book")
	}
	slotsAvailable, err := DecrValue(slotId)
	if slotsAvailable == 0 {
		//TODO: mark/process slot is empty
	}
	return err
}

func MarkEnrollmentAsBooked(enrollmentCode string, slotId string) bool {
	success, err := SetHash(enrollmentCode, "slotId", slotId)
	if err != nil {
		log.Errorf("Failed to mark %s code for slot %s as booked %v", enrollmentCode, slotId, err)
	} else {
		log.Infof("Successfully marked %s code for slot %s as booked", enrollmentCode, slotId)
	}
	return success
}

func CancelBookedAppointment(slotId string) error {
	_, err := IncrValue(slotId)
	return err
}

func RevokeEnrollmentBookedStatus(enrollmentCode string) bool {
	success, err := RemoveHastField(enrollmentCode, "slotId")
	if err != nil {
		log.Errorf("Failed to mark %s code for slot %s as booked %v", enrollmentCode, err)
	} else {
		log.Infof("Successfully marked %s code for slot %s as booked", enrollmentCode)
	}
	_, err = IncrHashField(enrollmentCode, "updatedCount")
	if err != nil {
		log.Errorf("Failed to increase %s updated count", enrollmentCode, err)
	} else {
		log.Infof("Successfully increased %s updated count", enrollmentCode)
	}
	return success == 1
}