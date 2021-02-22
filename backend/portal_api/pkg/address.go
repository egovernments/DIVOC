package pkg

import "github.com/divoc/portal-api/swagger_gen/models"

func GetAddressObject(data *Scanner) *models.Address {
	addressLine1 := data.Text("addressLine1")
	addressLine2 := data.Text("addressLine2")
	district := data.Text("district")
	state := data.Text("state")
	pincode := data.int64("pincode")
	return &models.Address{
		AddressLine1: &addressLine1,
		AddressLine2: &addressLine2,
		District:     &district,
		State:        &state,
		Pincode:      &pincode,
	}
}
