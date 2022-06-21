package pkg

import (
	"errors"
	"github.com/divoc/api/config"
	"github.com/divoc/kernel_library/services"
	log "github.com/sirupsen/logrus"
)

func getUserInfo(facilityCode string) interface{} {
	response := map[string]interface{}{}
	typeId := "Facility"
	filter := map[string]interface{}{

		"facilityCode": map[string]interface{}{
			"eq": facilityCode,
		},
	}
	if resp, err := services.QueryRegistry(typeId, filter, config.Config.SearchRegistry.DefaultLimit, config.Config.SearchRegistry.DefaultOffset); err != nil {
		log.Infof("Error in getting facility information %+v", err)
	} else {
		if facilities, ok := resp["Facility"].([]interface{}); ok {
			if len(facilities) > 0 {
				if facility, ok := facilities[0].(map[string]interface{}); ok {
					response["facility"] = map[string]interface{}{
						"facilityName":       facility["facilityName"],
						"category":           facility["category"],
						"contact":            facility["contact"],
						"operatingHourStart": facility["operatingHourStart"],
						"operatingHourEnd":   facility["operatingHourEnd"],
					}
				}
			}
		}
	}
	return response
}

func getVaccinatorsForFacility(facilityCode string, limit int, offset int) interface{} {
	typeId := "Vaccinator"
	filter := map[string]interface{}{}
	response, err := services.QueryRegistry(typeId, filter, limit, offset)
	if err != nil {
		log.Errorf("Error in querying registry %v", err)
		return NewGenericServerError()
	}
	return response[typeId]
}

func fetchSchema(schemaName string) (string, error) {
	schemaStr := config.Config.Registry.VCSchemas[schemaName]
	if schemaStr == "" {
		log.Infof("Schema %s not found in cache. Fetching schema from registry", schemaName)
		schemas, err := services.GetSchema(schemaName)
		if err != nil {
			log.Errorf("Error in querying registry %v", err)
			return "", err
		}
		if len(schemas["Schema"].([]interface{})) == 0 {
			log.Errorf("No Schema returned by regisry for schemaName %s", schemaName)
			return "", errors.New("Schema "+ schemaName + " Not found in Registry")
		}
		schema := schemas["Schema"].([]interface{})[0].(map[string]interface{})["schema"].(string)
		// adding schema to cache
		config.Config.Registry.VCSchemas[schemaName] = schema

		return schema, nil
	}
	log.Debug("Returning schema from cache")
	return schemaStr, nil
}
