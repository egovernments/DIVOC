package models

import "github.com/gospotcheck/jwt-go"

type JWTClaimBody struct {
	*jwt.StandardClaims
	TokenType         string
	ResourceAccess    map[string]Group `json:"resource_access"`
	Scope             string           `json:"scope"`
	PreferredUsername string           `json:"preferred_username"`
	FacilityCode      string           `json:"facility_code"`
}

type Group struct {
	Roles []string `json:"roles"`
}
