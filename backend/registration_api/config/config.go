package config

import (
	"errors"

	"github.com/imroc/req"
	"github.com/jinzhu/configor"
	log "github.com/sirupsen/logrus"
)

var Config = struct {
	Auth struct {
		PublicKey            string `env:"AUTH_PUBLIC_KEY"`
		PrivateKey           string `env:"AUTH_PRIVATE_KEY"`
		TTLForOtp            int    `yaml:"ttlforotpinminutes"`
		MAXOtpVerifyAttempts int64  `yaml:"maxotpverifyattempts"`
		OTPLength            int    `yaml:"otp_length" env:"OTP_LENGTH" default:"6"`
	}
	Keycloak struct {
		Pubkey string `env:"PUBLIC_KEY"`
		Url    string `env:"KEYCLOAK_URL"`
		Realm  string `env:"KEYCLOAK_REALM"`
		Enable bool   `env:"ENABLE_KEYCLOAK" default:"true"`
	}
	Kafka struct {
		BootstrapServers          string `env:"KAFKA_BOOTSTRAP_SERVERS" yaml:"bootstrapservers"`
		NotifyTopic               string `default:"notify" yaml:"notifyTopic"`
		EnrollmentTopic           string `default:"enrollment" yaml:"enrollmenttopic"`
		EnrollmentACKTopic        string `default:"enrollment_ack" yaml:"enrollmentacktopic"`
		AppointmentAckTopic       string `default:"appointment_ack" yaml:"appointmentacktopic"`
		RecipientAppointmentTopic string `default:"recipientappointment" yaml:"recipientappointmenttopic"`
		CertifiedTopic            string `default:"certified" yaml:"certifiedtopic"`
	}

	EnrollmentCreation struct {
		MaxRetryCount                    int `env:"ENROLLMENT_RETRY_COUNT" default:"4" yaml:"maxretrycount"`
		LengthOfSuffixedEnrollmentCode   int `default:"10" yaml:"lengthofsuffixedenrollmentcode"`
		MaxEnrollmentCreationAllowed     int `default:"4" yaml:"maxenrollmentcreationallowed"`
		MaxWalkEnrollmentCreationAllowed int `default:"4" yaml:"maxwalkinenrollmentcreationallowed"`
	}
	Redis struct {
		Url      string `env:"REDIS_URL" yaml:"redisurl"`
		CacheTTL int    `default:"60" env:"CACHE_TTL"`
	}
	AppointmentScheduler struct {
		ChannelSize    int `default:"100"`
		ChannelWorkers int `default:"10"`
		ScheduleDays   int `default:"100"`
	}
	MockOtp                      bool   `default:"true" env:"MOCK_OTP"`
	MinCancellationHours         int    `default:"24"`
	MaxAppointmentUpdatesAllowed int    `default:"3"`
	TimeZoneOffset               string `default:"+05:30"`
	Mosip struct {
		ClientId        string     `env:"MOSIP_CLIENT_ID"`
		ClientSecret    string     `env:"MOSIP_CLIENT_SECRET"`
		AuthHeader      string 	   `env:"MOSIP_AUTH_TOKEN"`
		OTPUrl          string     `env:"MOSIP_OTP_URL"`
		AuthUrl         string     `env:"MOSIP_AUTH_URL"`
		PrivateKey      string     `env:"MOSIP_PRIVATE_KEY"`
		PublicKey       string     `env:"MOSIP_PUBLIC_KEY"`
	}
	LogLevel 					 string `env:"LOG_LEVEL" yaml:"log_level" default:"info"`
}{}

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml") //"config/application.yml"

	if err != nil {
		panic("Unable to read configurations")
	}

	if Config.Keycloak.Enable && Config.Keycloak.Pubkey == "" {
		updatePublicKeyFromKeycloak()
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
	return errors.New("Unable to get public key from keycloak")
}
