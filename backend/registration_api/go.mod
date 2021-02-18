module github.com/divoc/registration-api

go 1.15

require (
	github.com/confluentinc/confluent-kafka-go v1.5.2 // indirect
	github.com/dgrijalva/jwt-go v3.2.0+incompatible
	github.com/divoc/kernel_library v0.0.0-00010101000000-000000000000
	github.com/go-openapi/errors v0.19.7
	github.com/go-openapi/loads v0.19.5
	github.com/go-openapi/runtime v0.19.24
	github.com/go-openapi/spec v0.19.12
	github.com/go-openapi/strfmt v0.19.8
	github.com/go-openapi/swag v0.19.11
	github.com/go-openapi/validate v0.19.12
	github.com/go-redis/redis v6.15.9+incompatible
	github.com/google/uuid v1.1.2 // indirect
	github.com/jessevdk/go-flags v1.4.0
	github.com/jinzhu/configor v1.2.1
	github.com/onsi/ginkgo v1.15.0 // indirect
	github.com/onsi/gomega v1.10.5 // indirect
	github.com/sirupsen/logrus v1.7.0
	golang.org/x/net v0.0.0-20201202161906-c7110b5ffcbb
	gopkg.in/confluentinc/confluent-kafka-go.v1 v1.5.2
)

replace github.com/divoc/kernel_library => ../kernel_library
