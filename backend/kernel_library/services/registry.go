package services

import (
	"encoding/json"
	"strconv"

	"github.com/divoc/kernel_library/config"
	"github.com/divoc/kernel_library/model"
	"github.com/go-openapi/runtime/middleware"
	"github.com/imroc/req"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
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
	r := req.New()
	resp, err := r.Post(url, req.BodyJSON(requestJson))

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
	log.Debugf("Response from registry %+v", respStr)
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

func CreateNewRegistry(requestMap interface{}, objectId string) (RegistryResponse, error) {
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
	r := req.New()
	resp, err := r.Post(url, req.BodyJSON(requestJson))

	if resp == nil || err != nil {
		log.Error("Failed to request registry ", url, " ", err)
		return RegistryResponse{}, err
	}
	if resp.Response().StatusCode != 200 {
		log.Error("Registry response is ", resp.Response().StatusCode, url)
		println(resp.Response().Status)
		log.Error("Next R Error" + string(resp.Response().Status))
		return RegistryResponse{}, errors.New("Registry response is " + string(resp.Response().StatusCode))
	}
	respStr, _ := resp.ToString()
	log.Debugf("Response from registry %+v", respStr)
	var registryResponse = RegistryResponse{}
	err = json.Unmarshal(resp.Bytes(), &registryResponse)
	log.Info("Got response from registry ", registryResponse.Params.Status)
	if registryResponse.Params.Status != "SUCCESSFUL" {
		return registryResponse, errors.New(registryResponse.Params.Errmsg)
	}
	return registryResponse, nil
}

func registryUrl(operationId string) string {
	url := config.Config.Registry.Url + "/" + operationId
	return url
}

func ReadRegistry(typeId string, osid string) (map[string]interface{}, error) {

	readRequest := RegistryRequest{
		"open-saber.registry.read",
		"1.0",
		map[string]interface{}{
			typeId: map[string]interface{}{
				"osid": osid,
			},
		},
	}
	log.Info("Registry read ", readRequest)
	response, err := req.Post(registryUrl(config.Config.Registry.ReadOperationId), req.BodyJSON(readRequest))
	return analyseResponse(response, err)
}

func analyseResponse(response *req.Resp, err error) (map[string]interface{}, error) {
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
	log.Debugf("Response %+v", responseObject)
	if responseObject.Params.Status != "SUCCESSFUL" {
		log.Infof("Response from registry %+v", responseObject)
		return nil, errors.New("Failed while querying from registry")
	}
	return responseObject.Result, nil
}

func QueryRegistry(typeId string, filter map[string]interface{}, limit int, offset int) (map[string]interface{}, error) {
	// Note: If registry layer is used with es(elastic search),
	// then there may be a chance that recent entries (creation time - query time < 1s) may not be returned,
	// as es takes some time to index those.
	// Caller should handle those cases if necessary.
	queryRequest := RegistryRequest{
		"open-saber.registry.search",
		"1.0",
		map[string]interface{}{
			"entityType": []string{typeId},
			"filters":    filter,
			"limit":      limit,
			"offset":     offset,
		},
	}
	log.Info("Registry query ", queryRequest)
	response, err := req.Post(registryUrl(config.Config.Registry.SearchOperationId), req.BodyJSON(queryRequest))
	return analyseResponse(response, err)
}

func GetEntityType(entityTypeId string) middleware.Responder {
	filter := map[string]interface{}{}
	response, err := QueryRegistry(entityTypeId, filter, 100, 0)
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
	r := req.New()
	response, err := r.Post(registryUrl(config.Config.Registry.UpdateOperationId), req.BodyJSON(queryRequest))
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
	log.Debugf("Response %+v", responseObject)
	if responseObject.Params.Status != "SUCCESSFUL" {
		log.Infof("Response from registry %+v", responseObject)
		return nil, errors.New("Failed while querying from registry")
	}
	return responseObject.Result, nil
}

func DeleteRegistry(typeId string, update map[string]interface{}) (map[string]interface{}, error) {
	queryRequest := RegistryRequest{
		"open-saber.registry.update",
		"1.0",
		map[string]interface{}{
			typeId: update,
		},
	}
	log.Info("Registry Query ", queryRequest)
	response, err := req.Post(config.Config.Registry.Url+"/"+config.Config.Registry.DeleteOperationId, req.BodyJSON(queryRequest))
	if err != nil {
		return nil, errors.Errorf("tempError while deleting registry", err)
	}
	if response.Response().StatusCode != 200 {
		return nil, errors.New("tempError Query failed, registry response " + strconv.Itoa(response.Response().StatusCode))
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
	if resp, err := QueryRegistry("Vaccinator", filter, 100, 0); err != nil {
		log.Errorf("Error in getting vaccinator from registry for the facility %s", facilityCode)
		return nil, err
	} else {
		return resp["Vaccinator"], nil
	}
}

func GetAllSchemas() (map[string]interface{}, error){
	if resp, err := QueryRegistry("Schema", map[string]interface{}{}, 100, 0); err != nil {
		log.Errorf("Error in getting schemas from registry")
		return nil, err
	} else {
		return resp, nil
	}
}