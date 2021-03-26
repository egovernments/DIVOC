package enrollment

import (
	"errors"

	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/pkg/services"
)

const RegistryName = "Enrollment"

func DeleteRecipient(osid string) error {
	if osid == "" {
		return errors.New("osid is missing in the request")
	}
	updatePayload := map[string]interface{}{
		"osid":             osid,
		"code":             "deleted-code-" + osid,
		"beneficiaryPhone": "deleted-beneficiary" + osid,
		"_status":          "false",
	}
	_, err := kernelService.UpdateRegistry(RegistryName, updatePayload)
	return err
}

func GetOsid(enrollmentCode string) string {
	exists, _ := services.KeyExists(enrollmentCode)
	if exists == 1 {
		values, _ := services.GetHashValues(enrollmentCode)
		return values["osid"]
	} else {
		//TODO: Get from query
		return ""
	}
}

func DeleteAppointment(enrollmentCode string, lastBookedSlotId string) error {
	err := services.CancelBookedAppointment(lastBookedSlotId)
	if err != nil {
		return errors.New("Failed to cancel appointment")
	} else {
		isMarked := services.RevokeEnrollmentBookedStatus(enrollmentCode)
		if isMarked {
			return nil
		}
	}
	return errors.New("Failed to cancel appointment")
}
