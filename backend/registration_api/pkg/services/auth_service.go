package services

import (
	"github.com/dgrijalva/jwt-go"
	"time"
)
// https://www.sohamkamani.com/golang/jwt-authentication/

type Claims struct {
	Phone string
	jwt.StandardClaims
}

var jwtKey = []byte("123456123456")

func CreateRecipientToken(phone string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := Claims{
		Phone: phone,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	return tokenString, err
}

// Will be used by the handlers to validate the JWT
func VerifyRecipientToken(jwtToken string) (string, error) {
	c := Claims{}
	_, err := jwt.ParseWithClaims(jwtToken, &c, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	return c.Phone, err
}