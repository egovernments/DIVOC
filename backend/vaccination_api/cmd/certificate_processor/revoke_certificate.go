package main

import (
	"encoding/json"
	"errors"
	"github.com/divoc/api/config"
	"github.com/divoc/api/pkg/services"
	kernelService "github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
	"strconv"
)

type RevokeCertificateRequest struct {
	PreEnrollmentCode string                 `json:"preEnrollmentCode"`
	CertificateBody   map[string]interface{} `json:"certificateBody"`
}

func handleCertificateRevocationMessage(msg string) error {
	log.Infof("In handleCertificateRevocationMessage %+v", msg)
	var revokeCertificateMessage RevokeCertificateRequest

	if err := json.Unmarshal([]byte(msg), &revokeCertificateMessage); err != nil {
		log.Errorf("Kafka message unmarshalling error %+v", err)
		return errors.New("kafka message unmarshalling failed")
	}

	certificateBody := revokeCertificateMessage.CertificateBody
	preEnrollmentCode := revokeCertificateMessage.PreEnrollmentCode

	certificateId := certificateBody["certificateId"].(string)

	if err := deleteVaccineCertificate(certificateBody["osid"].(string)); err != nil {
		log.Errorf("Failed to delete vaccination certificate %+v", certificateId)
	} else {
		var cert map[string]interface{}
		if err := json.Unmarshal([]byte(certificateBody["certificate"].(string)), &cert); err != nil {
			log.Errorf("%v", err)
		}
		certificateDose := cert["evidence"].([]interface{})[0].(map[string]interface{})
		log.Infof("certificateDose doses: %+v dose: %+v", certificateDose["doses"], certificateDose["dose"])
		err = addCertificateToRevocationList(preEnrollmentCode, int(certificateDose["dose"].(float64)), certificateId)
		if err != nil {
			log.Errorf("Failed to add certificate %v to revocation list", certificateId)
		}
		deleteKeyFromRedis(preEnrollmentCode, certificateBody["programId"].(string), int(certificateDose["dose"].(float64)))
	}
	return nil
}

func deleteVaccineCertificate(osid string) error {
	typeId := "VaccinationCertificate"
	filter := map[string]interface{}{
		"osid": osid,
	}
	if _, err := kernelService.DeleteRegistry(typeId, filter); err != nil {
		log.Errorf("Error in deleting vaccination certificate %+v", err)
		return errors.New("error in deleting vaccination certificate")
	} else {
		return nil
	}
}

func addCertificateToRevocationList(preEnrollmentCode string, dose int, certificateId string) error {
	typeId := "RevokedCertificate"
	revokeCertificate := map[string]interface{}{
		"preEnrollmentCode":     preEnrollmentCode,
		"dose":                  dose,
		"previousCertificateId": certificateId,
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
	if resp, err := kernelService.QueryRegistry(typeId, filter, config.Config.SearchRegistry.DefaultLimit, config.Config.SearchRegistry.DefaultOffset); err == nil {
		if revokedCertificate, ok := resp[typeId].([]interface{}); ok {
			if len(revokedCertificate) > 0 {
				log.Infof("%v certificateId already exists in revocation", certificateId)
				return nil
			}
			_, err = kernelService.CreateNewRegistry(revokeCertificate, typeId)
			if err != nil {
				log.Infof("Failed saving revoked Certificate %+v", err)
				return err
			}
			log.Infof("%v certificateId added to revocation", certificateId)
			return nil
		}
	}
	return errors.New("error occurred while adding certificate to revocation list")
}

func deleteKeyFromRedis(preEnrollmentCode string, programId string, dose int) {
	log.Infof("preEnrollmentCode %+v programId %+v dose %+v", preEnrollmentCode, programId, dose)

	key := preEnrollmentCode + "-" + programId + "-" + strconv.Itoa(dose)
	if config.Config.Redis.ProgramIdCaching == "false" {
		key = preEnrollmentCode + "-" + strconv.Itoa(dose)
	}
	log.Infof("Key for Redis : %v, %v", key, config.Config.Redis.ProgramIdCaching)
	err := services.DeleteValue(key)
	if err != nil {
		log.Errorf("Error while deleting key from redis: %v", err)
	}
}
