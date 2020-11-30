package main

import (
	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg"
	"github.com/divoc/api/pkg/auth"
	"github.com/divoc/api/swagger_gen/restapi"
	"github.com/divoc/api/swagger_gen/restapi/operations"
	"github.com/go-openapi/loads"
	"github.com/jessevdk/go-flags"
	"github.com/jinzhu/configor"
	"log"
	"os"
)

func main() {
	err := configor.Load(&config.Config, "./config/application-default.yml",
		//"config/application.yml"
	)
	if err != nil {
		panic("Unable to read configurations")
	}

	auth.Init()
	pkg.InitializeKafka()


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
