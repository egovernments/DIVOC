package consumers

import (
	"encoding/json"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	models2 "github.com/divoc/registration-api/pkg/models"
	"github.com/divoc/registration-api/pkg/services"
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
						enrollment := responseFromRegistry["Enrollment"].([]interface{})[0].(map[string]interface{})
						existingAppointments := enrollment["appointments"].([]interface{})
						appointmentToUpdate := findTheAppointmentToUpdate(existingAppointments, appointmentAckMessage)
						if appointmentToUpdate == nil {
							log.Errorf("User didn't enroll for the given program (%v) and dose (%v)", appointmentAckMessage.ProgramId, appointmentAckMessage.Dose)
						} else  {
							parsedDate, err := time.Parse("2006-01-02", appointmentAckMessage.AppointmentDate)
							if err == nil {
								appointmentToUpdate["appointmentDate"] = strfmt.Date(parsedDate)
								appointmentToUpdate["appointmentSlot"] = appointmentAckMessage.AppointmentTime
								appointmentToUpdate["enrollmentScopeId"] = appointmentAckMessage.FacilityCode
								appointmentToUpdate["certified"] = false
								_, err = kernelService.UpdateRegistry("appointments", appointmentToUpdate)
								if err == nil {
									err := services.NotifyAppointmentBooked(CreateEnrollmentForNotificationTemplate(enrollment, appointmentAckMessage))
									if err != nil {
										log.Error("Unable to send notification to the enrolled user", err)
									}
								} else {
									log.Error("Booking appointment is failed ", err)
								}
							} else {
								// Push to error topic
								log.Error("Date parsing failed ", err)
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

func findTheAppointmentToUpdate(existingAppointments []interface{}, message models2.AppointmentAck) map[string]interface{} {
	for _, appointment := range existingAppointments {
		appointmentMap := appointment.(map[string]interface{})
		if appointmentMap["programId"] == message.ProgramId && appointmentMap["dose"] == message.Dose {
			log.Info("Found an appointment to update")
			return appointmentMap
		}
	}
	return nil
}

func CreateEnrollmentForNotificationTemplate(enrollmentMap map[string]interface{}, message models2.AppointmentAck) models.Enrollment {
	appointmentDateFormat, err := time.Parse("2006-01-02", message.AppointmentDate)
	if err != nil {
		log.Errorf("Invalid date format (%v) (%v)", message.AppointmentDate, err)
		return models.Enrollment{}
	} else {
		email, emailOk := enrollmentMap["email"].(string)
		if !emailOk {
			email = ""
		}
		appointments := make([]*models.EnrollmentAppointmentsItems0, 1)
		// In template there will be only one appointment in an appointments array
		return models.Enrollment{
			Name:            enrollmentMap["name"].(string),
			Phone:           enrollmentMap["phone"].(string),
			Email:           email,
			Appointments: append(appointments, &models.EnrollmentAppointmentsItems0{
				AppointmentDate: strfmt.Date(appointmentDateFormat),
				AppointmentSlot: message.AppointmentTime,
				Dose:            message.Dose,
			}),
		}
	}
}

type RecipientAppointmentMessage struct {
	EnrollmentCode  string
	FacilityCode    string
	AppointmentDate string
	AppointmentTime string
}
