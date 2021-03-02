package models

import "time"

type AppointmentAck struct {
	EnrollmentCode  string
	ProgramId		string
	Dose			string
	SlotID          string
	FacilityCode    string
	AppointmentDate string
	AppointmentTime string
	CreatedAt       time.Time
	Status          string
}

const AllottedStatus = "ALLOTTED"
const CancelledStatus = "CANCELLED"
