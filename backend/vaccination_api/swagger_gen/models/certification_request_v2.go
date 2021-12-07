// Code generated by go-swagger; DO NOT EDIT.

package models

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"strconv"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/strfmt"
	"github.com/go-openapi/swag"
	"github.com/go-openapi/validate"
)

// CertificationRequestV2 certification request v2
//
// swagger:model CertificationRequestV2
type CertificationRequestV2 struct {

	// comorbidities
	Comorbidities []string `json:"comorbidities"`

	// enrollment type
	// Min Length: 1
	EnrollmentType string `json:"enrollmentType,omitempty"`

	// facility
	// Required: true
	Facility *CertificationRequestV2Facility `json:"facility"`

	// meta
	Meta interface{} `json:"meta,omitempty"`

	// pre enrollment code
	// Required: true
	PreEnrollmentCode *string `json:"preEnrollmentCode"`

	// program Id
	// Min Length: 1
	ProgramID string `json:"programId,omitempty"`

	// recipient
	// Required: true
	Recipient *CertificationRequestV2Recipient `json:"recipient"`

	// vaccination
	// Required: true
	Vaccination *CertificationRequestV2Vaccination `json:"vaccination"`

	// vaccinator
	Vaccinator *CertificationRequestV2Vaccinator `json:"vaccinator,omitempty"`
}

// Validate validates this certification request v2
func (m *CertificationRequestV2) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateEnrollmentType(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateFacility(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validatePreEnrollmentCode(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateProgramID(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateRecipient(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateVaccination(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateVaccinator(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *CertificationRequestV2) validateEnrollmentType(formats strfmt.Registry) error {

	if swag.IsZero(m.EnrollmentType) { // not required
		return nil
	}

	if err := validate.MinLength("enrollmentType", "body", string(m.EnrollmentType), 1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2) validateFacility(formats strfmt.Registry) error {

	if err := validate.Required("facility", "body", m.Facility); err != nil {
		return err
	}

	if m.Facility != nil {
		if err := m.Facility.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("facility")
			}
			return err
		}
	}

	return nil
}

func (m *CertificationRequestV2) validatePreEnrollmentCode(formats strfmt.Registry) error {

	if err := validate.Required("preEnrollmentCode", "body", m.PreEnrollmentCode); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2) validateProgramID(formats strfmt.Registry) error {

	if swag.IsZero(m.ProgramID) { // not required
		return nil
	}

	if err := validate.MinLength("programId", "body", string(m.ProgramID), 1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2) validateRecipient(formats strfmt.Registry) error {

	if err := validate.Required("recipient", "body", m.Recipient); err != nil {
		return err
	}

	if m.Recipient != nil {
		if err := m.Recipient.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("recipient")
			}
			return err
		}
	}

	return nil
}

func (m *CertificationRequestV2) validateVaccination(formats strfmt.Registry) error {

	if err := validate.Required("vaccination", "body", m.Vaccination); err != nil {
		return err
	}

	if m.Vaccination != nil {
		if err := m.Vaccination.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("vaccination")
			}
			return err
		}
	}

	return nil
}

func (m *CertificationRequestV2) validateVaccinator(formats strfmt.Registry) error {

	if swag.IsZero(m.Vaccinator) { // not required
		return nil
	}

	if m.Vaccinator != nil {
		if err := m.Vaccinator.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("vaccinator")
			}
			return err
		}
	}

	return nil
}

// MarshalBinary interface implementation
func (m *CertificationRequestV2) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *CertificationRequestV2) UnmarshalBinary(b []byte) error {
	var res CertificationRequestV2
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}

// CertificationRequestV2Facility certification request v2 facility
//
// swagger:model CertificationRequestV2Facility
type CertificationRequestV2Facility struct {

	// address
	Address *CertificationRequestV2FacilityAddress `json:"address,omitempty"`

	// name
	// Required: true
	// Min Length: 1
	Name *string `json:"name"`
}

// Validate validates this certification request v2 facility
func (m *CertificationRequestV2Facility) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateAddress(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateName(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *CertificationRequestV2Facility) validateAddress(formats strfmt.Registry) error {

	if swag.IsZero(m.Address) { // not required
		return nil
	}

	if m.Address != nil {
		if err := m.Address.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("facility" + "." + "address")
			}
			return err
		}
	}

	return nil
}

func (m *CertificationRequestV2Facility) validateName(formats strfmt.Registry) error {

	if err := validate.Required("facility"+"."+"name", "body", m.Name); err != nil {
		return err
	}

	if err := validate.MinLength("facility"+"."+"name", "body", string(*m.Name), 1); err != nil {
		return err
	}

	return nil
}

// MarshalBinary interface implementation
func (m *CertificationRequestV2Facility) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *CertificationRequestV2Facility) UnmarshalBinary(b []byte) error {
	var res CertificationRequestV2Facility
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}

// CertificationRequestV2FacilityAddress certification request v2 facility address
//
// swagger:model CertificationRequestV2FacilityAddress
type CertificationRequestV2FacilityAddress struct {

	// address line1
	// Required: true
	AddressLine1 *string `json:"addressLine1"`

	// address line2
	AddressLine2 string `json:"addressLine2,omitempty"`

	// country
	// Min Length: 2
	Country string `json:"country,omitempty"`

	// district
	// Required: true
	// Min Length: 1
	District *string `json:"district"`

	// pincode
	// Required: true
	// Min Length: 1
	Pincode *string `json:"pincode"`

	// state
	// Required: true
	// Min Length: 1
	State *string `json:"state"`
}

// Validate validates this certification request v2 facility address
func (m *CertificationRequestV2FacilityAddress) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateAddressLine1(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateCountry(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateDistrict(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validatePincode(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateState(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *CertificationRequestV2FacilityAddress) validateAddressLine1(formats strfmt.Registry) error {

	if err := validate.Required("facility"+"."+"address"+"."+"addressLine1", "body", m.AddressLine1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2FacilityAddress) validateCountry(formats strfmt.Registry) error {

	if swag.IsZero(m.Country) { // not required
		return nil
	}

	if err := validate.MinLength("facility"+"."+"address"+"."+"country", "body", string(m.Country), 2); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2FacilityAddress) validateDistrict(formats strfmt.Registry) error {

	if err := validate.Required("facility"+"."+"address"+"."+"district", "body", m.District); err != nil {
		return err
	}

	if err := validate.MinLength("facility"+"."+"address"+"."+"district", "body", string(*m.District), 1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2FacilityAddress) validatePincode(formats strfmt.Registry) error {

	if err := validate.Required("facility"+"."+"address"+"."+"pincode", "body", m.Pincode); err != nil {
		return err
	}

	if err := validate.MinLength("facility"+"."+"address"+"."+"pincode", "body", string(*m.Pincode), 1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2FacilityAddress) validateState(formats strfmt.Registry) error {

	if err := validate.Required("facility"+"."+"address"+"."+"state", "body", m.State); err != nil {
		return err
	}

	if err := validate.MinLength("facility"+"."+"address"+"."+"state", "body", string(*m.State), 1); err != nil {
		return err
	}

	return nil
}

// MarshalBinary interface implementation
func (m *CertificationRequestV2FacilityAddress) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *CertificationRequestV2FacilityAddress) UnmarshalBinary(b []byte) error {
	var res CertificationRequestV2FacilityAddress
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}

// CertificationRequestV2Recipient certification request v2 recipient
//
// swagger:model CertificationRequestV2Recipient
type CertificationRequestV2Recipient struct {

	// address
	Address *CertificationRequestV2RecipientAddress `json:"address,omitempty"`

	// age
	// Min Length: 1
	Age string `json:"age,omitempty"`

	// contact
	// Required: true
	Contact []string `json:"contact"`

	// dob
	// Format: date
	Dob *strfmt.Date `json:"dob,omitempty"`

	// gender
	// Min Length: 1
	Gender string `json:"gender,omitempty"`

	// identity
	// Required: true
	// Min Length: 1
	Identity *string `json:"identity"`

	// name
	// Required: true
	// Min Length: 1
	Name *string `json:"name"`

	// nationality
	// Required: true
	// Min Length: 1
	Nationality *string `json:"nationality"`
}

// Validate validates this certification request v2 recipient
func (m *CertificationRequestV2Recipient) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateAddress(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateAge(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateContact(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateDob(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateGender(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateIdentity(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateName(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateNationality(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *CertificationRequestV2Recipient) validateAddress(formats strfmt.Registry) error {

	if swag.IsZero(m.Address) { // not required
		return nil
	}

	if m.Address != nil {
		if err := m.Address.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("recipient" + "." + "address")
			}
			return err
		}
	}

	return nil
}

func (m *CertificationRequestV2Recipient) validateAge(formats strfmt.Registry) error {

	if swag.IsZero(m.Age) { // not required
		return nil
	}

	if err := validate.MinLength("recipient"+"."+"age", "body", string(m.Age), 1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Recipient) validateContact(formats strfmt.Registry) error {

	if err := validate.Required("recipient"+"."+"contact", "body", m.Contact); err != nil {
		return err
	}

	for i := 0; i < len(m.Contact); i++ {

		if err := validate.MinLength("recipient"+"."+"contact"+"."+strconv.Itoa(i), "body", string(m.Contact[i]), 1); err != nil {
			return err
		}

	}

	return nil
}

func (m *CertificationRequestV2Recipient) validateDob(formats strfmt.Registry) error {

	if swag.IsZero(m.Dob) { // not required
		return nil
	}

	if err := validate.FormatOf("recipient"+"."+"dob", "body", "date", m.Dob.String(), formats); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Recipient) validateGender(formats strfmt.Registry) error {

	if swag.IsZero(m.Gender) { // not required
		return nil
	}

	if err := validate.MinLength("recipient"+"."+"gender", "body", string(m.Gender), 1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Recipient) validateIdentity(formats strfmt.Registry) error {

	if err := validate.Required("recipient"+"."+"identity", "body", m.Identity); err != nil {
		return err
	}

	if err := validate.MinLength("recipient"+"."+"identity", "body", string(*m.Identity), 1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Recipient) validateName(formats strfmt.Registry) error {

	if err := validate.Required("recipient"+"."+"name", "body", m.Name); err != nil {
		return err
	}

	if err := validate.MinLength("recipient"+"."+"name", "body", string(*m.Name), 1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Recipient) validateNationality(formats strfmt.Registry) error {

	if err := validate.Required("recipient"+"."+"nationality", "body", m.Nationality); err != nil {
		return err
	}

	if err := validate.MinLength("recipient"+"."+"nationality", "body", string(*m.Nationality), 1); err != nil {
		return err
	}

	return nil
}

// MarshalBinary interface implementation
func (m *CertificationRequestV2Recipient) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *CertificationRequestV2Recipient) UnmarshalBinary(b []byte) error {
	var res CertificationRequestV2Recipient
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}

// CertificationRequestV2RecipientAddress certification request v2 recipient address
//
// swagger:model CertificationRequestV2RecipientAddress
type CertificationRequestV2RecipientAddress struct {

	// address line1
	// Required: true
	AddressLine1 *string `json:"addressLine1"`

	// address line2
	AddressLine2 string `json:"addressLine2,omitempty"`

	// country
	// Min Length: 2
	Country string `json:"country,omitempty"`

	// district
	// Required: true
	// Min Length: 1
	District *string `json:"district"`

	// pincode
	// Required: true
	Pincode *string `json:"pincode"`

	// state
	// Required: true
	// Min Length: 1
	State *string `json:"state"`
}

// Validate validates this certification request v2 recipient address
func (m *CertificationRequestV2RecipientAddress) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateAddressLine1(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateCountry(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateDistrict(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validatePincode(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateState(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *CertificationRequestV2RecipientAddress) validateAddressLine1(formats strfmt.Registry) error {

	if err := validate.Required("recipient"+"."+"address"+"."+"addressLine1", "body", m.AddressLine1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2RecipientAddress) validateCountry(formats strfmt.Registry) error {

	if swag.IsZero(m.Country) { // not required
		return nil
	}

	if err := validate.MinLength("recipient"+"."+"address"+"."+"country", "body", string(m.Country), 2); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2RecipientAddress) validateDistrict(formats strfmt.Registry) error {

	if err := validate.Required("recipient"+"."+"address"+"."+"district", "body", m.District); err != nil {
		return err
	}

	if err := validate.MinLength("recipient"+"."+"address"+"."+"district", "body", string(*m.District), 1); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2RecipientAddress) validatePincode(formats strfmt.Registry) error {

	if err := validate.Required("recipient"+"."+"address"+"."+"pincode", "body", m.Pincode); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2RecipientAddress) validateState(formats strfmt.Registry) error {

	if err := validate.Required("recipient"+"."+"address"+"."+"state", "body", m.State); err != nil {
		return err
	}

	if err := validate.MinLength("recipient"+"."+"address"+"."+"state", "body", string(*m.State), 1); err != nil {
		return err
	}

	return nil
}

// MarshalBinary interface implementation
func (m *CertificationRequestV2RecipientAddress) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *CertificationRequestV2RecipientAddress) UnmarshalBinary(b []byte) error {
	var res CertificationRequestV2RecipientAddress
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}

// CertificationRequestV2Vaccination certification request v2 vaccination
//
// swagger:model CertificationRequestV2Vaccination
type CertificationRequestV2Vaccination struct {

	// batch
	Batch string `json:"batch,omitempty"`

	// date
	// Required: true
	// Format: date
	Date *strfmt.Date `json:"date"`

	// Dose number for example 1 for first dose of 2 doses
	// Required: true
	// Minimum: 1
	Dose *float64 `json:"dose"`

	// effective start
	// Required: true
	// Format: date
	EffectiveStart *strfmt.Date `json:"effectiveStart"`

	// effective until
	// Required: true
	// Format: date
	EffectiveUntil *strfmt.Date `json:"effectiveUntil"`

	// manufacturer
	// Required: true
	Manufacturer *string `json:"manufacturer"`

	// name
	// Required: true
	Name *string `json:"name"`

	// Total number of doses required for this vaccination.
	// Required: true
	// Minimum: 1
	TotalDoses *float64 `json:"totalDoses"`
}

// Validate validates this certification request v2 vaccination
func (m *CertificationRequestV2Vaccination) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateDate(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateDose(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateEffectiveStart(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateEffectiveUntil(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateManufacturer(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateName(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateTotalDoses(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *CertificationRequestV2Vaccination) validateDate(formats strfmt.Registry) error {

	if err := validate.Required("vaccination"+"."+"date", "body", m.Date); err != nil {
		return err
	}

	if err := validate.FormatOf("vaccination"+"."+"date", "body", "date", m.Date.String(), formats); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Vaccination) validateDose(formats strfmt.Registry) error {

	if err := validate.Required("vaccination"+"."+"dose", "body", m.Dose); err != nil {
		return err
	}

	if err := validate.Minimum("vaccination"+"."+"dose", "body", float64(*m.Dose), 1, false); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Vaccination) validateEffectiveStart(formats strfmt.Registry) error {

	if err := validate.Required("vaccination"+"."+"effectiveStart", "body", m.EffectiveStart); err != nil {
		return err
	}

	if err := validate.FormatOf("vaccination"+"."+"effectiveStart", "body", "date", m.EffectiveStart.String(), formats); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Vaccination) validateEffectiveUntil(formats strfmt.Registry) error {

	if err := validate.Required("vaccination"+"."+"effectiveUntil", "body", m.EffectiveUntil); err != nil {
		return err
	}

	if err := validate.FormatOf("vaccination"+"."+"effectiveUntil", "body", "date", m.EffectiveUntil.String(), formats); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Vaccination) validateManufacturer(formats strfmt.Registry) error {

	if err := validate.Required("vaccination"+"."+"manufacturer", "body", m.Manufacturer); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Vaccination) validateName(formats strfmt.Registry) error {

	if err := validate.Required("vaccination"+"."+"name", "body", m.Name); err != nil {
		return err
	}

	return nil
}

func (m *CertificationRequestV2Vaccination) validateTotalDoses(formats strfmt.Registry) error {

	if err := validate.Required("vaccination"+"."+"totalDoses", "body", m.TotalDoses); err != nil {
		return err
	}

	if err := validate.Minimum("vaccination"+"."+"totalDoses", "body", float64(*m.TotalDoses), 1, false); err != nil {
		return err
	}

	return nil
}

// MarshalBinary interface implementation
func (m *CertificationRequestV2Vaccination) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *CertificationRequestV2Vaccination) UnmarshalBinary(b []byte) error {
	var res CertificationRequestV2Vaccination
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}

// CertificationRequestV2Vaccinator certification request v2 vaccinator
//
// swagger:model CertificationRequestV2Vaccinator
type CertificationRequestV2Vaccinator struct {

	// name
	// Required: true
	// Min Length: 1
	Name *string `json:"name"`
}

// Validate validates this certification request v2 vaccinator
func (m *CertificationRequestV2Vaccinator) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateName(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *CertificationRequestV2Vaccinator) validateName(formats strfmt.Registry) error {

	if err := validate.Required("vaccinator"+"."+"name", "body", m.Name); err != nil {
		return err
	}

	if err := validate.MinLength("vaccinator"+"."+"name", "body", string(*m.Name), 1); err != nil {
		return err
	}

	return nil
}

// MarshalBinary interface implementation
func (m *CertificationRequestV2Vaccinator) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *CertificationRequestV2Vaccinator) UnmarshalBinary(b []byte) error {
	var res CertificationRequestV2Vaccinator
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}
