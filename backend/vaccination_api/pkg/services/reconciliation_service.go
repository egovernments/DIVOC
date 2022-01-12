package services

import (
	"encoding/json"
	"errors"
	"github.com/divoc/api/pkg/models"
	models2 "github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/kernel_library/services"
	"github.com/go-openapi/strfmt"
	log "github.com/sirupsen/logrus"
	"sort"
	"time"
)

func getDoseFromCertificate(certificateMap map[string]interface{}) int {
	if doseValue, found := certificateMap["dose"]; found {
		if doseValueFloat, ok := doseValue.(float64); ok {
			return int(doseValueFloat)
		}
	}
	if certificateJson, found := certificateMap["certificate"]; found {
		var certificate models.Certificate
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

func getDoseWiseCertificates(certificates []interface{}) map[int][]map[string]interface{} {
	doseWiseCertificates := map[int][]map[string]interface{}{}
	for _, certificateObj := range certificates {
		if certificate, ok := certificateObj.(map[string]interface{}); ok {
			if doseValue := getDoseFromCertificate(certificate); doseValue != 0 {
				doseWiseCertificates[doseValue] = append(doseWiseCertificates[doseValue], certificate)
			}
		}
	}
	return doseWiseCertificates
}

func sortCertificatesByCreateAt(certificateArr []interface{}) []interface{} {
	sort.Slice(certificateArr, func(i, j int) bool {
		certificateA := certificateArr[i].(map[string]interface{})
		certificateB := certificateArr[j].(map[string]interface{})
		certificateACreateAt := certificateA["_osCreatedAt"].(string)
		certificateBCreateAt := certificateB["_osCreatedAt"].(string)
		return certificateACreateAt < certificateBCreateAt
	})
	return certificateArr
}

func CheckDataConsistence(requestData *models2.CertificationRequestV2MetaVaccinationsItems0, dbData *models2.CertificationRequestV2Vaccination) (bool, error) {
	var vaccinationDate strfmt.DateTime
	var err error
	if !strfmt.IsDateTime(requestData.Date) {
		log.Error("Invalid vaccination date")
		return true, errors.New("invalid vaccination date")
	}
	if vaccinationDate, err = strfmt.ParseDateTime(requestData.Date); err != nil {
		return true, err
	}
	// assuming that none of these fields should be empty. If empty we will not do the data update
	if requestData.Batch == "" || requestData.Dose < 1 {
		log.Info("Required fields are invalid")
		return true, nil
	}
	if vaccinationDate != dbData.Date || requestData.Batch != dbData.Batch || requestData.Name != dbData.Name || requestData.Manufacturer != dbData.Manufacturer {
		return false, nil
	}
	return true, nil
}

func CreateUpdateRequestObject(certifyMessage *models2.CertificationRequestV2, dbData *models.Certificate,
	metaData *models2.CertificationRequestV2MetaVaccinationsItems0) *models2.CertificationRequestV2 {
	updateReqV2 := new(models2.CertificationRequestV2)
	updateReqV2.PreEnrollmentCode = certifyMessage.PreEnrollmentCode
	updateReqV2.Recipient = certifyMessage.Recipient
	updateReqV2.Vaccination = createVaccinationInfo(metaData, dbData)
	updateReqV2.Vaccinator = createVaccinatorInfo(dbData)
	updateReqV2.Facility = createFacilityInfo(dbData)
	updateReqV2.Meta = createMetaInfo(dbData)
	return updateReqV2
}

func createVaccinatorInfo(dbData *models.Certificate) *models2.CertificationRequestV2Vaccinator {
	vaccinator := new(models2.CertificationRequestV2Vaccinator)
	vaccinator.Name = dbData.Evidence[0].Verifier.Name
	return vaccinator
}

func createVaccinationInfo(metaData *models2.CertificationRequestV2MetaVaccinationsItems0,
	dbData *models.Certificate) *models2.CertificationRequestV2Vaccination {
	vaccinationInfo := new(models2.CertificationRequestV2Vaccination)
	vaccinationInfo.Date, _ = strfmt.ParseDateTime(metaData.Date)
	if metaData.Name != "" {
		vaccinationInfo.Name = metaData.Name
	} else {
		vaccinationInfo.Name = dbData.Evidence[0].Vaccine
	}
	vaccinationInfo.Dose = float64(metaData.Dose)
	vaccinationInfo.TotalDoses = dbData.Evidence[0].TotalDoses.(float64)
	vaccinationInfo.Batch = metaData.Batch
	if metaData.Manufacturer != "" {
		vaccinationInfo.Manufacturer = metaData.Manufacturer
	} else {
		vaccinationInfo.Manufacturer = dbData.Evidence[0].Manufacturer
	}
	vaccinationInfo.Manufacturer = metaData.Manufacturer
	effectiveStart, terr := time.Parse("2006-01-02", dbData.Evidence[0].EffectiveStart)
	if terr != nil {
		log.Info("error while parsing effectiveStart Date")
	}
	vaccinationInfo.EffectiveStart = strfmt.Date(effectiveStart)
	effectiveUntil, terr := time.Parse("2006-01-02", dbData.Evidence[0].EffectiveUntil)
	if terr != nil {
		log.Info("error while parsing effectiveUntilDate")
	}
	vaccinationInfo.EffectiveUntil = strfmt.Date(effectiveUntil)
	return vaccinationInfo
}

func createFacilityInfo(dbData *models.Certificate) *models2.CertificationRequestV2Facility {
	facility := new(models2.CertificationRequestV2Facility)
	facilityInDB := dbData.Evidence[0].Facility
	facility.Name = facilityInDB.Name
	facilityAddress := new(models2.CertificationRequestV2FacilityAddress)
	facilityAddress.AddressLine1 = facilityInDB.Address.StreetAddress
	facilityAddress.AddressLine2 = facilityInDB.Address.StreetAddress2
	facilityAddress.District = facilityInDB.Address.District
	facilityAddress.State = facilityInDB.Address.AddressRegion
	if facilityInDB.Address.PostalCode != "" {
		facilityAddress.Pincode = int64(facilityInDB.Address.PostalCode.(float64))
	}
	facility.Address = facilityAddress
	return facility
}

func createMetaInfo(dbData *models.Certificate) *models2.CertificationRequestV2Meta {
	meta := new(models2.CertificationRequestV2Meta)
	meta.PreviousCertificateID = dbData.Evidence[0].CertificateId
	return meta
}

func reconcileData(certifyMessage *models2.CertificationRequestV2) {
	filter := map[string]interface{}{
		"preEnrollmentCode": map[string]interface{}{
			"eq": certifyMessage.PreEnrollmentCode,
		},
	}
	certificateFromRegistry, err := services.QueryRegistry("VaccinationCertificate", filter)
	certificates := certificateFromRegistry["VaccinationCertificate"].([]interface{})
	certificates = sortCertificatesByCreateAt(certificates)
	if err == nil && len(certificates) > 0 {
		certificatesByDose := getDoseWiseCertificates(certificates)
		for _, vaccinationData := range certifyMessage.Meta.Vaccinations {
			var certificate models.Certificate
			dose := vaccinationData.Dose
			doseCertificates := certificatesByDose[int(dose)]
			if doseCertificates == nil || len(doseCertificates) == 0 {
				continue
			}
			latestDoseCertificate := doseCertificates[len(doseCertificates)-1]
			dbData := new(models2.CertificationRequestV2Vaccination)
			if err := json.Unmarshal([]byte(latestDoseCertificate["certificate"].(string)), &certificate); err != nil {
				log.Error("Unable to parse certificate string", err)
				continue
			}
			dbData.Batch = certificate.Evidence[0].Batch
			dbData.Date = strfmt.DateTime(certificate.Evidence[0].Date)
			dbData.Name = certificate.Evidence[0].Vaccine
			dbData.Manufacturer = certificate.Evidence[0].Manufacturer
			if isDataConsistent, err := CheckDataConsistence(vaccinationData, dbData); err == nil {
				if isDataConsistent {
					continue
				} else {
					updateRequestObject := CreateUpdateRequestObject(certifyMessage, &certificate, vaccinationData)
					if jsonRequestString, err := json.Marshal(updateRequestObject); err == nil {
						PublishCertifyMessage(
							jsonRequestString,
							nil,
							nil,
							MessageHeader{CertificateType: CERTIFICATE_TYPE_V3})
					}
				}
			} else {
				log.Error(err)
				continue
			}
		}
	}
}
