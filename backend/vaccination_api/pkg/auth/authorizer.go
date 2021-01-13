package auth

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"github.com/divoc/api/config"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/gospotcheck/jwt-go"
	log "github.com/sirupsen/logrus"
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
	verifyBytes := ([]byte)("-----BEGIN PUBLIC KEY-----\n" + config.Config.Keycloak.Pubkey + "\n-----END PUBLIC KEY-----\n")
	log.Infof("Using the public key %s", string(verifyBytes))
	var err error
	verifyKey, err = jwt.ParseRSAPublicKeyFromPEM(verifyBytes)
	if err != nil {
		log.Print(err)
	}
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
		for _, client := range claimBody.ResourceAccess {
			if contains(client.Roles, role) {
				return true
			}
		}
	}
	return false
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

func GetClaimBody(bearerToken string) (*models.JWTClaimBody, error) {

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
