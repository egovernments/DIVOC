package main

import (
	"fmt"
	"github.com/divoc/api/pkg/models"
)

func GetTemplateName(certificate models.Certificate, isFinal bool, language string) string {
	states := []string{"TN"}
	var certType string
	var pollingType string

	isPolling := false
	for _, state := range states {
		if state == certificate.Evidence[0].Facility.Address.AddressRegion {
			isPolling = true
		}
	}
	if isPolling {
		pollingType = "PS"
	} else {
		pollingType = "NPS"
	}
	if isFinal {
		certType = "2"
	} else {
		certType = "1"
	}
	return fmt.Sprintf("config/cov19-%s-%s-%s.pdf", language, certType, pollingType)
}
