package controller

import (
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"net/http"
	"vaccination-module/models"
)

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

func badRequest(ctx *gin.Context) {
	ctx.JSON(http.StatusBadRequest, "")
}
