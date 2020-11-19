package utils

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"io/ioutil"
	"log"
	"strings"
)

const (
	pubKeyPath    = "swagger_gen/resources/local_rsa.pub"
	clientId      = "vaccination_api"
	admin         = "admin"
	facilityAdmin = "facility_admin"
)

var (
	verifyKey *rsa.PublicKey
)

func init() {
	verifyBytes, err := ioutil.ReadFile(pubKeyPath)
	if err != nil {
		log.Print(err)
	}
	//fatal(err)

	verifyKey, err = jwt.ParseRSAPublicKeyFromPEM(verifyBytes)
	if err != nil {
		log.Print(err)
	}
	//fatal(err)
}

func UserAuthorizer(bearerHeader string) (interface{}, error) {
	bearerToken, err := getToken(bearerHeader)
	if err != nil {
		return nil, err
	}
	claimBody, err := getClaimBody(bearerToken)
	if err != nil {
		return nil, err
	}
	return claimBody, err
}

func AdminAuthorizer(bearerHeader string) (interface{}, error) {
	bearerToken, err := getToken(bearerHeader)
	if err != nil {
		return nil, err
	}
	claimBody, err := getClaimBody(bearerToken)
	if err != nil {
		return nil, err
	}
	if contains(claimBody.ResourceAccess[clientId].Roles, admin) {
		return claimBody, err
	} else {
		return nil, errors.New("unauthorized")
	}
}

func FacilityAdminAuthorizer(bearerHeader string) (interface{}, error) {
	bearerToken, err := getToken(bearerHeader)
	if err != nil {
		return nil, err
	}
	claimBody, err := getClaimBody(bearerToken)
	if err != nil {
		return nil, err
	}
	if contains(claimBody.ResourceAccess[clientId].Roles, facilityAdmin) {
		return claimBody, err
	} else {
		return nil, errors.New("unauthorized")
	}
}

func contains(arr []string, str string) bool {
	for _, a := range arr {
		if a == str {
			return true
		}
	}
	return false
}

func getClaimBody(bearerToken string) (*JWTClaimBody, error) {
	token, err := jwt.ParseWithClaims(bearerToken, &JWTClaimBody{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("error decoding token")
		}
		return verifyKey, nil
	})
	if err != nil {
		return nil, err
	}
	if token.Valid {
		claims := token.Claims.(*JWTClaimBody)
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func getToken(bearerHeader string) (string, error) {
	bearerTokenArr := strings.Split(bearerHeader, " ")
	if len(bearerTokenArr) <= 1 {
		return "", errors.New("invalid token")
	}
	bearerToken := bearerTokenArr[1]
	return bearerToken, nil
}
