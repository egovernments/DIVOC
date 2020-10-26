package main

import (
	"github.com/gin-gonic/gin"
	"io"
	"os"
	"vaccination-module/common"
	"vaccination-module/controller"
)

type Main struct {
	router *gin.Engine
}

func (m *Main) initServer() error {
	var err error
	// Load config file
	err = common.LoadConfig()
	if err != nil {
		return err
	}

	// Initialize User database
	//err = databases.Database.Init()
	//if err != nil {
	//	return err
	//}

	// Setting Gin Logger
	if common.Config.EnableGinFileLog {
		f, _ := os.Create("logs/gin.log")
		if common.Config.EnableGinConsoleLog {
			gin.DefaultWriter = io.MultiWriter(os.Stdout, f)
		} else {
			gin.DefaultWriter = io.MultiWriter(f)
		}
	} else {
		if !common.Config.EnableGinConsoleLog {
			gin.DefaultWriter = io.MultiWriter()
		}
	}

	m.router = gin.Default()
	v1 := m.router.Group("/api/v1")
	{
		operator := v1.Group("/operator")
		{
			operator.POST("/login", controller.OperatorLogin)
			operator.POST("/configuration", controller.OperatorConfiguration)
		}
	}

	return nil
}

func main() {
	println("test")
	m := Main{}
	if m.initServer() != nil {
		return
	}

	println("Starting ", common.Config.Port)
	_ = m.router.Run(common.Config.Port)
}
