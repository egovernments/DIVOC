package models

import "time"

type Event struct {
	Date          time.Time   `json:"date"`
	Source        string      `json:"source"`
	TypeOfMessage string      `json:"type"`
	ExtraInfo     interface{} `json:"extra"`
}

type ProcStatus struct {
	PreEnrollmentCode string    `json:"preEnrollmentCode"`
	Status            string    `json:"status"`
	ProcType          string    `json:"procType"`
	Date              time.Time `json:"date"`
}
