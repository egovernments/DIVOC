package main

import (
	"os"

	"github.com/divoc/api/pkg/services"

	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/api/pkg/db"
	"github.com/divoc/api/swagger_gen/restapi"
	"github.com/divoc/api/swagger_gen/restapi/operations"
	"github.com/go-openapi/loads"
	"github.com/jessevdk/go-flags"
	log "github.com/sirupsen/logrus"
)

const COMMUNICATION_MODE_RABBITMQ = "rabbitmq"
const COMMUNICATION_MODE_KAFKA = "kafka"
const COMMUNICATION_MODE_RESTAPI = "restapi"

func main() {
	config.Initialize()
	auth.Init()
	initCommunication()
	db.Init()

	swaggerSpec, err := loads.Embedded(restapi.SwaggerJSON, restapi.FlatSwaggerJSON)
	if err != nil {
		log.Fatalln(err)
	}

	api := operations.NewDivocAPI(swaggerSpec)
	server := restapi.NewServer(api)
	defer server.Shutdown()

	parser := flags.NewParser(server, flags.Default)
	parser.ShortDescription = "DIVOC"
	parser.LongDescription = "Digital infra for vaccination certificates"
	server.ConfigureFlags()
	for _, optsGroup := range api.CommandLineOptionsGroups {
		_, err := parser.AddGroup(optsGroup.ShortDescription, optsGroup.LongDescription, optsGroup.Options)
		if err != nil {
			log.Fatalln(err)
		}
	}

	if _, err := parser.Parse(); err != nil {
		code := 1
		if fe, ok := err.(*flags.Error); ok {
			if fe.Type == flags.ErrHelp {
				code = 0
			}
		}
		os.Exit(code)
	}

	server.ConfigureAPI()

	if err := server.Serve(); err != nil {
		log.Fatalln(err)
	}

}

func initCommunication() {
	switch config.Config.CommunicationMode.Mode {
	case COMMUNICATION_MODE_RABBITMQ:
		services.InitializeRabbitmq()
	case COMMUNICATION_MODE_KAFKA:
		services.InitializeKafka()
	case COMMUNICATION_MODE_RESTAPI:
		log.Errorf("Rest-API communication mode isn not supported yet")
	default:
		log.Errorf("Invalid CommunicationMode %s", config.Config.CommunicationMode)
	}
}
