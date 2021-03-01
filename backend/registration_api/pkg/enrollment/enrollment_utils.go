package enrollment

import (
	kernelService "github.com/divoc/kernel_library/services"
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
