package utils

import (
	"encoding/json"
	"errors"
	"math/rand"
	"strconv"

	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
)

func IsEqual(arr1 []string, arr2 []string) bool {
	// If one is nil, the other must also be nil.
	if (arr1 == nil) != (arr2 == nil) {
		return false
	}

	if len(arr1) != len(arr2) {
		return false
	}

	for _, e := range arr1 {
		if !Contains(arr2, e) {
			return false
		}
	}
	return true
}

func Contains(arr []string, str string) bool {
	for _, a := range arr {
		if a == str {
			return true
		}
	}
	return false
}

// ToString Change arg to string
func ToString(arg interface{}) string {
	switch v := arg.(type) {
	case int:
		return strconv.Itoa(v)
	case int8:
		return strconv.FormatInt(int64(v), 10)
	case int16:
		return strconv.FormatInt(int64(v), 10)
	case int32:
		return strconv.FormatInt(int64(v), 10)
	case int64:
		return strconv.FormatInt(v, 10)
	case string:
		return v
	case float32:
		return strconv.FormatFloat(float64(v), 'f', -1, 32)
	case float64:
		return strconv.FormatFloat(v, 'f', -1, 64)
	default:
		return ""
	}
}

func ConvertStructToInterface(structToConvert interface{}, result interface{}) error {
	b, e := json.Marshal(structToConvert)
	if e != nil {
		return errors.New("JSON marshelling error")
	}
	e = json.Unmarshal(b, result)
	if e != nil {
		return errors.New("JSON unmarshelling error")
	}
	return nil
}

func SetMapValueIfNotEmpty(m map[string]interface{}, key string, value string) {
	if value != "" {
		m[key] = value
	}
}

func GenerateEnrollmentCode(phoneNumber string) string {
	log.Info("Generating the code for the length : ",
		config.Config.EnrollmentCreation.LengthOfSuffixedEnrollmentCode, config.Config.EnrollmentCreation.MaxRetryCount)
	digits := 0

	n:= config.Config.EnrollmentCreation.LengthOfSuffixedEnrollmentCode
	for ;n>=1;n-- {
		digits  = digits * 10 + 9
	}
	return strconv.Itoa(rand.Intn(digits))
}

func ValidateMedicineIntervals(m *models.Medicine) bool {
	for _, interval := range m.DoseIntervals {
		if interval.Max == nil || interval.Min == nil {
			continue
		}
		if *interval.Max < *interval.Min {
			return false
		}
	}
	return true
}