package pkg

import (
	"bytes"
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/pkg/services"
	log "github.com/sirupsen/logrus"
	"math/rand"
	"strconv"
	"text/template"
)

const preEnrollmentTemplateString = `
{{.Name}}, you have been registered to receive C-19 vaccine. Please proceed to the nearest vaccination center:
Location: 
Please show the Pre Enrollment Code: {{.Code}} to the center admin.
`

var preEnrollmentTemplate = template.Must(template.New("").Parse(preEnrollmentTemplateString))

//mobile,enrollmentScopeId,nationalId,dob,gender,name,email
type Enrollment struct {
	Phone             string `json:"phone"`
	EnrollmentScopeId string `json:"enrollmentScopeId"`
	NationalId        string `json:"nationalId"`
	Dob               string `json:"dob"`
	Gender            string `json:"gender"`
	Name              string `json:"name"`
	Email             string `json:"email"`
	Code              string `json:"code"`
}

func createEnrollment(data *Scanner) error {
	//todo: pass it to queue and then process.
	//Name, Mobile, National Identifier, DOB, facilityId
	//EnrollmentScopeId instead of facility so that we can have flexibility of getting preenrollment at geo attribute like city etc.
	enrollment := Enrollment{
		Phone:             data.Text("phone"),
		EnrollmentScopeId: data.Text("enrollmentScopeId"),
		NationalId:        data.Text("nationalId"),
		Dob:               data.Text("dob"),
		Gender:            data.Text("gender"),
		Name:              data.Text("name"),
		Email:             data.Text("email"),
		Code:              generateEnrollmentCode(),
	}
	kernelService.MakeRegistryCreateRequest(enrollment, "Enrollment")
	err := notifyRecipient(enrollment)
	return err
}

func generateEnrollmentCode() string {
	return strconv.Itoa(10000 + rand.Intn(90000)) //five digit random code
}

func notifyRecipient(enrollment Enrollment) error {
	//TODO : fetch facility and add facility info to message
	recipient := "sms:" + enrollment.Phone
	message := "Your pre enrollment for vaccination is " + enrollment.Code
	log.Infof("Sending SMS %s %s", recipient, message)
	buf := bytes.Buffer{}
	err := preEnrollmentTemplate.Execute(&buf, enrollment)
	if err == nil {
		subject := "DIVOC - Pre-Enrollment"
		if len(enrollment.Phone) > 0 {
			services.PublishNotificationMessage("tel:"+enrollment.Phone, subject, buf.String())
		}
		if len(enrollment.Email) > 0 {
			services.PublishNotificationMessage("mailto:"+enrollment.Email, subject, buf.String())
		}
	} else {
		return err
	}
	return nil
}
