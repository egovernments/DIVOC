module github.com/divoc/registration-api

go 1.15

require (
	github.com/aws/aws-sdk-go v1.34.28
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
	github.com/go-redis/redis/v8 v8.6.0
	github.com/gospotcheck/jwt-go v4.0.0+incompatible
	github.com/imroc/req v0.3.0
	github.com/jessevdk/go-flags v1.4.0
	github.com/jinzhu/configor v1.2.1
	github.com/lestrrat-go/jwx v1.2.24
	github.com/pkg/errors v0.9.1
	github.com/sirupsen/logrus v1.7.0
	golang.org/x/net v0.7.0
	gopkg.in/confluentinc/confluent-kafka-go.v1 v1.5.2
)

replace github.com/divoc/kernel_library => ../kernel_library
