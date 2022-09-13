package consumers

func Init() {
	go notifyConsumer()
	go createNotificationConsumer()
}
