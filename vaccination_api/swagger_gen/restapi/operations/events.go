// Code generated by go-swagger; DO NOT EDIT.

package operations

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the generate command

import (
	"net/http"

	"github.com/go-openapi/runtime/middleware"

	"github.com/divoc/api/swagger_gen/models"
)

// EventsHandlerFunc turns a function with the right signature into a events handler
type EventsHandlerFunc func(EventsParams, *models.JWTClaimBody) middleware.Responder

// Handle executing the request and returning a response
func (fn EventsHandlerFunc) Handle(params EventsParams, principal *models.JWTClaimBody) middleware.Responder {
	return fn(params, principal)
}

// EventsHandler interface for that can handle valid events params
type EventsHandler interface {
	Handle(EventsParams, *models.JWTClaimBody) middleware.Responder
}

// NewEvents creates a new http.Handler for the events operation
func NewEvents(ctx *middleware.Context, handler EventsHandler) *Events {
	return &Events{Context: ctx, Handler: handler}
}

/*Events swagger:route POST /events events

Send events for monitoring / tracking purpose.

*/
type Events struct {
	Context *middleware.Context
	Handler EventsHandler
}

func (o *Events) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	route, rCtx, _ := o.Context.RouteInfo(r)
	if rCtx != nil {
		r = rCtx
	}
	var Params = NewEventsParams()

	uprinc, aCtx, err := o.Context.Authorize(r, route)
	if err != nil {
		o.Context.Respond(rw, r, route.Produces, route, err)
		return
	}
	if aCtx != nil {
		r = aCtx
	}
	var principal *models.JWTClaimBody
	if uprinc != nil {
		principal = uprinc.(*models.JWTClaimBody) // this is really a models.JWTClaimBody, I promise
	}

	if err := o.Context.BindValidRequest(r, route, &Params); err != nil { // bind params
		o.Context.Respond(rw, r, route.Produces, route, err)
		return
	}

	res := o.Handler.Handle(Params, principal) // actually handle the request

	o.Context.Respond(rw, r, route.Produces, route, res)

}
