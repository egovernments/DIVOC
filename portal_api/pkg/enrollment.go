package pkg

import log "github.com/sirupsen/logrus"

//mobile,enrollmentScopeId,nationalId,dob,gender,name,email
type Enrollment struct {
	Phone string `json:"phone"`
	EnrollmentScopeId string `json:"enrollmentScopeId"`
	NationalId string `json:"nationalId"`
	Dob string `json:"dob"`
	Gender string `json:"gender"`
	Name string `json:"name"`
	Email string `json:"email"`
	Code string `json:"code"`
}

func createEnrollment(data *Scanner) error {
	//todo: pass it to queue and then process.
	//Name, Mobile, National Identifier, DOB, facilityId
	//EnrollmentScopeId instead of facility so that we can have flexibility of getting preenrollment at geo attribute like city etc.
	enrollment := Enrollment{
		Phone:            data.Text("phone"),
		EnrollmentScopeId: data.Text("enrollmentScopeId"),
		NationalId:        data.Text("nationalId"),
		Dob:               data.Text("dob"),
		Gender:            data.Text("gender"),
		Name:              data.Text("name"),
		Email:             data.Text("email"),
		Code: 			   generateEnrollmentCode(),
	}
	makeRegistryCreateRequest(enrollment, "Enrollment")
	err := notifyRecipient(enrollment)
	return err
}

func generateEnrollmentCode() string {
	return "12345"
}

func notifyRecipient(enrollment Enrollment) error {
	//todo on successful enrollment send text message   call notification service?
	recepient := "sms:" + enrollment.Phone
	message := "Your pre enrollment for vaccination is " + enrollment.Code
	log.Infof("Sending SMS %s %s", recepient, message)
	//notificationService.SendNotification(recepient, message) //TODO: wire it up with actual notification service.
	return nil
}
