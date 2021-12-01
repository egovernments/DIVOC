package consumers

func InitWithKafka() {
	go certifiedSMSNotificationConsumerWithKafka()
	go certifiedEmailNotificationConsumerWithKafka()
	go notifyConsumerWithKafka()
}

func InitWithRabbitmq() {
	go certifiedSMSNotificationConsumerWithRabbitmq()
	go certifiedEmailNotificationConsumerWithRabbitmq()
	go notifyConsumerWithRabbitmq()
}