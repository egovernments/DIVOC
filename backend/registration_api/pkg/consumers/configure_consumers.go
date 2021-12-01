package consumers

func InitWithKafka() {
	StartEnrollmentConsumerWithKafka()
	StartRecipientsAppointmentBookingConsumerWithKafka()
	StartCertifiedConsumerWithKafka()
}

func InitWithRabbitmq() {
	StartEnrollmentConsumerWithRabbitmq()
	StartRecipientsAppointmentBookingConsumerWithRabbitmq()
	StartCertifiedConsumerWithRabbitmq()
}

