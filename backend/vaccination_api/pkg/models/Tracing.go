package models

import (
	"time"
)

type Tracing struct {
	TransactionId  string      `json:"transactionId"`
	Url            string      `json:"url"`
	RequestHeaders interface{} `json:"requestHeaders"`
	RequestBody    interface{} `json:"requestBody"`
	RequestMethod  interface{} `json:"requestMethod"`
	Date           time.Time   `json:"date"`
	StatusCode     interface{} `json:"statusCode"`
}
