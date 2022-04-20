package models

type Status string

const (
	ERROR      Status = "error"
	SUCCESS    Status = "success"
	TEMP_ERROR Status = "tempError"
)
