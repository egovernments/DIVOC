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
		CertifiedTopic   string `default:"certified" yaml:"certifiedTopic"`
		NotifyTopic      string `default:"notify" yaml:"notifyTopic"`
	}
	SmsAPI struct {
		URL     string `env:"SMS_URL" default:"https://api.msg91.com/api/v2/sendsms" yaml:"url"`
		AuthKey string `env:"SMS_AUTH_KEY" default:"" yaml:"authKey"`
		Enable  bool   `env:"ENABLE_SMS" yaml:"enable"`
	}
	EmailSMTP struct {
		FromAddress string `env:"SENDER_EMAIL" yaml:"fromAddress"`
		Password    string `env:"SENDER_PASSWORD" yaml:"password"`
		Enable      bool   `env:"ENABLE_EMAIL" yaml:"enable"`
	}
	LogLevel string `env:"LOG_LEVEL" yaml:"log_level" default:"info"`
}{}
