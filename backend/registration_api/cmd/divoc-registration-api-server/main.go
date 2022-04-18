package main

import (
	kernelServices "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/consumers"
	"github.com/divoc/registration-api/pkg/services"
	"github.com/divoc/registration-api/swagger_gen/restapi"
	"github.com/divoc/registration-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/loads"
	"github.com/jessevdk/go-flags"
	log "github.com/sirupsen/logrus"
	"os"
)

func main() {
	config.Initialize()
	services.InitializeKafka()
	kernelServices.InitializeEtcd()
	services.InitRedis()
	consumers.Init()

	services.InitializeAppointmentScheduler()
	swaggerSpec, err := loads.Embedded(restapi.SwaggerJSON, restapi.FlatSwaggerJSON)
	if err != nil {
		log.Fatalln(err)
	}

	api := operations.NewRegistrationAPIAPI(swaggerSpec)
	server := restapi.NewServer(api)
	defer server.Shutdown()

	parser := flags.NewParser(server, flags.Default)
	parser.ShortDescription = "Divoc Registration API"
	parser.LongDescription = "Registration for vaccination (DIVOC)"
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
