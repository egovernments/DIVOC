package pkg

import (
	"encoding/json"
	"github.com/divoc/portal-api/config"
	"github.com/go-openapi/runtime/middleware"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"

)

type CreateMedicineRegistryRequest struct {
	ID     string `json:"id"`
	Ver    string `json:"ver"`
	Ets    string `json:"ets"`
	Params struct {
		Did   string `json:"did"`
		Key   string `json:"key"`
		Msgid string `json:"msgid"`
	} `json:"params"`
	Request map[string]interface{} `json:"request"`
	//Request struct {
	//	Medicine *models.CreateMedicineRequest `json:"Medicine"`
	//} `json:"request"`
}

type RegistryResponse struct {
	ID     string `json:"id"`
	Ver    string `json:"ver"`
	Ets    int64  `json:"ets"`
	Params struct {
		Resmsgid string `json:"resmsgid"`
		Msgid    string `json:"msgid"`
		Err      string `json:"err"`
		Status   string `json:"status"`
		Errmsg   string `json:"errmsg"`
	} `json:"params"`
	ResponseCode string `json:"responseCode"`
	Result       struct {
		Facility struct {
			Osid string `json:"osid"`
		} `json:"Facility"`
	} `json:"result"`
}


func makeRegistryCreateRequest(requestMap interface{}, objectId string) middleware.Responder {
	requestJson := CreateMedicineRegistryRequest{
		ID:  "open-saber.registry.create",
		Ver: config.Config.Registry.ApiVersion,
		Ets: "",
		Params: struct {
			Did   string `json:"did"`
			Key   string `json:"key"`
			Msgid string `json:"msgid"`
		}{},
		Request: map[string]interface{}{objectId: requestMap},
	}
	url := registryUrl(config.Config.Registry.AddOperationId)
	log.Info("Using registry url ", url)
	log.Infof("Request >> %+v", requestJson)
	resp, err := req.Post(url, req.BodyJSON(requestJson))

	if resp == nil || err != nil {
		log.Error("Failed to request registry ", url, " ", err)
		return NewGenericServerError()
	}
	if resp.Response().StatusCode != 200 {
		log.Error("Registry response is ", resp.Response().StatusCode, url)
		//todo handle error
		println(resp.Response().Status)
		return NewGenericServerError()
	}
	respStr, _ := resp.ToString()
	log.Infof("Response from registry %+v", respStr)
	var registryResponse = RegistryResponse{}
	err = json.Unmarshal(resp.Bytes(), &registryResponse)
	if err != nil {
		return NewGenericServerError()
	}
	log.Info("Got response from registry ", registryResponse.Params.Status)
	if registryResponse.Params.Status != "SUCCESSFUL" {
		return NewGenericServerError()
	}
	return NewGenericStatusOk()
}