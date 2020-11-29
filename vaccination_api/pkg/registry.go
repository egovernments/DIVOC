package pkg

import (
	"github.com/divoc/api/config"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/imroc/req"
	"strconv"
)

type RegistryRequest struct {
	ID      string                 `json:"id"`
	Ver     string                 `json:"ver"`
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

func queryRegistry(typeId string, filter map[string]interface{}) (map[string]interface{}, error) {

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
