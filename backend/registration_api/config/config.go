package config

import (
	"github.com/jinzhu/configor"
	"io/ioutil"
)

var Config = struct {
	Auth struct{
		PublicKeyPath string `env:"AUTH_PUBLIC_KEY_PATH"`
		PrivateKeyPath string `env:"AUTH_PRIVATE_KEY_PATH"`
		PublicKey []byte
		PrivateKey []byte
		TTLForOtp int `yaml:"ttlforotpinminutes"`
		MAXOtpVerifyAttempts int `yaml:"maxotpverifyattempts"`
	}

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
	Config.Auth.PrivateKey, err = ioutil.ReadFile(Config.Auth.PrivateKeyPath)
	if err != nil {
		panic("Unable to read the private key")
	}
	Config.Auth.PublicKey, err = ioutil.ReadFile(Config.Auth.PublicKeyPath)
	if err != nil {
		panic("Unable to read the public key")
	}
}
