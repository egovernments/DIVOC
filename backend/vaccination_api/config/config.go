package config

import (
	"errors"
	"strings"

	"github.com/imroc/req"
	"github.com/jinzhu/configor"
	log "github.com/sirupsen/logrus"
)

var PollingStates []string

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml") //"config/application.yml"

	if err != nil {
		panic("Unable to read configurations")
	}
	if Config.Keycloak.Enable && Config.Keycloak.Pubkey == "" {
		updatePublicKeyFromKeycloak()
	}
	for _, state := range strings.Split(Config.PollingStatesCSV, ",") {
		PollingStates = append(PollingStates, strings.TrimSpace(state))
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
		ErrorCertificateTopic    string `default:"error_certificate" env:"ERROR_CERTIFICATE_TOPIC" yaml:"ErrorCertificateTopic"`
		EventsTopic              string `default:"events" yaml:"eventsTopic"`
		ReportedSideEffectsTopic string `default:"reported_side_effects" yaml:"reportedSideEffectsTopic"`
		ProcStatusTopic          string `default:"proc_status" yaml:"procStatusTopic"`
		EnableCertificateAck     bool   `default:"false" env:"ENABLE_CERTIFICATE_ACK"`
		RevokeCertTopic          string `default:"revoke_cert" yaml:"revokeCertTopic"`
		RevokeCertErrTopic       string `default:"revoke_cert_err" yaml:"revokeCertErrTopic"`
	}
	Database struct {
		Host     string `default:"localhost" yaml:"host" env:"DB_HOST"`
		Password string `default:"postgres" yaml:"password" env:"DB_PASSWORD"`
		User     string `default:"postgres" yaml:"user" env:"DB_USER"`
		Port     string `default:"5432" yaml:"port" env:"DB_PORT"`
		DBName   string `default:"postgres" yaml:"dbname" env:"DB_NAME"`
	}
	Redis struct {
		Url              string `env:"REDIS_URL" yaml:"redisurl" default:"redis://redis:6379"`
		Password         string `default:"" env:"REDIS_PASSWORD"`
		DB               int    `default:"0" env:"REDIS_DB"`
		ProgramIdCaching string `env:"ENABLE_PROGRAM_ID_CACHING_KEY" yaml:"programidcaching" default:"false"`
	}
	Certificate struct {
		Upload struct {
			Columns string `yaml:"columns"`
		}
		UpdateLimit          int `env:"CERTIFICATE_UPDATE_LIMIT" default:"1"`
		CacheRecentThreshold int `env:"CERTIFICATE_CACHE_RECENT_THRESHOLD_DAYS" default:"2"`
	}
	Clickhouse struct {
		Dsn string `env:"CLICK_HOUSE_URL"`
	}
	Digilocker struct {
		AuthKeyName string `env:"DIGILOCKER_AUTHKEYNAME" default:"x-digilocker-hmac"`
		AuthHMACKey string `env:"DIGILOCKER_HMAC_AUTHKEY"`
		DocType     string `env:"DIGILOCKER_DOCTYPE"`
	}
	Acknowledgement struct {
		CallbackAuthUrl           string `env:"ACK_CALLBACK_AUTH_URL"`
		CallbackAuthKey           string `env:"ACK_CALLBACK_AUTH_KEY"`
		CallbackAuthExpiryMinutes int    `default:"10" env:"ACK_CALLBACK_AUTH_TOKEN_EXPIRY"`
		CallbackUrl               string `env:"ACK_CALLBACK_URL"`
	}
	EnabledServices struct {
		CreateRecipientInKeycloakService string `env:"ENABLE_CREATE_RECIPIENT_IN_KEYCLOAK_SERVICE" yaml:"createRecipientInKeycloakService" default:"false"`
		RevokeCertificateService         string `env:"ENABLE_REVOKE_CERTIFICATION_SERVICE" yaml:"revokeCertificateService" default:"true"`
	}
	PollingStatesCSV string `default:"" yaml:"pollingstates" env:"POLLING_STATES"`
}{}
