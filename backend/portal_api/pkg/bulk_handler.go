package pkg

import (
	"bytes"
	"github.com/divoc/kernel_library/services"
	kafkaServices "github.com/divoc/portal-api/pkg/services"
	"github.com/divoc/portal-api/swagger_gen/models"
	"strconv"
	"strings"
	"text/template"
)

const facilityRegisteredTemplateString = `
Welcome {{.FacilityName}}.
Your facility has been registered under divoc. 
You can login at https://divoc.xiv.in/portal using {{.Admins}} contact numbers.
`

var facilityRegisteredTemplate = template.Must(template.New("").Parse(facilityRegisteredTemplateString))

func createVaccinator(data *Scanner) error {
	serialNum, err := strconv.ParseInt(data.Text("serialNum"), 10, 64)
	if err != nil {
		return err
	}
	mobileNumber := data.Text("mobileNumber")
	nationalIdentifier := data.Text("nationalIdentifier")
	code := data.Text("code")
	name := data.Text("name")
	status := data.Text("status")
	facilityIds := strings.Split(data.Text("facilityIds"), ",")
	averageRating := 0.0
	trainingCertificate := ""
	vaccinator := models.Vaccinator{
		SerialNum:           &serialNum,
		MobileNumber:        &mobileNumber,
		NationalIdentifier:  &nationalIdentifier,
		Code:                &code,
		Name:                &name,
		Status:              &status,
		FacilityIds:         facilityIds,
		AverageRating:       &averageRating,
		Signatures:          []*models.Signature{},
		TrainingCertificate: &trainingCertificate,
	}
	services.MakeRegistryCreateRequest(vaccinator, "Vaccinator")
	return nil
}

func sendFacilityRegisteredNotification(facility models.Facility) {
	buf := bytes.Buffer{}
	err := facilityRegisteredTemplate.Execute(&buf, facility)
	if err == nil {
		kafkaServices.PublishNotificationMessage("mailto:"+facility.Email, "DIVOC - Facility registration", buf.String())
	}
}
