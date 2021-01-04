package pkg

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/divoc/portal-api/config"
	log "github.com/sirupsen/logrus"
	"strings"
)

const (
	clientId       = "vaccination_api"
	portalClientId = "facility-admin-portal"
	admin          = "admin"
	facilityAdmin  = "facility_admin"
)

var (
	verifyKey *rsa.PublicKey
)

func Init() {
	verifyBytes := ([]byte)("-----BEGIN PUBLIC KEY-----\n" + config.Config.Keycloak.Pubkey + "\n-----END PUBLIC KEY-----\n")
	log.Infof("Using the public key %s", string(verifyBytes))
	var err error
	verifyKey, err = jwt.ParseRSAPublicKeyFromPEM(verifyBytes)
	if err != nil {
		log.Print(err)
	}
}

func HasResourceRole(clientId string, role string, principal *models.JWTClaimBody) bool {
	return contains(principal.ResourceAccess[clientId].Roles, role)
}

func RoleAuthorizer(bearerToken string, expectedRole []string) (*models.JWTClaimBody, error) {
	claimBody, err := getClaimBody(bearerToken)
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

func contains(arr []string, str string) bool {
	for _, a := range arr {
		if a == str {
			return true
		}
	}
	return false
}

func getClaimBody(bearerToken string) (*models.JWTClaimBody, error) {

	if verifyKey == nil {
		Init()
	}

	token, err := jwt.ParseWithClaims(bearerToken, &models.JWTClaimBody{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("error decoding token")
		}
		return verifyKey, nil
	})
	if err != nil {
		return nil, err
	}
	if token.Valid {
		claims := token.Claims.(*models.JWTClaimBody)
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
