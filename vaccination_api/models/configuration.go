package models

type OperatorConfiguration struct {
	DailyLimit int32 `json:"dailyLimit"`
	Programs []string `json:"programs"`
}