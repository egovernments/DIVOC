package services

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/divoc/registration-api/config"
	log "github.com/sirupsen/logrus"
	"time"
)
//Reference: https://www.sohamkamani.com/golang/jwt-authentication/

type Claims struct {
	Phone string
	jwt.StandardClaims
}

func CreateRecipientToken(phone string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := Claims{
		Phone: phone,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	keyFromPEM, err := jwt.ParseRSAPrivateKeyFromPEM(config.Config.Auth.PrivateKey)
	if err != nil {
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	tokenString, err := token.SignedString(keyFromPEM)
	return tokenString, err
}

// Will be used by the handlers to validate the JWT
func VerifyRecipientToken(jwtToken string) (string, error) {
	keyFromPEM, _ := jwt.ParseRSAPublicKeyFromPEM(config.Config.Auth.PublicKey)
	c := Claims{}
	token, err := jwt.ParseWithClaims(jwtToken, &c, func(token *jwt.Token) (interface{}, error) {
		return keyFromPEM, nil
	})
	if err!= nil {
		log.Info("Unable to get the claims out of token", err)
		return "", err
	}
	claims := token.Claims.(*Claims)
	return claims.Phone, err
}
