// Code generated by go-swagger; DO NOT EDIT.

package operations

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"net/http"

	"github.com/go-openapi/runtime"
)

// MosipGenerateOTPOKCode is the HTTP code returned for type MosipGenerateOTPOK
const MosipGenerateOTPOKCode int = 200

/*MosipGenerateOTPOK OK

swagger:response mosipGenerateOTPOK
*/
type MosipGenerateOTPOK struct {
}

// NewMosipGenerateOTPOK creates MosipGenerateOTPOK with default headers values
func NewMosipGenerateOTPOK() *MosipGenerateOTPOK {

	return &MosipGenerateOTPOK{}
}

// WriteResponse to the client
func (o *MosipGenerateOTPOK) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	rw.Header().Del(runtime.HeaderContentType) //Remove Content-Type on empty responses

	rw.WriteHeader(200)
}

// MosipGenerateOTPBadRequestCode is the HTTP code returned for type MosipGenerateOTPBadRequest
const MosipGenerateOTPBadRequestCode int = 400

/*MosipGenerateOTPBadRequest Bad request

swagger:response mosipGenerateOTPBadRequest
*/
type MosipGenerateOTPBadRequest struct {
}

// NewMosipGenerateOTPBadRequest creates MosipGenerateOTPBadRequest with default headers values
func NewMosipGenerateOTPBadRequest() *MosipGenerateOTPBadRequest {

	return &MosipGenerateOTPBadRequest{}
}

// WriteResponse to the client
func (o *MosipGenerateOTPBadRequest) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	rw.Header().Del(runtime.HeaderContentType) //Remove Content-Type on empty responses

	rw.WriteHeader(400)
}

// MosipGenerateOTPInternalServerErrorCode is the HTTP code returned for type MosipGenerateOTPInternalServerError
const MosipGenerateOTPInternalServerErrorCode int = 500

/*MosipGenerateOTPInternalServerError Internal Error

swagger:response mosipGenerateOTPInternalServerError
*/
type MosipGenerateOTPInternalServerError struct {
}

// NewMosipGenerateOTPInternalServerError creates MosipGenerateOTPInternalServerError with default headers values
func NewMosipGenerateOTPInternalServerError() *MosipGenerateOTPInternalServerError {

	return &MosipGenerateOTPInternalServerError{}
}

// WriteResponse to the client
func (o *MosipGenerateOTPInternalServerError) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	rw.Header().Del(runtime.HeaderContentType) //Remove Content-Type on empty responses

	rw.WriteHeader(500)
}