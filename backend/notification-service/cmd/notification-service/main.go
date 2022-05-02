package main

import (
	"os"
	"github.com/divoc/kernel_library/services"
	"github.com/divoc/notification-service/config"
	"github.com/divoc/notification-service/pkg/consumers"
	"github.com/divoc/notification-service/swagger_gen/restapi"
	"github.com/divoc/notification-service/swagger_gen/restapi/operations"
	"github.com/go-openapi/loads"
	"github.com/jessevdk/go-flags"
	log "github.com/sirupsen/logrus"
)

func main() {
	
	services.Initialize()
	config.Initialize()
	consumers.Init()

	ll, err := log.ParseLevel(config.Config.LogLevel)
	log.SetLevel(ll)

	log.Infof("Starting certificate processor")
	swaggerSpec, err := loads.Embedded(restapi.SwaggerJSON, restapi.FlatSwaggerJSON)
	if err != nil {
		log.Fatalln(err)
	}

	api := operations.NewNotificationServiceAPI(swaggerSpec)
	server := restapi.NewServer(api)
	defer server.Shutdown()

	parser := flags.NewParser(server, flags.Default)
	parser.ShortDescription = "Divoc notification service API"
	parser.LongDescription = "Digital infra for notification service"
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
