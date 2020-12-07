package model

import (
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"
	"net/http"
)

type GenericResponse struct {
	statusCode int
}

func (o *GenericResponse) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {
	rw.Header().Del(runtime.HeaderContentType) //Remove Content-Type on empty responses
	rw.WriteHeader(o.statusCode)
}

func NewGenericServerError() middleware.Responder {
	return &GenericResponse{statusCode: 500}
}

func NewGenericStatusOk() middleware.Responder {
	return &GenericResponse{statusCode: 200}
}
