package controller

import (
	"../models"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func OperatorLogin(ctx *gin.Context) {
	var auth models.Auth
	if ctx.ShouldBindJSON(&auth) != nil {
		ctx.JSON(http.StatusBadRequest, "")
	}
	if auth.Mobile != "0000000000" {
		ctx.JSON(http.StatusUnauthorized, "")
		log.Debug("User unauthorized")
	} else {
		ctx.JSON(http.StatusOK, auth)
		log.Debug("User authorized " + auth.Mobile)
	}
}
