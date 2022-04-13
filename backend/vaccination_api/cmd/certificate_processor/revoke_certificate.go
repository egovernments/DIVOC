package main

import (
	"encoding/json"
	"errors"
	"strconv"
	"strings"

	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/models"
	"github.com/divoc/api/pkg/services"
	kernelService "github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
)

type RevokeCertificateRequest struct {
	PreEnrollmentCode string                 `json:"preEnrollmentCode"`
	CertificateBody   map[string]interface{} `json:"certificateBody"`
}

func handleCertificateRevocationMessage(msg string) (string, models.Status, error) {
	log.Debugf("In handleCertificateRevocationMessage %+v", msg)
	var revokeCertificateMessage RevokeCertificateRequest

	if err := json.Unmarshal([]byte(msg), &revokeCertificateMessage); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return "unknown", models.ERROR, errors.New("kafka message unmarshalling failed")
	}

	certificateBody := revokeCertificateMessage.CertificateBody
	preEnrollmentCode := revokeCertificateMessage.PreEnrollmentCode

	certificateId := certificateBody["certificateId"].(string)

	log.Infof("Revoke certificateId: %v", certificateId)

	if status, err := deleteVaccineCertificate(certificateBody["osid"].(string)); err != nil {
		log.Errorf("Failed to delete vaccination certificate %+v", certificateId)
		return preEnrollmentCode, status, err
	} else {
		var cert map[string]interface{}
		if err := json.Unmarshal([]byte(certificateBody["certificate"].(string)), &cert); err != nil {
			log.Errorf("%v", err)
			return preEnrollmentCode, models.ERROR, errors.New("certificate unmarshalling failed")
		}
		certificateDose := cert["evidence"].([]interface{})[0].(map[string]interface{})
		log.Debugf("certificateDose doses: %+v dose: %+v", certificateDose["doses"], certificateDose["dose"])
		status, err = addCertificateToRevocationList(preEnrollmentCode, int(certificateDose["dose"].(float64)), certificateId)
		if err != nil {
			log.Errorf("Failed to add certificate %v to revocation list", certificateId)
			return preEnrollmentCode, status, err
		}
		status, err = deleteKeyFromRedis(preEnrollmentCode, certificateBody["programId"], int(certificateDose["dose"].(float64)))
		return preEnrollmentCode, status, err
	}
}

func deleteVaccineCertificate(osid string) (models.Status, error) {
	typeId := "VaccinationCertificate"
	filter := map[string]interface{}{
		"osid": osid,
	}
	if _, err := kernelService.DeleteRegistry(typeId, filter); err != nil {
		log.Errorf("Error in deleting vaccination certificate %+v", err)
		if strings.HasPrefix(err.Error(), "tempError") {
			return models.TEMP_ERROR, errors.New("tempError in deleting vaccination certificate")
		} else {
			return models.ERROR, errors.New("error in deleting vaccination certificate")
		}
	} else {
		return models.SUCCESS, nil
	}
}

func addCertificateToRevocationList(preEnrollmentCode string, dose int, certificateId string) (models.Status, error) {
	typeId := "RevokedCertificate"
	revokeCertificate := map[string]interface{}{
		"preEnrollmentCode":     preEnrollmentCode,
		"dose":                  dose,
		"previousCertificateId": certificateId,
		"certificateId":         "",
	}
	filter := map[string]interface{}{
		"previousCertificateId": map[string]interface{}{
			"eq": certificateId,
		},
		"dose": map[string]interface{}{
			"eq": dose,
		},
		"preEnrollmentCode": map[string]interface{}{
			"eq": preEnrollmentCode,
		},
	}
	log.Debugf("revokeCertificate: %v", revokeCertificate)
	log.Debugf("filter: %v", filter)
	if resp, err := kernelService.QueryRegistry(typeId, filter, config.Config.SearchRegistry.DefaultLimit, config.Config.SearchRegistry.DefaultOffset); err == nil {
		if revokedCertificate, ok := resp[typeId].([]interface{}); ok {
			if len(revokedCertificate) > 0 {
				log.Infof("%v certificateId already exists in revocation", certificateId)
				return models.SUCCESS, nil
			}
			_, err = kernelService.CreateNewRegistry(revokeCertificate, typeId)
			if err != nil {
				log.Infof("Failed saving revoked Certificate %+v", err)
				return models.ERROR, err
			}
			log.Infof("%v certificateId added to revocation", certificateId)
			return models.SUCCESS, nil
		}
	}
	return models.TEMP_ERROR, errors.New("error occurred while adding certificate to revocation list")
}

func deleteKeyFromRedis(preEnrollmentCode string, programId interface{}, dose int) (models.Status, error) {
	log.Infof("preEnrollmentCode %+v programId %+v dose %+v", preEnrollmentCode, programId, dose)

	key := preEnrollmentCode + "-" + strconv.Itoa(dose)
	if config.Config.Redis.ProgramIdCaching == "true" && programId != nil && programId.(string) != "" {
		key = preEnrollmentCode + "-" + programId.(string) + "-" + strconv.Itoa(dose)
	}
	log.Infof("Key for Redis : %v, %v", key, config.Config.Redis.ProgramIdCaching)
	err := services.DeleteValue(key)
	if err != nil {
		log.Errorf("Error while deleting key from redis: %v", err)
		return models.ERROR, errors.New("error while deleting key from redis")
	}
	return models.SUCCESS, nil
}
