package config

import (
	"github.com/jinzhu/configor"
)

var Config = struct {
	Registration struct {
		BaseUrl string `yaml:"baseUrl" env:"REGISTRATION_BASE_URL" `
	}
}{}

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml") //"config/application.yml"

	if err != nil {
		panic("Unable to read configurations")
	}
}
