package services

import (
	"fmt"
	"github.com/divoc/notification-service/config"
	"testing"
)

func TestGetSmsRequestPayload(t *testing.T) {
	config.Initialize()
	type args struct {
		message         string
		mobileNumber    string
		requestTemplate string
	}
	tests := []struct {
		name string
		args args
		want map[string]interface{}
	}{
		{
			name: "should return default template",
			args: args{
				message:         "OTP generated: {}",
				mobileNumber:    "123123",
				requestTemplate: `{"sender": "SOCKET","route": "4","country": "91","unicode": "1","sms": [{"message": "{{.message}}","to": ["{{.to}}"]}]}`,
			},
			want: map[string]interface{}{
				"sender":  "SOCKET",
				"route":   "4",
				"country": "91",
				"unicode": "1",
				"sms":     []map[string]interface{}{{"message": "OTP generated: {}", "to": []string{"123123"}}},
			},
		},
		{
			name: "should return template",
			args: args{
				message:      "OTP generated: {}",
				mobileNumber: "123123",
				requestTemplate: `{
					"data": "{{.message}}",
					"phoneNumber": "{{.to}}",
					"sIDCode": "IctaTest",
					"userName": "icta",
					"password": "g0v5ms123"
				}`,
			},
			want: map[string]interface{}{
				"data":        "OTP generated: {}",
				"phoneNumber": "123123",
				"sIDCode":     "IctaTest",
				"userName":    "icta",
				"password":    "g0v5ms123",
			},
		},
		{
			name: "should return nil for invalid request template",
			args: args{
				message:         "OTP generated: {}",
				mobileNumber:    "123123",
				requestTemplate: `invalid json template`,
			},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			config.Config.SmsAPI.RequestTemplate = tt.args.requestTemplate
			if got := GetSmsRequestPayload(tt.args.message, tt.args.mobileNumber); fmt.Sprint(tt.want) != fmt.Sprint(got) {
				t.Errorf("GetSmsRequestPayload() = %v, want %v", got, tt.want)
			}
		})
	}
}
