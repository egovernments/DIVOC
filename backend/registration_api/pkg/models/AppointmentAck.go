package models

import (
	"time"

	"github.com/go-openapi/strfmt"
)

type AppointmentAck struct {
	EnrollmentCode  string
	ProgramId		string
	Dose			string
	SlotID          string
	FacilityCode    string
	AppointmentDate strfmt.Date
	AppointmentTime string
	CreatedAt       time.Time
	Status          string
}

const AllottedStatus = "ALLOTTED"
const CancelledStatus = "CANCELLED"
