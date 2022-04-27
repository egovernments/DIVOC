package services

import (
	"errors"

	"github.com/divoc/notification-service/config"

	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
)

func SendSMS(mobileNumber string, message string) (map[string]interface{}, error) {
	if config.Config.SmsAPI.Enable {
		smsRequest := map[string]interface{}{
			"sender": "SOCKET",
			"route":  "4",
			//TODO: get from certificate context
			"country": "91",
			"unicode": "1",
			"sms":     []map[string]interface{}{{"message": message, "to": []string{mobileNumber}}},
		}
		header := req.Header{
			"authkey":      config.Config.SmsAPI.AuthKey,
			"Content-Type": "application/json",
		}
		if config.Config.Env_Type == "DEV" {
			log.Info("SMS request ", smsRequest)
		} else {
			log.Info("SMS resqust is processing")
		}

		response, err := req.Post(config.Config.SmsAPI.URL, header, req.BodyJSON(smsRequest))
		if err != nil {
			return nil, nil
		}
		if response.Response().StatusCode != 200 {
			return nil, errors.New(response.Response().Status)
		}
		responseObject := map[string]interface{}{}
		err = response.ToJSON(&responseObject)
		if err != nil {
			return nil, nil
		}
		log.Infof("Response %+v", responseObject)
		if responseObject["a"] != "SUCCESSFUL" {
			log.Infof("Response %+v", responseObject)
			return nil, nil
		}
		return responseObject, nil
	}
	log.Infof("SMS notifier disabled")
	return nil, nil
}
