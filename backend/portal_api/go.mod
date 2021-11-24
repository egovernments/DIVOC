module github.com/divoc/portal-api

go 1.15

require (
	github.com/ClickHouse/clickhouse-go v1.4.3
	github.com/confluentinc/confluent-kafka-go v1.5.2 // indirect
	github.com/dgrijalva/jwt-go v3.2.0+incompatible
	github.com/divoc/kernel_library v0.0.0-00010101000000-000000000000
	github.com/fatih/structs v1.1.0
	github.com/go-openapi/errors v0.19.7
	github.com/go-openapi/loads v0.19.5
	github.com/go-openapi/runtime v0.19.24
	github.com/go-openapi/spec v0.19.12
	github.com/go-openapi/strfmt v0.19.8
	github.com/go-openapi/swag v0.19.11
	github.com/go-openapi/validate v0.19.12
	github.com/google/uuid v1.1.2 // indirect
	github.com/gospotcheck/jwt-go v4.0.0+incompatible
	github.com/imroc/req v0.3.0
	github.com/jessevdk/go-flags v1.4.0
	github.com/jinzhu/configor v1.2.1
	github.com/jinzhu/gorm v1.9.16
	github.com/mitchellh/mapstructure v1.3.2
	github.com/patrickmn/go-cache v2.1.0+incompatible
	github.com/sirupsen/logrus v1.7.0
	github.com/streadway/amqp v1.0.0
	golang.org/x/net v0.0.0-20200602114024-627f9648deb9
	golang.org/x/sys v0.0.0-20201116194326-cc9327a14d48 // indirect
	gopkg.in/confluentinc/confluent-kafka-go.v1 v1.5.2
)

replace github.com/divoc/kernel_library => ../kernel_library
