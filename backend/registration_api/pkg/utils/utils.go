package utils

import (
	"github.com/divoc/registration-api/config"
	log "github.com/sirupsen/logrus"
	"math/rand"
	"strconv"
)

func GenerateEnrollmentCode(phoneNumber string) string {
	log.Info("Generating the code for the length : ",
		config.Config.EnrollmentCreation.LengthOfSuffixedEnrollmentCode, config.Config.EnrollmentCreation.MaxRetryCount)
	digits := 0

	n:= config.Config.EnrollmentCreation.LengthOfSuffixedEnrollmentCode
	for ;n>=1;n-- {
		digits  = digits * 10 + 9
	}
	return phoneNumber + "-" + strconv.Itoa(rand.Intn(digits))
}
