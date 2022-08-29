package models

import "time"

type TransactionResponse struct {
	TransactionId	string `json:"transactionId"`
	CertificateId  			string `json:"certificateId"`
	Status  		string `json:"status"`
	Date            time.Time `json:"date"`
}