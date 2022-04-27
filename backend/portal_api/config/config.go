package config

import (
	"errors"

	"github.com/imroc/req"
	"github.com/jinzhu/configor"
	log "github.com/sirupsen/logrus"
)

var Config = struct {
	Registry struct {
		Url               string `default:"localhost:8081" env:"REGISTRY_URL"`
		AddOperationId    string
		SearchOperationId string `default:"search"`
		ReadOperationId   string `default:"read"`
		ApiVersion        string `default:"1"`
	}
	Keycloak struct {
		Pubkey               string `env:"PUBLIC_KEY"`
		Url                  string `env:"KEYCLOAK_URL"`
		AdminApiClientSecret string `env:"ADMIN_API_CLIENT_SECRET"`
		Realm                string `env:"KEYCLOAK_REALM"`
		FacilityAdmin        struct {
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
	Analytics struct {
		Datasource string `yaml:"datasource" env:"CLICK_HOUSE_URL"`
	}
	Database struct {
		Host     string `default:"localhost" yaml:"host" env:"DB_HOST"`
		Password string `default:"postgres" yaml:"password" env:"DB_PASSWORD"`
		User     string `default:"postgres" yaml:"user" env:"DB_USER"`
		Port     string `default:"5432" yaml:"port" env:"DB_PORT"`
		DBName   string `default:"registry" yaml:"dbname" env:"DB_DATABASE"`
	}
	Facility struct {
		Upload struct {
			Columns  string `yaml:"columns"`
			Required string `yaml:"required"`
		}
	}
	PreEnrollment struct {
		Upload struct {
			Columns  string `yaml:"columns"`
			Required string `yaml:"required"`
		}
	}
	Vaccinator struct {
		Upload struct {
			Columns  string `yaml:"columns"`
			Required string `yaml:"required"`
		}
	}
	Kafka struct {
		BootstrapServers   string `env:"KAFKA_BOOTSTRAP_SERVERS" yaml:"bootstrapServers"`
		NotifyTopic        string `default:"notify" yaml:"notifyTopic"`
		CertifiedTopic     string `default:"certified" yaml:"certifiedTopic"`
		EnrollmentTopic    string `default:"enrollment" yaml:"enrollmenttopic"`
		EnrollmentACKTopic string `default:"enrollment_ack" yaml:"enrollmentacktopic"`
	}
	SearchRegistry struct {
		DefaultLimit  int `default:"100"`
		DefaultOffset int `default:"0"`
	}
	EnrollmentCreation struct {
		MaxRetryCount                  int `default:"10" yaml:"maxretrycount"`
		LengthOfSuffixedEnrollmentCode int `default:"10" yaml:"lengthofsuffixedenrollmentcode"`
	}
	Env_Type string `env:"ENV_TYPE" yaml:"env_type" default:"PROD"`
}{}

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml") //"config/application.yml"

	if err != nil {
		panic("Unable to read configurations")
	}
	if Config.Keycloak.Pubkey == "" {
		err = updatePublicKeyFromKeycloak()
		if err != nil {
			log.Errorf("Error in getting public key from keycloak %+v", err)
		}
	}
}

func updatePublicKeyFromKeycloak() error {
	url := Config.Keycloak.Url + "/realms/" + Config.Keycloak.Realm
	log.Info("Public key url ", url)
	resp, err := req.Get(url)
	if err != nil {
		return err
	}
	log.Infof("Got response %+v", resp.String())
	responseObject := map[string]interface{}{}
	if err := resp.ToJSON(&responseObject); err == nil {
		if publicKey, ok := responseObject["public_key"].(string); ok {
			Config.Keycloak.Pubkey = publicKey
			return nil
		}
	}
	return errors.New("Unable to get public key from keycloak")
}
