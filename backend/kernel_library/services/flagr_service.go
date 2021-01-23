package services

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/kernel_library/config"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
	"strconv"
)

const EvaluationApi = "/api/v1/evaluation"

type NotificationTemplatesType map[string]struct {
	Subject string
	Message string
}

var FlagrConfigs = struct {
	NotificationTemplates NotificationTemplatesType
}{}

func InitializeFlagr() {
	fetchNotificationTemplates()
}

func fetchNotificationTemplates() {
	requestBody := map[string]interface{}{
		"flagKey": config.Config.Flagr.NotificationFlagKey,
	}
	response, err := req.Post(config.Config.Flagr.Url+EvaluationApi, req.BodyJSON(requestBody))
	if err != nil {
		log.Errorf("Error while querying registry", err)
		return
	}
	if response.Response().StatusCode != 200 {
		log.Errorf("Query failed, registry response %s", strconv.Itoa(response.Response().StatusCode))
		return
	}
	responseObject := map[string]interface{}{}
	err = response.ToJSON(&responseObject)
	if err != nil {
		log.Errorf("Unable to parse response from registry.", err)
	}
	log.Infof("Response %+v", responseObject)
	if response.Response().StatusCode == 200 {
		// convert map to json
		jsonString, _ := json.Marshal(responseObject["variantAttachment"])
		fmt.Println(string(jsonString))
		// convert json to struct
		notificationTemplate := NotificationTemplatesType{}
		err = json.Unmarshal(jsonString, &notificationTemplate)
		if err != nil {
			log.Errorf("notification templates not in defined format", err)
		} else {
			FlagrConfigs.NotificationTemplates = notificationTemplate
		}
	}
}
