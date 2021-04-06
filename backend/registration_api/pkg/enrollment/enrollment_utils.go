package enrollment

import (
	"errors"

	kernelService "github.com/divoc/kernel_library/services"
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
