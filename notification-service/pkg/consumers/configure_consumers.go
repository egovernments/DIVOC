package consumers

func Init() {
	go smsNotifyConsumer()
	go emailNotifyConsumer()
}
