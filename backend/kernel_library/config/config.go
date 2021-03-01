package config

import "github.com/jinzhu/configor"

func init() {
	print("kernel config initialization")
	err := configor.Load(&Config, "./config/application-default.yml") //"config/application.yml"

	if err != nil {
		panic("Unable to read configurations")
	}
}

var Config = struct {
	Registry struct {
		Url               string `default:"localhost:8081" env:"REGISTRY_URL"`
		AddOperationId    string `default:"add"`
		SearchOperationId string `default:"search"`
		UpdateOperationId string `default:"update"`
		ReadOperationId   string `default:"read"`
		DeleteOperationId string `default:"delete"`
		ApiVersion        string `default:"1"`
	}
	Keycloak struct {
		Url           string `env:"KEYCLOAK_URL"`
		Realm         string `env:"KEYCLOAK_REALM"`
		FacilityAdmin struct {
			RoleName string `yaml:"roleName"`
			RoleId   string `yaml:"roleId"`
			ClientId string `yaml:"clientId"`
			GroupId  string `yaml:"groupId"`
		} `yaml:"facilityAdmin"`
		FacilityStaff struct {
			RoleName string `yaml:"roleName"`
			RoleId   string `yaml:"roleId"`
			ClientId string `yaml:"clientId"`
			GroupId  string `yaml:"groupId"`
		} `yaml:"facilityStaff"`
	}
	Flagr struct {
		Url                 string `env:"FLAGR_URL"`
		NotificationFlagKey string `default:"notification_templates"`
	}
}{}
