package config

import(
	"github.com/jinzhu/configor"
	log "github.com/sirupsen/logrus"
	"github.com/imroc/req"
	"errors"
)

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml",
		//"config/application.yml"
	)
	if err != nil {
		panic("Unable to read configurations")
	}
    if Config.Keycloak.Pubkey == "" {
        updatePublicKeyFromKeycloak()
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


var Config = struct {
	Registry struct {
		Url               string `default:"localhost:8081" env:"REGISTRY_URL"`
		AddOperationId    string
		SearchOperationId string `default:"search"`
		ReadOperationId   string `default:"read"`
		ApiVersion        string `default:"1"`
	}
	Keycloak struct {
		Url           string `env:"KEYCLOAK_URL"`
		AdminApiClientSecret   string `env:"ADMIN_API_CLIENT_SECRET"`
		Pubkey        string `env:"PUBLIC_KEY"`
		Realm string `default:"divoc"`
		AuthHeader string `env:"AUTH_TOKEN"`
		RecipientGroupId string `default:"recipient"`
	}
	Kafka struct {
		BootstrapServers string `env:"KAFKA_BOOTSTRAP_SERVERS" yaml:"bootstrapServers"`
		CertifyTopic string `default:"certify" yaml:"certifyTopic"`
		EventsTopic string `default:"events" yaml:"eventsTopic"`
	}
	Database struct {
		Host string `default:"localhost" yaml:"host" env:"DB_HOST"`
		Password string `default:"postgres" yaml:"password" env:"DB_PASSWORD"`
		User string `default:"postgres" yaml:"user" env:"DB_USER"`
		Port string `default:"5432" yaml:"port" env:"DB_PORT"`
		DBName string `default:"postgres" yaml:"dbname"`
	}
	Certificate struct {
		Upload struct {
			Columns string `yaml:"columns"`
		}
	}
	Clickhouse struct {
		Dsn string `env:"CLICK_HOUSE_URL"`
	}
	Digilocker struct {
		AuthKeyName string `env:"DIGILOCKER_AUTHKEYNAME" default:"x-digilocker-hmac"`
		AuthHMACKey string `env:"DIGILOCKER_HMAC_AUTHKEY"`
		DocType string `env:DIGILOCKER_DOCTYPE`
	}
}{}
