package config

import "github.com/jinzhu/configor"

var Config = struct {
	Kafka struct {
		BootstrapServers string `env:"KAFKA_BOOTSTRAP_SERVERS" yaml:"bootstrapservers"`
		NotifyTopic      string `default:"notify" yaml:"notifyTopic"`
		EnrollmentTopic  string `default:"enrollment" yaml:"enrollmenttopic"`
	}

	EnrollmentCreation struct {
		MaxRetryCount                  int `default:"10" yaml:"maxretrycount"`
		LengthOfSuffixedEnrollmentCode int `default:"10" yaml:"lengthofsuffixedenrollmentcode"`
	}
}{}

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml") //"config/application.yml"

	if err != nil {
		panic("Unable to read configurations")
	}
}
