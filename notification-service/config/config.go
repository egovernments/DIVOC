package config

import "github.com/jinzhu/configor"

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml") //"config/application.yml"

	if err != nil {
		panic("Unable to read configurations")
	}

}

var Config = struct {
	Keycloak struct {
		PubkeyPath string `default:"config/local_rsa.pub"`
	}
	Kafka struct {
		BootstrapServers string `env:"KAFKA_BOOTSTRAP_SERVERS" yaml:"bootstrapServers"`
		CertifyTopic     string `default:"certify" yaml:"certifyTopic"`
		EventsTopic      string `default:"events" yaml:"eventsTopic"`
	}
}{}
