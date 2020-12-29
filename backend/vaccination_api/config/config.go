package config

import "github.com/jinzhu/configor"

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml",
		//"config/application.yml"
	)
	if err != nil {
		panic("Unable to read configurations")
	}

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
		PubkeyPath string `default:"config/local_rsa.pub"`
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
		Dsn string `env:"CLICKHOUSE_DSN"`
	}
}{}
