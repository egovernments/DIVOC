package services

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
)

const (
	clientId       = "vaccination_api"
	portalClientId = "facility-admin-portal"
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

func RoleAuthorizer(bearerToken string, expectedRole []string) (*models.JWTClaimBody, error) {
	claimBody, err := getClaimBody(bearerToken)
	if err != nil {
		return nil, err
	}
	for _, role := range expectedRole {
		if utils.Contains(claimBody.ResourceAccess[clientId].Roles, role) {
			return claimBody, err
		}
		if utils.Contains(claimBody.ResourceAccess[portalClientId].Roles, role) {
			return claimBody, err
		}
	}
	return nil, errors.New("unauthorized")
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
