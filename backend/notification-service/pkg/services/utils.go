package services

import (
	"errors"
	"strings"
)

const MobileNumberPrefix = "tel:"

const EmailPrefix = "mailto:"

const Email = "email"

const SMS = "sms"

func GetMobileNumber(raw string) (string, error) {
	if strings.Contains(raw, MobileNumberPrefix) {
		return strings.Split(raw, MobileNumberPrefix)[1], nil
	}
	return "", errors.New("mobile number not available")
}

func GetEmailId(raw string) (string, error) {
	if strings.Contains(raw, EmailPrefix) {
		return strings.Split(raw, EmailPrefix)[1], nil
	}
	return "", errors.New("email id not available")
}

func GetContactType(raw string) (string, error) {
	if strings.Contains(raw, EmailPrefix) {
		return Email, nil
	} else if strings.Contains(raw, MobileNumberPrefix) {
		return SMS, nil
	}
	return "", errors.New("invalid contact type")
}
