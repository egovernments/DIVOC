package services

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/models"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/go-openapi/strfmt"
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

func CheckIfAlreadyAppointed(enrollmentInfo map[string]string, programID string, dose string) bool {
	slotKey := fmt.Sprintf("%s-%s-slotId", programID, dose)
	if _, ok := enrollmentInfo[slotKey]; ok {
		return true
	}
	return false
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
		return err
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

func MarkEnrollmentAsBooked(enrollmentCode string, slotId string, programID string, dose string) bool {
	slotKey := fmt.Sprintf("%s-%s-slotId", programID, dose)
	updatedCountKey := fmt.Sprintf("%s-%s-updatedCount", programID, dose)
	if success, err := SetHash(enrollmentCode, slotKey, slotId); err == nil && success {
		_, _ = SetHash(enrollmentCode, updatedCountKey, "0")
		log.Infof("Successfully marked %s code for slot %s as booked", enrollmentCode, slotId)
		return success
	} else {
		log.Errorf("Failed to mark %s code for slot %s as booked %v", enrollmentCode, slotId, err)
	}
	return false

}

func CancelBookedAppointment(slotId string) error {
	_, err := IncrValue(slotId)
	return err
}

func RevokeEnrollmentBookedStatus(enrollmentCode string, programId string, dose string) bool {
	slotKey := fmt.Sprintf("%s-%s-slotId", programId, dose)
	updatedCountKey := fmt.Sprintf("%s-%s-updatedCount", programId, dose)
	success, err := RemoveHastField(enrollmentCode, slotKey)
	if err != nil {
		log.Errorf("Failed to mark %s code for slot %s as booked %v", enrollmentCode, err)
	} else {
		log.Infof("Successfully marked %s code for slot %s as booked", enrollmentCode)
	}
	_, err = IncrHashField(enrollmentCode, updatedCountKey)
	if err != nil {
		log.Errorf("Failed to increase %s updated count", enrollmentCode, err)
	} else {
		log.Infof("Successfully increased %s updated count", enrollmentCode)
	}
	return success == 1
}

func BookSlot(enrollmentCode, phone, facilitySlotID, dose, programID string) error {
	enrollmentInfo := GetEnrollmentInfoIfValid(enrollmentCode, phone)
	if enrollmentInfo == nil {
		msg := fmt.Sprintf("Invalid booking request %s, %s", enrollmentCode, phone)
		log.Errorf(msg)
		return errors.New(msg)
	}
	if CheckIfAlreadyAppointed(enrollmentInfo, programID, dose) {
		msg := fmt.Sprintf("Already booked %s, %s", enrollmentCode, phone)
		return errors.New(msg)
	}
	
	if err := BookAppointmentSlot(facilitySlotID); err != nil {
		return fmt.Errorf("error booking slot : %s", err.Error())
	}

	if isMarked := MarkEnrollmentAsBooked(enrollmentCode, facilitySlotID, programID, dose); !isMarked {
		return fmt.Errorf("error marking enrollment as Booked")
	}

	facilitySchedule := models.ToFacilitySchedule(facilitySlotID)
	PublishAppointmentAcknowledgement(models.AppointmentAck{
		Dose:            dose,
		ProgramId:       programID,
		EnrollmentCode:  enrollmentCode,
		SlotID:          facilitySlotID,
		FacilityCode:    facilitySchedule.FacilityCode,
		AppointmentDate: strfmt.Date(facilitySchedule.Date),
		AppointmentTime: facilitySchedule.StartTime + "-" + facilitySchedule.EndTime,
		CreatedAt:       time.Now(),
		Status:          models.AllottedStatus,
		EnrollmentOsid:  enrollmentInfo["osid"],
	})
	return nil
}

func GetOpenFacilitySlot(facilityCode, programID string) (string, error) {
	pageSize := 100
	offSet := 0
	tomorrowStart := fmt.Sprintf("%d", utils.GetTomorrowStart().Unix())
	for {
		slotKeys, err := GetValuesByScoreFromSet(facilityCode, tomorrowStart, "inf", int64(pageSize), int64(offSet))
		if err != nil {
			log.Error("Error fetching slots : ", err)
			return "", err
		}
		if len(slotKeys) == 0 {
			return "", errors.New("no slots available")
		}
		filteredSlots := utils.Filter(slotKeys, func(s string) bool {return strings.Contains(s, programID)})
		remainingCounts, err := GetValues(filteredSlots...)
		if err != nil {
			return "", errors.New("errors fetching remaining slots from Redis")
		}
		for i , rc := range remainingCounts {
			countStr, ok := rc.(string)
			if !ok {
				log.Error("Error parsing %s to string", rc)
				continue
			}
			count, err := strconv.Atoi(countStr)
			if err != nil {
				log.Error("Error parsing %s to int", countStr)
				continue
			}
			if count > 0 {
				log.Info("Open slot found : ", filteredSlots[i])
				return filteredSlots[i], nil
			}
		}
		offSet = offSet + pageSize
	}
}