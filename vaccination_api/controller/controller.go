package controller

import (
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"net/http"
	"vaccination-module/models"
)
func badRequest(ctx *gin.Context) {
	ctx.JSON(http.StatusBadRequest, "")
}

func OperatorLogin(ctx *gin.Context) {
	var auth models.Auth
	if ctx.ShouldBindJSON(&auth) != nil {
		badRequest(ctx)
		return
	}
	if auth.Mobile == "" || len(auth.Mobile) < 10 {
		badRequest(ctx)
		return
	} else if auth.Mobile != "98765443210" {
		ctx.JSON(http.StatusUnauthorized, "")
		log.Debug("User unauthorized")
	} else {
		ctx.JSON(http.StatusOK, auth)
		log.Debug("User authorized " + auth.Mobile)
	}
}

func OperatorConfiguration(ctx *gin.Context) { //todo move to backing registry
	configuration := models.OperatorConfiguration{DailyLimit:10, Programs: []string{"C19 Vaccination"}}
	configuration.Programs = append(configuration.Programs, "C19 v2 Vaccination")
	ctx.JSON(http.StatusOK, configuration)
}