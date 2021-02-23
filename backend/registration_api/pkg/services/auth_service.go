package services

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
	"strings"
	"time"
)
//Reference: https://www.sohamkamani.com/golang/jwt-authentication/


func CreateRecipientToken(phone string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := models.JWTClaimBody{
		Phone: phone,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	keyFromPEM, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(config.Config.Auth.PrivateKey))
	if err != nil {
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	tokenString, err := token.SignedString(keyFromPEM)
	return tokenString, err
}

// Will be used by the handlers to validate the JWT
func VerifyRecipientToken(bearerHeader string) (*models.JWTClaimBody, error) {
	jwtToken := strings.Split(bearerHeader, " ")[1]
	keyFromPEM, _ := jwt.ParseRSAPublicKeyFromPEM([]byte(config.Config.Auth.PublicKey))
	c := models.JWTClaimBody{}
	token, err := jwt.ParseWithClaims(jwtToken, &c, func(token *jwt.Token) (interface{}, error) {
		return keyFromPEM, nil
	})
	if err!= nil {
		log.Info("Unable to get the claims out of token", err)
		return nil, err
	}
	claims := token.Claims.(*models.JWTClaimBody)
	return claims, err
}
