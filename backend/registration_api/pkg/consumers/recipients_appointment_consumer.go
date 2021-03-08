package consumers

import (
	"encoding/json"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	models2 "github.com/divoc/registration-api/pkg/models"
	"github.com/divoc/registration-api/pkg/services"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/models"
	"github.com/go-openapi/strfmt"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"time"
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
			if err == nil {
				log.Info("Got the message to book an appointment")
				var appointmentAckMessage models2.AppointmentAck
				err = json.Unmarshal(msg.Value, &appointmentAckMessage)
				if err == nil {
					filter := map[string]interface{}{}
					filter["code"] = map[string]interface{}{
						"eq": appointmentAckMessage.EnrollmentCode,
					}
					if responseFromRegistry, err := kernelService.QueryRegistry("Enrollment", filter, 100, 0); err==nil && len(responseFromRegistry["Enrollment"].([]interface{})) > 0{
						enrollmentResp := responseFromRegistry["Enrollment"].([]interface{})[0].(map[string]interface{})
						if bytes, err := json.Marshal(enrollmentResp); err == nil {
							var enrollment models.Enrollment
							if err = json.Unmarshal(bytes, &enrollment); err == nil {
								existingAppointments := enrollment.Appointments
								appointmentToUpdate := findTheAppointmentToUpdate(existingAppointments, appointmentAckMessage)
								if appointmentToUpdate == nil {
									log.Errorf("User didn't enroll for the given program (%v) and dose (%v)", appointmentAckMessage.ProgramId, appointmentAckMessage.Dose)
								} else {
									parsedDate, err := time.Parse("2006-01-02", appointmentAckMessage.AppointmentDate)
									if err == nil {
										notificationTemplate := toAppointmentNotificationTemplate(enrollment, appointmentToUpdate)
										if appointmentAckMessage.Status == models2.AllottedStatus {
											appointmentToUpdate.AppointmentDate = strfmt.Date(parsedDate)
											appointmentToUpdate.AppointmentSlot = appointmentAckMessage.AppointmentTime
											appointmentToUpdate.EnrollmentScopeID = appointmentAckMessage.FacilityCode
										} else if appointmentAckMessage.Status == models2.CancelledStatus {
											appointmentToUpdate.AppointmentDate = strfmt.Date(parsedDate)
											appointmentToUpdate.AppointmentSlot = ""
											appointmentToUpdate.EnrollmentScopeID = ""
										}
										certified := false
										appointmentToUpdate.Certified = &certified
										_, err = kernelService.UpdateRegistry("appointments", utils.ToMap(appointmentToUpdate))
										if err == nil {
											if appointmentAckMessage.Status == models2.AllottedStatus {
												notificationTemplate := toAppointmentNotificationTemplate(enrollment, appointmentToUpdate)
												err := services.NotifyAppointmentBooked(notificationTemplate)
												if err != nil {
													log.Error("Unable to send notification to the enrolled user", err)
												}
											}
											if appointmentAckMessage.Status == models2.CancelledStatus {
												err := services.NotifyAppointmentCancelled(notificationTemplate)
												if err != nil {
													log.Error("Unable to send notification to the enrolled user", err)
												}
											}
										} else {
											log.Error("Booking appointment is failed ", err)
										}
									} else {
										// Push to error topic
										log.Error("Date parsing failed ", err)
									}
								}
							}
						}
						_, _ = consumer.CommitMessage(msg)
					} else {
						log.Errorf("Unable to fetch the Enrollment details for the recipient (%v) ", appointmentAckMessage.EnrollmentCode, err)
					}
				} else {
					log.Info("Unable to serialize the ack message body", err)
				}

			} else {
				// The client will automatically try to recover from all errors.
				log.Infof("Consumer error: %v \n", err)
			}
		}
	}()
}

func findTheAppointmentToUpdate(existingAppointments []*models.EnrollmentAppointmentsItems0, message models2.AppointmentAck) *models.EnrollmentAppointmentsItems0 {
	for _, appointment := range existingAppointments {
		if appointment.ProgramID == message.ProgramId && appointment.Dose == message.Dose {
			log.Info("Found an appointment to update")
			return appointment
		}
	}
	return nil
}

func toAppointmentNotificationTemplate(enrollment models.Enrollment, appointment *models.EnrollmentAppointmentsItems0) models2.AppointmentNotification {
	facilityDetails := services.GetMinifiedFacilityDetails(appointment.EnrollmentScopeID)
	return models2.AppointmentNotification{
		RecipientName:    enrollment.Name,
		RecipientPhone:   enrollment.Phone,
		RecipientEmail:   enrollment.Email,
		FacilityName:     facilityDetails.FacilityName,
		FacilitySlotTime: appointment.AppointmentDate.String() + appointment.AppointmentSlot,
	}
}