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
		URL     string `default:"https://api.msg91.com/api/v2/sendsms" yaml:"url"`
		AuthKey string `default:"" yaml:"authKey"`
		Enable  bool   `yaml:"enable"`
	}
	EmailSMTP struct {
		FromAddress string `yaml:"fromAddress"`
		Password    string `yaml:"password"`
		Enable      bool   `yaml:"enable"`
	}
}{}
