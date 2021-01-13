package auth

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"github.com/divoc/notification-service/config"
	"github.com/divoc/notification-service/swagger_gen/models"
	"github.com/gospotcheck/jwt-go"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"strings"
)

const (
	clientId            = "vaccination_api"
	admin               = "admin"
	facilityAdmin       = "facility_admin"
	portalClientId      = "facility-admin-portal"
	certificateClientId = "certificate-login"
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

func RoleAuthorizer(bearerToken string, expectedRole []string) (*models.JWTClaimBody, error) {
	claimBody, err := GetClaimBody(bearerToken)
	if err != nil {
		return nil, err
	}
	isAuthorized := AuthorizeRole(expectedRole, claimBody)
	if isAuthorized {
		return claimBody, err
	}
	return nil, errors.New("unauthorized")
}

func AuthorizeRole(expectedRole []string, claimBody *models.JWTClaimBody) bool {
	for _, role := range expectedRole {
		if contains(claimBody.ResourceAccess[clientId].Roles, role) {
			return true
		}
		if contains(claimBody.ResourceAccess[portalClientId].Roles, role) {
			return true
		}
		if contains(claimBody.ResourceAccess[certificateClientId].Roles, role) {
			return true
		}
	}
	return false
}

func contains(arr []string, str string) bool {
	for _, a := range arr {
		if a == str {
			return true
		}
	}
	return false
}

func GetClaimBody(bearerToken string) (*models.JWTClaimBody, error) {
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

func GetToken(bearerHeader string) (string, error) {
	bearerTokenArr := strings.Split(bearerHeader, " ")
	if len(bearerTokenArr) <= 1 {
		return "", errors.New("invalid token")
	}
	bearerToken := bearerTokenArr[1]
	return bearerToken, nil
}

func ExtractClaimBodyFromHeader(params *http.Request) *models.JWTClaimBody {
	authHeader := params.Header.Get("Authorization")
	if authHeader != "" {
		bearerToken, _ := GetToken(authHeader)
		claimBody, _ := GetClaimBody(bearerToken)
		return claimBody
	}
	return nil
}
