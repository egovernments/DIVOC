package enrollment

import (
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/pkg/services"
)

const RegistryName = "Enrollment"

func DeleteRecipient(osid string) error {
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
