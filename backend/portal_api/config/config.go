package config

import(
	log "github.com/sirupsen/logrus"
	"github.com/jinzhu/configor"
	"github.com/imroc/req"
	"errors"
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
		Pubkey 	      string `env:"PUBLIC_KEY"`
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
	Analytics struct {
		Datasource string `yaml:"datasource" env:"CLICK_HOUSE_URL"`
	}
}{}

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml",
		//"config/application.yml"
	)
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
		return  err
	}
	log.Infof("Got response %+v", resp.String())
	responseObject := map[string]interface{}{}
	if err := resp.ToJSON(&responseObject); err == nil {
		if publicKey, ok := responseObject["public_key"].(string); ok {
			Config.Keycloak.Pubkey = publicKey
		}
	}
	return errors.New("Unable to get public key from keycloak")
}