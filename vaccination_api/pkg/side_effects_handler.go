package pkg

import (
	"encoding/json"
	"github.com/divoc/api/swagger_gen/restapi/operations/side_effects"
	"github.com/go-openapi/runtime/middleware"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"os"
)

func getSideEffects(params side_effects.GetSideEffectsMetadataParams) middleware.Responder {
	//TODO: replace with side effects json file
	jsonFile, err := os.Open("./config/sideEffectsSchema.json")
	if err != nil {
		log.Errorf("Error while reading file %+v", err)
		return NewGenericServerError()
	}
	defer jsonFile.Close()
	byteValue, _ := ioutil.ReadAll(jsonFile)
	var result map[string]interface{}
	json.Unmarshal([]byte(byteValue), &result)
	return NewGenericJSONResponse(result)
}
