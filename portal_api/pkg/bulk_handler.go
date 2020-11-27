package pkg

import (
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
	"strconv"
	"strings"
)

func createVaccinator(data *Scanner) error {
	serialNum, err := strconv.ParseInt(data.Text("serialNum"), 10, 64)
	if err != nil {
		return err
	}
	mobileNumber := data.Text("mobileNumber")
	nationalIdentifier := data.Text("nationalIdentifier")
	operatorCode := data.Text("operatorCode")
	operatorName := data.Text("operatorName")
	status := data.Text("status")
	facilityIds := strings.Split(data.Text("facilityIds"), ",")
	averageRating := 0.0
	trainingCertificate := ""
	vaccinator := models.Operator{
		SerialNum:          &serialNum,
		MobileNumber:       &mobileNumber,
		NationalIdentifier: &nationalIdentifier,
		OperatorCode:       &operatorCode,
		OperatorName:       &operatorName,
		Status:             &status,
		FacilityIds:        facilityIds,
		AverageRating: &averageRating,
		Signatures: []*models.Signature{},
		TrainingCertificate: &trainingCertificate,
	}
	makeRegistryCreateRequest(vaccinator, "Vaccinator")
	return nil
}

func createFacility(data *Scanner, authHeader string) error {
	//todo: pass it to queue and then process.
	//serialNum, facilityCode,facilityName,contact,operatingHourStart, operatingHourEnd, category, type, status,
	//admins,addressLine1,addressLine2, district, state, pincode, geoLocationLat, geoLocationLon
	serialNum, err := strconv.ParseInt(data.Text("serialNum"), 10, 64)
	if err != nil {
		return err
	}
	addressline1 := data.Text("addressLine1")
	addressline2 := data.Text("addressLine2")
	district := data.Text("district")
	state := data.Text("state")
	pincode := data.int64("pincode")
	facility := models.Facility{
		SerialNum: serialNum,
		FacilityCode: data.Text("facilityCode"),
		FacilityName: data.Text("facilityName"),
		Contact: data.Text("contact"),
		OperatingHourStart: data.int64("operatingHourStart"),
		OperatingHourEnd: data.int64("operatingHourEnd"),
		Category: data.Text("category"),
		Type: data.Text("type"),
		Status: data.Text("status"),
		Admins: strings.Split(data.Text("admins"), ","),
		Address: &models.Address{
			AddressLine1: &addressline1,
			AddressLine2: &addressline2,
			District: &district,
			State: &state,
			Pincode: &pincode,
		},
	}
	makeRegistryCreateRequest(facility, "Facility")
	for _, mobile := range facility.Admins {
		//create keycloak user for
		log.Info("Creating administrative login for the facility ", facility.FacilityName, mobile)
		resp, err := req.Post(config.Config.Keycloak.Url, req.BodyJSON(struct {
			Username string `json:"username"`
			Enabled string `json:"enabled"`
			Attributes struct{
				MobileNumber string `json:"mobile_number"`
			}
		}{
			Username: mobile,
			Enabled: "true",
			Attributes: struct {
				MobileNumber string `json:"mobile_number"`
			}{
				MobileNumber: mobile,
			},
		}),
			req.Header{"Authorization":authHeader},
		)
		log.Info("Created keycloak user" , resp.String());
		if err != nil || resp.Response().StatusCode != 200 {
			log.Fatal("Error while creating keycloak admin user : ", mobile)
		}
	}
	return nil
}
