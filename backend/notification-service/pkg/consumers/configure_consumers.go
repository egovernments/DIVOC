package consumers

func Init() {
	go certifiedSMSNotificationConsumer()
	go certifiedEmailNotificationConsumer()
	go notifyConsumer()
}
