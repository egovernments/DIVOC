package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"text/template"

	"github.com/divoc/registration-api/swagger_gen/restapi/operations"
	"github.com/go-openapi/runtime/middleware"

	"errors"

	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	models2 "github.com/divoc/registration-api/pkg/models"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/models"
	openApiError "github.com/go-openapi/errors"
	log "github.com/sirupsen/logrus"
)

var DuplicateEnrollmentCriteria = map[string]func(e1, e2 models.Enrollment) bool{
	"Identity Number": func(e1, e2 models.Enrollment) bool { return *e1.Identity == *e2.Identity },
	"Name and Age":    func(e1, e2 models.Enrollment) bool { return e1.Name == e2.Name && e1.Yob == e2.Yob },
}

const EnrollmentEntity = "Enrollment"
const DUPLICATE_MSG = "duplicate key value violates unique constraint"

func MarkPreEnrolledUserCertified(preEnrollmentCode string, phone string, name string, dose float64, certificateId string, vaccine string, programId string, totalDoses float64, enrollmentOsid string) {
	enrollmentResponse, err := kernelService.ReadRegistry(EnrollmentEntity, enrollmentOsid)
	if err == nil {
		enrollmentObj := enrollmentResponse[EnrollmentEntity].(map[string]interface{})
		if enrollmentObj != nil {
			if appointments, ok := enrollmentObj["appointments"].([]interface{}); ok {
				for _, appointmentObj := range appointments {
					appointment := appointmentObj.(map[string]interface{})
					appointmentProgramId := appointment["programId"].(string)
					appointmentDose := appointment["dose"].(string)
					if appointmentProgramId == programId && appointmentDose == strconv.FormatFloat(dose, 'f', -1, 64) {
						appointment["certified"] = true
						appointment["certificateId"] = certificateId
						appointment["vaccine"] = vaccine
						break
					}
				}
				if dose < totalDoses {
					log.Infof("Registering %s to next program %s dose %s", preEnrollmentCode, programId, dose)
					enrollmentObj["appointments"] = append(appointments, registerToNextDose(programId, dose))
				}
				response, err := kernelService.UpdateRegistry(EnrollmentEntity, enrollmentObj)
				if err == nil {
					log.Debugf("Updated enrollment registry successfully %v", response)
				} else {
					log.Error("Failed updating enrollment registry", err)
				}
			}
		} else {
			log.Error("Enrollment not found for osid %v", enrollmentOsid)
		}
	} else {
		log.Error("Failed reading enrollments registry for osid", enrollmentOsid)
	}
}

func registerToNextDose(programId string, dose float64) map[string]interface{} {
	newAppointment := map[string]interface{}{}
	newAppointment["programId"] = programId
	newAppointment["certified"] = false
	newAppointment["certificateId"] = ""
	newAppointment["vaccine"] = ""
	newAppointment["enrollmentScopeId"] = ""
	newAppointment["appointmentDate"] = "0001-01-01"
	newAppointment["appointmentSlot"] = ""
	newAppointment["dose"] = utils.ToString(dose + 1)
	return newAppointment
}

func CreateEnrollment(enrollmentPayload *EnrollmentPayload, retryCount int) error {

	enrollmentArr, err := FetchEnrollments(enrollmentPayload.Phone)
	if err != nil {
		return err
	}
	var enrollments []enrollment
	if err := json.Unmarshal(enrollmentArr, &enrollments); err != nil {
		log.Errorf("Error occurred while trying to unmarshal the array of enrollments (%v)", err)
		return err
	}

	dupEnrollment, err := FindDuplicate(*enrollmentPayload, enrollments)
	if err != nil {
		log.Error("Error finding duplicates ", err)
		return err
	}

	if dupEnrollment != nil {
		enrollmentPayload.OverrideEnrollmentCode(dupEnrollment.Duplicate.Code)
		enrollmentPayload.OverrideEnrollmentOsid(dupEnrollment.Duplicate.Osid)
		duplicateErr := fmt.Errorf("enrollment with same %s already exists", dupEnrollment.Criteria)
		log.Error("Duplicates Found : ", duplicateErr)
		if enrollmentPayload.EnrollmentType == models.EnrollmentEnrollmentTypeWALKIN {
			return updateEnrollmentWithWalkInInfo(*dupEnrollment.Duplicate, *enrollmentPayload)
		}
		if shouldAutoBookAppointment(enrollmentPayload) {
			return BookAppointment(dupEnrollment.Duplicate.Phone, dupEnrollment.Duplicate.Code, enrollmentPayload.Appointments[0])
		}
		return duplicateErr
	}

	// no duplicates, not walk-in, error with enrollment limit reached
	if enrollmentPayload.EnrollmentType != models.EnrollmentEnrollmentTypeWALKIN && len(enrollments) >= config.Config.EnrollmentCreation.MaxEnrollmentCreationAllowed {
		errMsg := "Maximum enrollment creation limit is reached"
		log.Error(errMsg)
		return openApiError.New(400, errMsg)
	}

	// no duplicates, after maxEnrollment check
	if retryCount == 0 {
		// generate new enrollmentCode
		enrollmentPayload.OverrideEnrollmentCode(func() string {
			existingCodes := map[string]bool{}
			for _, e := range enrollments {
				existingCodes[e.Code] = true
			}
			i := 1
			for {
				newCode := utils.GenerateEnrollmentCode(enrollmentPayload.Phone, i)
				if !existingCodes[newCode] {
					log.Info("New Code : ", newCode)
					return newCode
				}
				i++
			}
		}())
	} else {
		// increment the enrollment code
		eNo, _ := strconv.Atoi(strings.Split(enrollmentPayload.Enrollment.Code, "-")[1])
		eNo = eNo + 1
		if eNo >= config.Config.EnrollmentCreation.MaxEnrollmentCreationAllowed {
			errMsg := "Maximum enrollment creation limit is reached"
			log.Error(errMsg)
			return openApiError.New(400, errMsg)
		}
		enrollmentPayload.OverrideEnrollmentCode(utils.GenerateEnrollmentCode(enrollmentPayload.Phone, eNo))
	}

	registryResponse, err := kernelService.CreateNewRegistry(enrollmentPayload.Enrollment, "Enrollment")
	if err != nil {
		log.Error("Error quering registry : ", err)
		if strings.Contains(err.Error(), DUPLICATE_MSG) {
			// enrollmentCode already exists, trying with new enrollment code
			if retryCount <= config.Config.EnrollmentCreation.MaxRetryCount {
				log.Infof("Duplicate enrollmentCode found, retrying attempt ", retryCount, " of ", config.Config.EnrollmentCreation.MaxRetryCount)
				retryCount = retryCount + 1
				return CreateEnrollment(enrollmentPayload, retryCount)
			} else {
				log.Error("Max retry attempted")
				return err
			}
		}
		return err
	}
	result := registryResponse.Result["Enrollment"].(map[string]interface{})["osid"]
	enrollmentPayload.OverrideEnrollmentOsid(result.(string))
	cacheEnrollmentInfo(enrollmentPayload.Enrollment, result.(string))
	if shouldAutoBookAppointment(enrollmentPayload) {
		return BookAppointment(enrollmentPayload.Phone, enrollmentPayload.Code, enrollmentPayload.Appointments[0])
	}
	return nil
}

func updateEnrollmentWithWalkInInfo(enrollment enrollment, walkInfo EnrollmentPayload) error {
	if len(walkInfo.Appointments) != 1 {
		return fmt.Errorf("payload has more than one or no appointment info")
	}
	if walkInfo.Address == nil {
		return fmt.Errorf("payload has no address details")
	}
	log.Infof("Updating Address, Booking Info & comorbidities for the enrollment %s from walk-in payload", enrollment.Code)
	appointmentWalkInfo := walkInfo.Appointments[0]
	existingAppointment := func() *models.EnrollmentAppointmentsItems0 {
		for _, a := range enrollment.Appointments {
			if a.ProgramID == appointmentWalkInfo.ProgramID && a.Dose == appointmentWalkInfo.Dose && !a.Certified {
				log.Info("Enrollee has already booked an appointment. Overriding it")
				return a
			}
		}
		log.Info("Enrolle did not book an appointment. Adding it")
		return nil
	}()
	if existingAppointment != nil {
		existingAppointment.EnrollmentScopeID = appointmentWalkInfo.EnrollmentScopeID
		existingAppointment.AppointmentDate = appointmentWalkInfo.AppointmentDate
		existingAppointment.Certified = appointmentWalkInfo.Certified
		existingAppointment.AppointmentSlot = appointmentWalkInfo.AppointmentSlot
	} else {
		enrollment.Appointments = append(enrollment.Appointments, appointmentWalkInfo)
	}

	enrollment.Address.Address = *walkInfo.Address
	enrollment.Comorbidities = walkInfo.Comorbidities

	enrollmentJSON, err := utils.ToMap(enrollment)
	if err != nil {
		log.Error("Error converting enrollment to map ", err)
		return err
	}
	if _, err := kernelService.UpdateRegistry("Enrollment", enrollmentJSON); err != nil {
		log.Error("Error updating registry : ", err)
		return err
	}
	return nil
}

func BookAppointment(phone, enrollmentCode string, appointment *models.EnrollmentAppointmentsItems0) error {
	openSlot, err := GetOpenFacilitySlot(appointment.EnrollmentScopeID, appointment.ProgramID)
	if err != nil {
		log.Error("Error fetching open slot : ", err)
		return err
	}
	return BookSlot(enrollmentCode, phone, openSlot, appointment.Dose, appointment.ProgramID)
}

func shouldAutoBookAppointment(enrollmentPayload *EnrollmentPayload) bool {
	return enrollmentPayload.EnrollmentType == models.EnrollmentEnrollmentTypePREENRL && len(enrollmentPayload.Appointments) > 0 && enrollmentPayload.Appointments[0].EnrollmentScopeID != ""
}

func EnrichFacilityDetails(enrollments []map[string]interface{}) {
	for _, enrollment := range enrollments {
		if enrollment["appointments"] == nil {
			continue
		}
		appointments := enrollment["appointments"].([]interface{})

		// No appointment means no need to show the facility details
		for _, appointment := range appointments {
			if facilityCode, ok := appointment.(map[string]interface{})["enrollmentScopeId"].(string); ok && facilityCode != "" && len(facilityCode) > 0 {
				minifiedFacilityDetails := GetMinifiedFacilityDetails(facilityCode)
				appointment.(map[string]interface{})["facilityDetails"] = minifiedFacilityDetails
			}
		}
	}
}

func NotifyRecipient(enrollment *models.Enrollment) error {
	EnrollmentRegistered := "enrollmentRegistered"
	enrollmentTemplateString := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Subject

	var enrollmentTemplate = template.Must(template.New("").Parse(enrollmentTemplateString))

	recipient := "sms:" + enrollment.Phone
	message := "Your enrollment code for vaccination is " + enrollment.Code

	log.Infof("Sending NotifyRecipient SMS")
	log.Debugf("SMS: %s %s", recipient, message)
	
	buf := bytes.Buffer{}
	err := enrollmentTemplate.Execute(&buf, enrollment)
	if err == nil {
		if len(enrollment.Phone) > 0 {
			PublishNotificationMessage("tel:"+enrollment.Phone, subject, buf.String())
		}
		if len(enrollment.Email) > 0 {
			PublishNotificationMessage("mailto:"+enrollment.Email, subject, buf.String())
		}
	} else {
		log.Errorf("Error occurred while parsing the message (%v)", err)
		return err
	}
	return nil
}

func NotifyAppointmentBooked(appointmentNotification models2.AppointmentNotification) error {
	appointmentBooked := "appointmentBooked"
	appointmentBookedTemplateString := kernelService.FlagrConfigs.NotificationTemplates[appointmentBooked].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[appointmentBooked].Subject

	var appointmentBookedTemplate = template.Must(template.New("").Parse(appointmentBookedTemplateString))

	recipient := "sms:" + appointmentNotification.RecipientPhone

	log.Infof("Sending NotifyAppointmentBooked SMS")
	log.Debugf("SMS: %s %s", recipient, appointmentNotification)

	buf := bytes.Buffer{}
	err := appointmentBookedTemplate.Execute(&buf, appointmentNotification)
	if err == nil {
		if len(appointmentNotification.RecipientPhone) > 0 {
			PublishNotificationMessage("tel:"+appointmentNotification.RecipientPhone, subject, buf.String())
		}
		if len(appointmentNotification.RecipientEmail) > 0 {
			PublishNotificationMessage("mailto:"+appointmentNotification.RecipientEmail, subject, buf.String())
		}
	} else {
		log.Errorf("Error occurred while parsing the message (%v)", err)
		return err
	}
	return nil
}

func NotifyAppointmentCancelled(appointmentNotification models2.AppointmentNotification) error {
	appointmentCancelled := "appointmentCancelled"
	appointmentBookedTemplateString := kernelService.FlagrConfigs.NotificationTemplates[appointmentCancelled].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[appointmentCancelled].Subject

	var appointmentBookedTemplate = template.Must(template.New("").Parse(appointmentBookedTemplateString))

	recipient := "sms:" + appointmentNotification.RecipientPhone

	log.Infof("Sending NotifyAppointmentCancelled SMS")
	log.Debugf("SMS: %s %s", recipient, appointmentNotification)

	buf := bytes.Buffer{}
	err := appointmentBookedTemplate.Execute(&buf, appointmentNotification)
	if err == nil {
		if len(appointmentNotification.RecipientPhone) > 0 {
			PublishNotificationMessage("tel:"+appointmentNotification.RecipientPhone, subject, buf.String())
		}
		if len(appointmentNotification.RecipientEmail) > 0 {
			PublishNotificationMessage("mailto:"+appointmentNotification.RecipientEmail, subject, buf.String())
		}
	} else {
		log.Errorf("Error occurred while parsing the message (%v)", err)
		return err
	}
	return nil
}

func NotifyDeletedRecipient(enrollmentCode string, enrollment map[string]string) error {
	EnrollmentRegistered := "enrollmentDeleted"
	enrollmentTemplateString := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Message
	subject := kernelService.FlagrConfigs.NotificationTemplates[EnrollmentRegistered].Subject

	var enrollmentTemplate = template.Must(template.New("").Parse(enrollmentTemplateString))
	enrollment["enrollmentCode"] = enrollmentCode
	phone := enrollment["phone"]
	buf := bytes.Buffer{}
	err := enrollmentTemplate.Execute(&buf, enrollment)
	if err == nil {
		if len(phone) > 0 {
			PublishNotificationMessage("tel:"+phone, subject, buf.String())
		}
	} else {
		log.Errorf("Error occurred while parsing the message (%v)", err)
		return err
	}
	return nil
}

func FindDuplicate(enrollmentPayload EnrollmentPayload, enrollments []enrollment) (*DuplicateEnrollment, error) {
	searchDuplicateEnrollment := func(enrollments []enrollment, target models.Enrollment, criteria func(e1, e2 models.Enrollment) bool) *enrollment {
		for _, e := range enrollments {
			if criteria(e.Enrollment, target) {
				return &e
			}
		}
		return nil
	}

	for fields, criteria := range DuplicateEnrollmentCriteria {
		if duplicate := searchDuplicateEnrollment(enrollments, *enrollmentPayload.Enrollment, criteria); duplicate != nil {
			return &DuplicateEnrollment{
				Duplicate: duplicate,
				Criteria:  fields,
			}, nil
		}
	}
	return nil, nil
}

func GetEnrollmentInfoIfValid(enrollmentCode string, phone string) map[string]string {
	values, err := GetHashValues(enrollmentCode)
	if err == nil {
		if val, ok := values["phone"]; ok && val == phone {
			return values
		}
	}
	return nil
}

func FetchEnrollments(mobile string) ([]byte, error) {
	filter := map[string]interface{}{}
	filter["phone"] = map[string]interface{}{
		"eq": mobile,
	}
	responseFromRegistry, err := kernelService.QueryRegistry("Enrollment", filter, 100, 0)
	if err != nil {
		log.Error("Error occurred while querying Enrollment registry ", err)
		return nil, err
	}
	enrollmentArr, err := json.Marshal(responseFromRegistry["Enrollment"])
	if err != nil {
		log.Errorf("Error occurred while trying to marshal the array of enrollments (%v)", err)
		return nil, err
	}
	return enrollmentArr, nil
}

func cacheEnrollmentInfo(enrollment *models.Enrollment, osid string) {
	data := map[string]interface{}{
		"phone":        enrollment.Phone,
		"updatedCount": 0, //to restrict multiple updates
		"osid":         osid,
	}
	_, err := SetHMSet(enrollment.Code, data)
	if err != nil {
		log.Error("Unable to cache enrollment info", err)
	}
}

type EnrollmentPayload struct {
	RowID              uint                   `json:"rowID"`
	EnrollmentScopeId  string                 `json:"enrollmentScopeId"`
	VaccinationDetails map[string]interface{} `json:"vaccinationDetails"`
	*models.Enrollment
}

func (ep EnrollmentPayload) OverrideEnrollmentCode(code string) {
	ep.Code = code
	if len(ep.VaccinationDetails) > 0 && ep.EnrollmentType == models.EnrollmentEnrollmentTypeWALKIN {
		ep.VaccinationDetails["preEnrollmentCode"] = code
	}
}

func (ep EnrollmentPayload) OverrideEnrollmentOsid(osid string) {
	ep.Osid = osid
	if len(ep.VaccinationDetails) > 0 && ep.EnrollmentType == models.EnrollmentEnrollmentTypeWALKIN {
		enrollmentOsid := map[string]interface{}{
			"enrollmentOsid": osid,
		}
		ep.VaccinationDetails["meta"] = enrollmentOsid
	}
}

type DuplicateEnrollment struct {
	Duplicate *enrollment
	Criteria  string
}

type enrollment struct {
	Osid string `json:"osid"`
	models.Enrollment
	Address *struct {
		Osid string `json:"osid"`
		models.Address
	} `json:"address"`
}

func DRefAppointments(ptrSlice []*models.EnrollmentAppointmentsItems0) []models.EnrollmentAppointmentsItems0 {
	r := make([]models.EnrollmentAppointmentsItems0, 0, len(ptrSlice))
	for _, a := range ptrSlice {
		if a != nil {
			r = append(r, *a)
		}
	}
	return r
}

func validateEnrollmentAccess(enrollmentPhone string, jwtPhone string) bool {
	return enrollmentPhone == jwtPhone
}

func RegisterEnrollmentToProgram(params operations.RegisterRecipientToProgramParams, claimBody *models.JWTClaimBody) middleware.Responder {
	responseFromRegistry, err := kernelService.ReadRegistry("Enrollment", params.EnrollmentOsid)
	enrollmentResp, ok := responseFromRegistry["Enrollment"].(map[string]interface{})
	if !ok {
		log.Errorf("Unable to fetch the Enrollment details for the recipient (%v) ", params.EnrollmentOsid)
		return operations.NewRegisterRecipientToProgramBadRequest()
	}
	enrollmentStr, err := json.Marshal(enrollmentResp)
	if err != nil {
		log.Errorf("Unable to parse Enrollment details from Entity : %v, error: [%s]", enrollmentResp, err.Error())
		return operations.NewRegisterRecipientToProgramBadRequest()
	}

	var enrollment struct {
		Osid string `json:"osid"`
		models.Enrollment
	}
	if err := json.Unmarshal(enrollmentStr, &enrollment); err != nil {
		log.Errorf("Error parsing Enrollment to expected format. Enrollment [%s], error [%s]", enrollmentStr, err.Error())
		return operations.NewRegisterRecipientToProgramInternalServerError()
	}
	if valid := validateEnrollmentAccess(enrollment.Phone, claimBody.Phone); !valid {
		log.Errorf("Unauthorized access to update enrollment [%s], by phone [%s]", enrollmentStr, claimBody.Phone)
		return operations.NewRegisterRecipientToProgramUnauthorized()
	}
	for _, appointment := range enrollment.Appointments {
		if appointment.ProgramID == params.ProgramID {
			log.Infof("Recipient %s already registered for program %s", enrollment.Osid, params.ProgramID)
			return operations.NewRegisterRecipientToProgramOK()
		}
	}
	registration := models.EnrollmentAppointmentsItems0{
		Dose:          "1",
		ProgramID:     params.ProgramID,
		Comorbidities: params.Body.Comorbidities,
	}
	enrollment.Appointments = append(enrollment.Appointments, &registration)
	if _, err = kernelService.UpdateRegistry("Enrollment", map[string]interface{}{
		"osid":         enrollment.Osid,
		"appointments": enrollment.Appointments,
	}); err != nil {
		log.Error("Booking appointment failed ", err)
		return operations.NewRegisterRecipientToProgramInternalServerError()
	}
	return operations.NewRegisterRecipientToProgramOK()
}

func DeleteProgramInEnrollment(params operations.DeleteRecipientProgramParams, claimBody *models.JWTClaimBody) middleware.Responder {
	responseFromRegistry, err := kernelService.ReadRegistry("Enrollment", params.EnrollmentOsid)
	enrollmentResp, ok := responseFromRegistry["Enrollment"].(map[string]interface{})
	if !ok {
		log.Errorf("Unable to fetch the Enrollment details for the recipient (%v) ", params.EnrollmentOsid)
		return operations.NewRegisterRecipientToProgramBadRequest()
	}
	enrollmentStr, err := json.Marshal(enrollmentResp)
	if err != nil {
		log.Errorf("Unable to parse Enrollment details from Entity : %v, error: [%s]", enrollmentResp, err.Error())
		return operations.NewRegisterRecipientToProgramBadRequest()
	}

	var enrollment struct {
		Osid string `json:"osid"`
		models.Enrollment
	}
	if err := json.Unmarshal(enrollmentStr, &enrollment); err != nil {
		log.Errorf("Error parsing Enrollment to expected format. Enrollment [%s], error [%s]", enrollmentStr, err.Error())
		return operations.NewRegisterRecipientToProgramInternalServerError()
	}
	if valid := validateEnrollmentAccess(enrollment.Phone, claimBody.Phone); !valid {
		log.Errorf("Unauthorized access to update enrollment [%s], by phone [%s]", enrollmentStr, claimBody.Phone)
		return operations.NewRegisterRecipientToProgramUnauthorized()
	}
	updatedAppointments := removeAppointmentWithProgramId(enrollment.Appointments, params.ProgramID)
	if len(updatedAppointments) < len(enrollment.Appointments) || len(updatedAppointments) == 1 {
		if _, err = kernelService.UpdateRegistry("Enrollment", map[string]interface{}{
			"osid":         enrollment.Osid,
			"appointments": updatedAppointments,
		}); err != nil {
			log.Error("Booking appointment failed ", err)
			return operations.NewRegisterRecipientToProgramInternalServerError()
		}
	}
	return operations.NewRegisterRecipientToProgramOK()
}

func removeAppointmentWithProgramId(appointments []*models.EnrollmentAppointmentsItems0, programId string) []*models.EnrollmentAppointmentsItems0 {
	appointmentList := make([]*models.EnrollmentAppointmentsItems0, 0, 1)
	for _, appointment := range appointments {
		if !(appointment.ProgramID == programId && appointment.Dose == "1" && appointment.EnrollmentScopeID == "" && !appointment.Certified) && appointment.ProgramID != "" {
			appointmentList = append(appointmentList, appointment)
		}
	}
	if len(appointmentList) == 0 {
		appointmentList = append(appointmentList, &models.EnrollmentAppointmentsItems0{
			Comorbidities: []string{},
		})
	}
	return appointmentList
}

func GetBeneficiariesFromRegistry(filter map[string]interface{}) ([]map[string]interface{}, error) {
	responseFromRegistry, err := kernelService.QueryRegistry(EnrollmentEntity, filter, 100, 0)
	if err != nil {
		log.Error("Error occurred while querying Enrollment registry ", err)
		return nil, errors.New("error occurred while querying Enrollment registry ")
	}
	if enrollmentArr, err := json.Marshal(responseFromRegistry["Enrollment"]); err == nil {
		var enrollments []map[string]interface{}
		err := json.Unmarshal(enrollmentArr, &enrollments)
		if err != nil {
			log.Errorf("Error occurred while trying to unmarshal the array of enrollments (%v)", err)
			return nil, errors.New("error occurred while trying to unmarshal the array of enrollments")
		} else {
			return enrollments, nil
		}
	} else {
		log.Errorf("Error occurred while trying to marshal the array of enrollments (%v)", err)
		return nil, errors.New("error occurred while trying to marshal the array of enrollments")
	}
}
