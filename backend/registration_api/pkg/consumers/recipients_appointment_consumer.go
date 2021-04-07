package consumers

import (
	"encoding/json"

	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	models2 "github.com/divoc/registration-api/pkg/models"
	"github.com/divoc/registration-api/pkg/services"
	"github.com/divoc/registration-api/swagger_gen/models"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

func StartRecipientsAppointmentBookingConsumer() {
	servers := config.Config.Kafka.BootstrapServers
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  servers,
		"group.id":           "recipient-appointment",
		"auto.offset.reset":  "earliest",
		"enable.auto.commit": "false",
	})
	if err != nil {
		log.Errorf("Connection failed for the kafka",  err)
		return
	}

	go func() {
		err := consumer.SubscribeTopics([]string{config.Config.Kafka.AppointmentAckTopic}, nil)
		if err != nil {
			panic(err)
		}
		for {
			msg, err := consumer.ReadMessage(-1)
			if err != nil {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
				continue
			}
			log.Info("Got the message to book an appointment")
			var appointmentAckMessage models2.AppointmentAck
			if err = json.Unmarshal(msg.Value, &appointmentAckMessage); err != nil {
				log.Info("Unable to serialize the ack message body", err)
				_, _ = consumer.CommitMessage(msg)
				continue
			}

			responseFromRegistry, err := kernelService.ReadRegistry("Enrollment", appointmentAckMessage.EnrollmentOsid)
			enrollmentResp, ok := responseFromRegistry["Enrollment"].(map[string]interface{})
			if !ok {
				log.Errorf("Unable to fetch the Enrollment details for the recipient (%v) ", appointmentAckMessage.EnrollmentCode)
				_, _ = consumer.CommitMessage(msg)
				continue
			}
			enrollmentStr, err := json.Marshal(enrollmentResp)
			if err != nil {
				log.Errorf("Unable to parse Enrollment details from Entity : %v, error: [%s]", enrollmentResp, err.Error())
				_, _ = consumer.CommitMessage(msg)
				continue
			}

			var enrollment struct{
				Osid	string	`json:"osid"`
				models.Enrollment
			}
			if err := json.Unmarshal(enrollmentStr, &enrollment); err != nil {
				log.Errorf("Error parsing Enrollment to expected format. Enrollment [%s], error [%s]", enrollmentStr, err.Error())
				_, _ = consumer.CommitMessage(msg)
				continue
			}

			if err := findAndUpdateAppointment(&enrollment.Enrollment, appointmentAckMessage); err != nil {
				log.Error(err.Error())
				_, _ = consumer.CommitMessage(msg)
				continue
			}
			if _, err = kernelService.UpdateRegistry("Enrollment", map[string]interface{}{
				"osid": enrollment.Osid,
				"appointments": enrollment.Appointments,
			}); err != nil {
				log.Error("Booking appointment failed ", err)
				_, _ = consumer.CommitMessage(msg)
				continue
			}
			notify(enrollment.Enrollment, appointmentAckMessage)
			_, _ = consumer.CommitMessage(msg)
		}
	}()
}

func findAndUpdateAppointment(enrollment *models.Enrollment, msg models2.AppointmentAck) error {
	for _, appointment := range enrollment.Appointments {
		if appointment.ProgramID == msg.ProgramId && !appointment.Certified && appointment.Dose == msg.Dose {
			appointment.AppointmentDate = msg.AppointmentDate
			if msg.Status == models2.AllottedStatus {
				appointment.AppointmentSlot = msg.AppointmentTime
				appointment.EnrollmentScopeID = msg.FacilityCode
			} else if msg.Status == models2.CancelledStatus {
				appointment.AppointmentSlot = ""
				appointment.EnrollmentScopeID = ""
			}
			return nil
		}
	}
	return errors.Errorf("User didn't enroll for the given program (%v) and dose (%v)", msg.ProgramId, msg.Dose)
}

func notify(enrollment models.Enrollment, msg models2.AppointmentAck) {
	template := toAppointmentNotificationTemplate(enrollment, msg)
	if msg.Status == models2.AllottedStatus {
		if err := services.NotifyAppointmentBooked(template); err != nil {
			log.Error("Unable to send notification to the enrolled user", err)
		}
	}
	if msg.Status == models2.CancelledStatus {
		if err := services.NotifyAppointmentCancelled(template); err != nil {
			log.Error("Unable to send notification to the enrolled user", err)
		}
	}
}

func toAppointmentNotificationTemplate(enrollment models.Enrollment, msg models2.AppointmentAck) models2.AppointmentNotification {
	facilityDetails := services.GetMinifiedFacilityDetails(msg.FacilityCode)
	return models2.AppointmentNotification{
		RecipientName:    enrollment.Name,
		RecipientPhone:   enrollment.Phone,
		RecipientEmail:   enrollment.Email,
		FacilityName:     facilityDetails.FacilityName,
		FacilitySlotTime: msg.AppointmentDate.String() + msg.AppointmentTime,
	}
}