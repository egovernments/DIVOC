package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/divoc/notification-service/config"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
	"text/template"
)

func SendSMS(mobileNumber string, message string) (map[string]interface{}, error) {
	if config.Config.SmsAPI.Enable {
		smsRequest := GetSmsRequestPayload(message, mobileNumber)
		header := req.Header{
			"authkey":      config.Config.SmsAPI.AuthKey,
			"Content-Type": "application/json",
		}
		log.Info("SMS request ", smsRequest)
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

func GetSmsRequestPayload(message string, mobileNumber string) map[string]interface{} {
	smsRequestTemplate := template.Must(template.New("").Parse(config.Config.SmsAPI.RequestTemplate))
	buf := bytes.Buffer{}
	if err := smsRequestTemplate.Execute(&buf, map[string]interface{}{
		"message": message,
		"to":      mobileNumber,
	}); err == nil {
		smsRequest := make(map[string]interface{})
		if err = json.Unmarshal(buf.Bytes(), &smsRequest); err == nil {
			return smsRequest
		} else {
			log.Error(err)
		}
	}
	return nil
}
