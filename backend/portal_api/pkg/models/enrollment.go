package models

//mobile,enrollmentScopeId,nationalId,dob,gender,name,email
type Enrollment struct {
	Phone             string `json:"phone"`
	EnrollmentScopeId string `json:"enrollmentScopeId"`
	NationalId        string `json:"nationalId"`
	Dob               string `json:"dob"`
	Gender            string `json:"gender"`
	Name              string `json:"name"`
	Email             string `json:"email"`
	Code              string `json:"code"`
	Certified         bool   `json:"certified"`
	ProgramId         string `json:"programId"`
}
