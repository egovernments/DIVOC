package main

import (
	"encoding/json"
	"sort"

	models2 "github.com/divoc/api/pkg/models"
	log "github.com/sirupsen/logrus"
)

func SortCertificatesByCreateAt(certificateArr []interface{}) []interface{} {
	sort.Slice(certificateArr, func(i, j int) bool {
		certificateA := certificateArr[i].(map[string]interface{})
		certificateB := certificateArr[j].(map[string]interface{})
		if certificateACreateAt, ok := certificateA["osCreatedAt"].(string); ok {
			if certificateBCreateAt, ok := certificateB["osCreatedAt"].(string); ok {
				return certificateACreateAt < certificateBCreateAt
			}
		}
		return true
	})
	return certificateArr
}

func GetDoseWiseCertificates(certificates []interface{}) map[int][]map[string]interface{} {
	doseWiseCertificates := map[int][]map[string]interface{}{}
	for _, certificateObj := range certificates {
		if certificate, ok := certificateObj.(map[string]interface{}); ok {
			if doseValue := GetDoseFromCertificate(certificate); doseValue != 0 {
				doseWiseCertificates[doseValue] = append(doseWiseCertificates[doseValue], certificate)
			}
		}
	}
	return doseWiseCertificates
}

func getLatestCertificate(certificatesByDose map[int][]map[string]interface{}) map[string]interface{} {
	maxDose := 0
	for key, _ := range certificatesByDose {
		if key >= maxDose {
			maxDose = key
		}
	}
	return certificatesByDose[maxDose][len(certificatesByDose[maxDose])-1]
}

func GetDoseFromCertificate(certificateMap map[string]interface{}) int {
	if doseValue, found := certificateMap["dose"]; found {
		if doseValueFloat, ok := doseValue.(float64); ok {
			return int(doseValueFloat)
		}
	}
	if certificateJson, found := certificateMap["certificate"]; found {
		var certificate models2.Certificate
		if certificateString, ok := certificateJson.(string); ok {
			if err := json.Unmarshal([]byte(certificateString), &certificate); err == nil {
				return int(certificate.Evidence[0].Dose)
			} else {
				log.Errorf("Error in reading certificate json %+v", err)
			}
		}
	}

	return 0
}
