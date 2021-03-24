package models

import "github.com/dgrijalva/jwt-go"

type JWTClaimBody struct {
	Phone string
	jwt.StandardClaims
}

