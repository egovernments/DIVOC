package models

import "time"

type Event struct {
	Date          time.Time   `json:"date"`
	Source        string      `json:"source"`
	TypeOfMessage string      `json:"type"`
	ExtraInfo     interface{} `json:"extra"`
}

type ReconciliationEvent struct {
	Date                 time.Time `json:"date"`
	PreEnrollmentCode    string    `json:"preEnrollmentCode"`
	ReconciliationType   string    `json:"reconciliationType"`
	ReconciliationStatus string    `json:"reconciliationStatus"`
}
