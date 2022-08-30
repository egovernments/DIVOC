package config

import (
	"errors"

	kernelService "github.com/divoc/kernel_library/services"
	"github.com/imroc/req"
	"github.com/jinzhu/configor"
	log "github.com/sirupsen/logrus"
)

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml") //"config/application.yml"

	if err != nil {
		panic("Unable to read configurations")
	}
	if Config.Keycloak.Enable && Config.Keycloak.Pubkey == "" {
		updatePublicKeyFromKeycloak()
	}
	if len(Config.Registry.VCSchemas) == 0 {
		schemas, err := kernelService.GetAllSchemas()
		if err != nil {
			log.Errorf("Error while fetch schemas from registry - %v", err)
		} else {
			log.Info("Fetched schemas from registry.")
			vcSchemas := map[string]string{}
			for _, sc := range schemas["Schema"].([]interface{}) {
				vcSchemas[sc.(map[string]interface{})["name"].(string)] = sc.(map[string]interface{})["schema"].(string)
			}
			Config.Registry.VCSchemas = vcSchemas
			log.Debugf("Setting VCSchemas - %v", Config.Registry.VCSchemas)
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
		}
	}
	return errors.New("unable to get public key from keycloak")
}

var Config = struct {
	Registry struct {
		Url               string `default:"localhost:8081" env:"REGISTRY_URL"`
		AddOperationId    string
		SearchOperationId string `default:"search"`
		ReadOperationId   string `default:"read"`
		ApiVersion        string `default:"1"`
		VCSchemas         map[string]string
	}
	Keycloak struct {
		Url                  string `env:"KEYCLOAK_URL"`
		AdminApiClientSecret string `env:"ADMIN_API_CLIENT_SECRET"`
		Pubkey               string `env:"PUBLIC_KEY"`
		Realm                string `default:"divoc"`
		AuthHeader           string `env:"AUTH_TOKEN"`
		RecipientGroupId     string `default:"recipient"`
		Enable               bool   `env:"ENABLE_KEYCLOAK" default:"true"`
	}
	Kafka struct {
		BootstrapServers         string `env:"KAFKA_BOOTSTRAP_SERVERS" yaml:"bootstrapServers"`
		CertifyTopic             string `default:"certify" yaml:"certifyTopic"`
		CertifiedTopic           string `default:"certified" yaml:"certifiedTopic"`
		TestCertifyTopic         string `default:"test_certify" yaml:"testCertifyTopic"`
		TestCertifyACKTopic      string `default:"test_certify_ack" yaml:"testCertifyAckTopic"`
		EnrollmentTopic          string `default:"enrollment" yaml:"enrollmenttopic"`
		EventsTopic              string `default:"events" yaml:"eventsTopic"`
		ReportedSideEffectsTopic string `default:"reported_side_effects" yaml:"reportedSideEffectsTopic"`
		EnrollmentACKTopic       string `default:"enrollment_ack" yaml:"enrollmentacktopic"`
		RevokeCertTopic          string `default:"revoke_cert" yaml:"revokeCertTopic"`
		RevokeCertErrTopic       string `default:"revoke_cert_err" yaml:"revokeCertErrTopic"`
		ProcStatusTopic          string `default:"proc_status" yaml:"procStatusTopic"`
		VcTransactionTopic       string `default:"post-vc-certify" yaml:"vcTransactionTopic"`
	}
	Database struct {
		Host     string `default:"localhost" yaml:"host" env:"DB_HOST"`
		Password string `default:"postgres" yaml:"password" env:"DB_PASSWORD"`
		User     string `default:"postgres" yaml:"user" env:"DB_USER"`
		Port     string `default:"5432" yaml:"port" env:"DB_PORT"`
		DBName   string `default:"registry" yaml:"dbname" env:"DB_DATABASE"`
	}
	Certificate struct {
		Upload struct {
			Columns        string `yaml:"columns"`
			RequiredFields string `yaml:"required_fields"`
		}
		UpdateLimit int `env:"CERTIFICATE_UPDATE_LIMIT" default:"100"`
	}
	Testcertificate struct {
		Upload struct {
			Columns        string `yaml:"columns"`
			RequiredFields string `yaml:"required_fields"`
		}
	}
	Clickhouse struct {
		Dsn string `env:"CLICK_HOUSE_URL"`
	}
	Digilocker struct {
		AuthKeyName string `env:"DIGILOCKER_AUTHKEYNAME" default:"x-digilocker-hmac"`
		AuthHMACKey string `env:"DIGILOCKER_HMAC_AUTHKEY"`
		DocType     string `env:"DIGILOCKER_DOCTYPE"`
	}
	SearchRegistry struct {
		DefaultLimit  int `default:"100"`
		DefaultOffset int `default:"0"`
	}
	Auth struct {
		RegistrationAPIPublicKey string `yaml:"registrationAPIPublickey" env:"REGISTRATION_API_PUBLIC_KEY"`
	}
	Redis struct {
		Url              string `env:"REDIS_URL" yaml:"redisurl"`
		ProgramIdCaching string `env:"ENABLE_PROGRAM_ID_CACHING_KEY" yaml:"programidcaching"`
	}
	EnabledServices struct {
		CreateRecipientInKeycloakService string `env:"ENABLE_CREATE_RECIPIENT_IN_KEYCLOAK_SERVICE" yaml:"createRecipientInKeycloakService" default:"false"`
		RevokeCertificateService         string `env:"ENABLE_REVOKE_CERTIFICATION_SERVICE" yaml:"revokeCertificateService" default:"true"`
	}
}{}
