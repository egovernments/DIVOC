package models

import (
	"time"
)

type ProcStatus struct {
	PreEnrollmentCode string    `json:"preEnrollmentCode"`
	Status            string    `json:"status"`
	ProcType          string    `json:"procType"`
	Date              time.Time `json:"date"`
}
