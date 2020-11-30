package config

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
		PubkeyPath string `default:"config/local_rsa.pub""`

	}
	Kafka struct {
		BootstrapServers string `env:"KAFKA_BOOTSTRAP_SERVERS" yaml:"bootstrapServers"`
		CertifyTopic string `default:"certify" yaml:"certifyTopic"`
	}
}{}
