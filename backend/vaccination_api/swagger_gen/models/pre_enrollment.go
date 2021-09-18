// Code generated by go-swagger; DO NOT EDIT.

package models

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"encoding/json"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/strfmt"
	"github.com/go-openapi/swag"
	"github.com/go-openapi/validate"
)

// PreEnrollment pre enrollment
//
// swagger:model PreEnrollment
type PreEnrollment struct {

	// code
	Code string `json:"code,omitempty"`

	// dob
	// Format: date
	Dob strfmt.Date `json:"dob,omitempty"`

	// email
	Email string `json:"email,omitempty"`

	// enrollment scope Id
	EnrollmentScopeID string `json:"enrollmentScopeId,omitempty"`

	// gender
	// Enum: [Male Female Other]
	Gender string `json:"gender,omitempty"`

	// meta
	Meta interface{} `json:"meta,omitempty"`

	// name
	Name string `json:"name,omitempty"`

	// national Id
	NationalID string `json:"nationalId,omitempty"`

	// phone
	Phone string `json:"phone,omitempty"`
}

// Validate validates this pre enrollment
func (m *PreEnrollment) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateDob(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateGender(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *PreEnrollment) validateDob(formats strfmt.Registry) error {

	if swag.IsZero(m.Dob) { // not required
		return nil
	}

	if err := validate.FormatOf("dob", "body", "date", m.Dob.String(), formats); err != nil {
		return err
	}

	return nil
}

var preEnrollmentTypeGenderPropEnum []interface{}

func init() {
	var res []string
	if err := json.Unmarshal([]byte(`["Male","Female","Other"]`), &res); err != nil {
		panic(err)
	}
	for _, v := range res {
		preEnrollmentTypeGenderPropEnum = append(preEnrollmentTypeGenderPropEnum, v)
	}
}

const (

	// PreEnrollmentGenderMale captures enum value "Male"
	PreEnrollmentGenderMale string = "Male"

	// PreEnrollmentGenderFemale captures enum value "Female"
	PreEnrollmentGenderFemale string = "Female"

	// PreEnrollmentGenderOther captures enum value "Other"
	PreEnrollmentGenderOther string = "Other"
)

// prop value enum
func (m *PreEnrollment) validateGenderEnum(path, location string, value string) error {
	if err := validate.EnumCase(path, location, value, preEnrollmentTypeGenderPropEnum, true); err != nil {
		return err
	}
	return nil
}

func (m *PreEnrollment) validateGender(formats strfmt.Registry) error {

	if swag.IsZero(m.Gender) { // not required
		return nil
	}

	// value enum
	if err := m.validateGenderEnum("gender", "body", m.Gender); err != nil {
		return err
	}

	return nil
}

// MarshalBinary interface implementation
func (m *PreEnrollment) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *PreEnrollment) UnmarshalBinary(b []byte) error {
	var res PreEnrollment
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}
