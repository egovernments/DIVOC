package pkg

import (
	"github.com/divoc/api/config"
	"github.com/imroc/req"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
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

func getUserInfo(facilityCode string) interface{} {
	response := map[string]interface{}{}
	typeId := "Facility"
	filter := map[string]interface{}{
		"@type": map[string]interface{}{
			"eq": typeId,
		},
		"facilityCode": map[string]interface{}{
			"eq": facilityCode,
		},

	}
	if resp, err := queryRegistry(typeId, filter); err != nil {
		log.Infof("Error in getting facility information %+v", err)
	} else {
		if facilities, ok := resp["Facility"].([]interface{}); ok {
			if len(facilities) > 0 {
				if facility, ok := facilities[0].(map[string]interface{}); ok {
					response["facility"] = map[string]interface{}{
						"facilityName": facility["facilityName"],
						"category": facility["category"],
						"contact": facility["contact"],
						"operatingHourStart": facility["operatingHourStart"],
						"operatingHourEnd": facility["operatingHourEnd"],
					}
				}
			}
		}
	}
	return response
}

func getVaccinatorsForFacility(facilityCode string) interface{} {
	typeId := "Vaccinator"
	filter := map[string]interface{}{
		"@type": map[string]interface{}{
			"eq": typeId,
		},

	}
	response, err := queryRegistry(typeId, filter)
	if err != nil {
		log.Errorf("Error in querying registry", err)
		return NewGenericServerError()
	}
	return response[typeId]
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
