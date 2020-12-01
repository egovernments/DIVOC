package auth

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/gospotcheck/jwt-go"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"strings"
)

const (
	clientId       = "vaccination_api"
	admin          = "admin"
	facilityAdmin  = "facility_admin"
	portalClientId = "facility-admin-portal"
)

var (
	verifyKey *rsa.PublicKey
)

func Init() {
	log.Infof("Using the public from %s", config.Config.Keycloak.PubkeyPath)
	verifyBytes, err := ioutil.ReadFile(config.Config.Keycloak.PubkeyPath)
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

func RoleAuthorizer(bearerToken string, expectedRole []string) (interface{}, error) {
	claimBody, err := GetClaimBody(bearerToken)
	if err != nil {
		return nil, err
	}
	for _, role := range expectedRole {
		if contains(claimBody.ResourceAccess[clientId].Roles, role) {
			return claimBody, err
		}
		if contains(claimBody.ResourceAccess[portalClientId].Roles, role) {
			return claimBody, err
		}
	}
	return nil, errors.New("unauthorized")
}

func UserAuthorizer(bearerHeader string) (interface{}, error) {
	bearerToken, err := GetToken(bearerHeader)
	if err != nil {
		return nil, err
	}
	claimBody, err := GetClaimBody(bearerToken)
	if err != nil {
		return nil, err
	}
	return claimBody, err
}

func AdminAuthorizer(bearerHeader string) (interface{}, error) {
	bearerToken, err := GetToken(bearerHeader)
	if err != nil {
		return nil, err
	}
	claimBody, err := GetClaimBody(bearerToken)
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
	bearerToken, err := GetToken(bearerHeader)
	if err != nil {
		return nil, err
	}
	claimBody, err := GetClaimBody(bearerToken)
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

func GetClaimBody(bearerToken string) (*JWTClaimBody, error) {
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

func GetToken(bearerHeader string) (string, error) {
	bearerTokenArr := strings.Split(bearerHeader, " ")
	if len(bearerTokenArr) <= 1 {
		return "", errors.New("invalid token")
	}
	bearerToken := bearerTokenArr[1]
	return bearerToken, nil
}
