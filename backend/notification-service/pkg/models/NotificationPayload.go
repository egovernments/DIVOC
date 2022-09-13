package models

type NotificationPayload struct {
	Template 	string		 `json:"template"`
	Payload		map[string]interface{}	 `json:"payload"`
	Recipient	string		 `json:"recipient"`
} 