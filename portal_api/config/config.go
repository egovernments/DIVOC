package config

var Config = struct {
	Registry struct{
		Url string `default:"localhost:8081" env:"REGISTRY_URL"`
		AddOperationId string `default:"add"`
		SearchOperationId string `default:"search"`
		ReadOperationId string `default:"read"`
		ApiVersion string `default:"1"`
	}
}{}