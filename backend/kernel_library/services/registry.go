package services

import (
	"encoding/json"
	"github.com/divoc/kernel_library/config"
	"github.com/divoc/kernel_library/model"
	"github.com/go-openapi/runtime/middleware"
	"github.com/imroc/req"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"strconv"
)

type CreateEntityRegistryRequest struct {
	ID     string `json:"id"`
	Ver    string `json:"ver"`
	Ets    string `json:"ets"`
	Params struct {
		Did   string `json:"did"`
		Key   string `json:"key"`
		Msgid string `json:"msgid"`
	} `json:"params"`
	Request map[string]interface{} `json:"request"`
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
	ResponseCode string                 `json:"responseCode"`
	Result       map[string]interface{} `json:"result"`
}

type RegistryRequest struct {
	ID      string                 `json:"id"`
	Ver     string                 `json:"ver"`
	Request map[string]interface{} `json:"request"`
}

//todo: change signature to return non http specific type. Created alternate CreateNewRegistry
func MakeRegistryCreateRequest(requestMap interface{}, objectId string) middleware.Responder {
	requestJson := CreateEntityRegistryRequest{
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
		return model.NewGenericServerError()
	}
	if resp.Response().StatusCode != 200 {
		log.Error("Registry response is ", resp.Response().StatusCode, url)
		println(resp.Response().Status)
		return model.NewGenericServerError()
	}
	respStr, _ := resp.ToString()
	log.Infof("Response from registry %+v", respStr)
	var registryResponse = RegistryResponse{}
	err = json.Unmarshal(resp.Bytes(), &registryResponse)
	if err != nil {
		return model.NewGenericServerError()
	}
	log.Info("Got response from registry ", registryResponse.Params.Status)
	if registryResponse.Params.Status != "SUCCESSFUL" {
		return model.NewGenericServerError()
	}
	return model.NewGenericStatusOk()
}

func CreateNewRegistry(requestMap interface{}, objectId string) error {
	requestJson := CreateEntityRegistryRequest{
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
		return errors.New("Failed to request registry")
	}
	if resp.Response().StatusCode != 200 {
		log.Error("Registry response is ", resp.Response().StatusCode, url)
		println(resp.Response().Status)
		log.Error("Next R Error" + string(resp.Response().Status))
		return errors.New("Registry response is " + string(resp.Response().StatusCode))
	}
	respStr, _ := resp.ToString()
	log.Infof("Response from registry %+v", respStr)
	var registryResponse = RegistryResponse{}
	err = json.Unmarshal(resp.Bytes(), &registryResponse)
	log.Info("Got response from registry ", registryResponse.Params.Status)
	if registryResponse.Params.Status != "SUCCESSFUL" {
		return errors.New(registryResponse.Params.Errmsg)
	}
	return nil
}

func registryUrl(operationId string) string {
	url := config.Config.Registry.Url + "/" + operationId
	return url
}

func QueryRegistry(typeId string, filter map[string]interface{}) (map[string]interface{}, error) {

	queryRequest := RegistryRequest{
		"open-saber.registry.search",
		"1.0",
		map[string]interface{}{
			"entityType": []string{typeId},
			"filters":    filter,
		},
	}
	log.Info("Registry query ", queryRequest)
	response, err := req.Post(config.Config.Registry.Url+"/"+config.Config.Registry.SearchOperationId, req.BodyJSON(queryRequest))
	if err != nil {
		return nil, errors.Errorf("Error while querying registry", err)
	}
	if response.Response().StatusCode != 200 {
		return nil, errors.New("Query failed, registry response " + strconv.Itoa(response.Response().StatusCode))
	}
	responseObject := RegistryResponse{}
	err = response.ToJSON(&responseObject)
	if err != nil {
		return nil, errors.Wrap(err, "Unable to parse response from registry.")
	}
	log.Infof("Response %+v", responseObject)
	if responseObject.Params.Status != "SUCCESSFUL" {
		log.Infof("Response from registry %+v", responseObject)
		return nil, errors.New("Failed while querying from registry")
	}
	return responseObject.Result, nil
}

func GetEntityType(entityTypeId string) middleware.Responder {
	filter := map[string]interface{}{
		"@type": map[string]interface{}{
			"eq": entityTypeId,
		},
	}
	response, err := QueryRegistry(entityTypeId, filter)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return model.NewGenericServerError()
	}
	return model.NewGenericJSONResponse(response[entityTypeId])
}

func UpdateRegistry(typeId string, update map[string]interface{}) (map[string]interface{}, error) {

	queryRequest := RegistryRequest{
		"open-saber.registry.update",
		"1.0",
		map[string]interface{}{
			typeId: update,
		},
	}
	log.Info("Registry query ", queryRequest)
	response, err := req.Post(config.Config.Registry.Url+"/"+config.Config.Registry.UpdateOperationId, req.BodyJSON(queryRequest))
	if err != nil {
		return nil, errors.Errorf("Error while updating registry", err)
	}
	if response.Response().StatusCode != 200 {
		return nil, errors.New("Query failed, registry response " + strconv.Itoa(response.Response().StatusCode))
	}
	responseObject := RegistryResponse{}
	err = response.ToJSON(&responseObject)
	if err != nil {
		return nil, errors.Wrap(err, "Unable to parse response from registry.")
	}
	log.Infof("Response %+v", responseObject)
	if responseObject.Params.Status != "SUCCESSFUL" {
		log.Infof("Response from registry %+v", responseObject)
		return nil, errors.New("Failed while querying from registry")
	}
	return responseObject.Result, nil
}

func GetVaccinatorsForTheFacility(facilityCode string) (interface{}, error) {
	filter := map[string]interface{}{
		"facilityIds": map[string]interface{}{
			"contains": facilityCode,
		},
	}
	if resp, err := QueryRegistry("Vaccinator", filter); err != nil {
		log.Errorf("Error in getting vaccinator from registry for the facility %s", facilityCode)
		return nil, err
	} else {
		return resp["Vaccinator"], nil
	}
}
