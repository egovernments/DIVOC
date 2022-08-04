package models

import "time"

type TransactionResponse struct {
	TransactionId	string `json:"transactionId"`
	Osid  			string `json:"osid"`
	EntityType  	string `json:"entityType"`
	Message  	 	string `json:"message"`
	Status  		string `json:"status"`
	UserId 			string `json:"userId"`
	Date            time.Time `json:"date"`
}