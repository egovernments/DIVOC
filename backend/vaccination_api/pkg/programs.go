package pkg

import (
	"time"

	"github.com/divoc/api/config"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/kernel_library/services"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
)

type ProgramsRegistryResponse struct {
	EndDate     string        `json:"endDate"`
	Type        string        `json:"@type"`
	OsCreatedAt time.Time     `json:"osCreatedAt"`
	OsUpdatedBy string        `json:"osUpdatedBy"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Osid        string        `json:"osid"`
	OsCreatedBy string        `json:"osCreatedBy"`
	OsUpdatedAt time.Time     `json:"osUpdatedAt"`
	MedicineIds []interface{} `json:"medicineIds"`
	StartDate   string        `json:"startDate"`
}

func findProgramsById(id string) []*models.Program {

	typeId := "Program"
	filter := map[string]interface{}{
		"osid": map[string]interface{}{
			"eq": id,
		},
		"status": map[string]interface{}{
			"eq": "Active",
		},
		"startDate": map[string]interface{}{
			"lte": time.Now().Format("2006-01-02"),
		},
		"endDate": map[string]interface{}{
			"gte": time.Now().Format("2006-01-02"),
		},
	}
	if programs, err := services.QueryRegistry(typeId, filter, config.Config.SearchRegistry.DefaultLimit, config.Config.SearchRegistry.DefaultOffset); err != nil {
		log.Errorf("Error in getting programs for the facility")
	} else {
		log.Infof("Programs %+v", programs)
		if val, ok := programs[typeId]; ok {
			if programsList, ok := val.([]interface{}); ok {
				var programsResult []*models.Program
				for _, object := range programsList {
					p := object.(map[string]interface{})
					var medicines []*models.ProgramMedicinesItems0
					for _, medicineId := range p["medicineIds"].([]interface{}) {
						medicine, _ := getMedicine(medicineId.(string))
						log.Info(medicine)
						medicines = append(medicines, medicine)
					}
					programsResult = append(programsResult,
						&models.Program{
							ID:          valueOf(p, "osid"),
							Description: valueOf(p, "description"),
							LogoURL:     valueOf(p, "logoURL"),
							Medicines:   medicines,
							Name:        valueOf(p, "name"),
						},
					)
				}
				return programsResult
			}
		}
	}
	return nil
}

type ReadMedicineRequest struct {
	ID     string `json:"id"`
	Ver    string `json:"ver"`
	Ets    string `json:"ets"`
	Params struct {
		Did   string `json:"did"`
		Key   string `json:"key"`
		Msgid string `json:"msgid"`
	} `json:"params"`
	Request struct {
		Medicine struct {
			Osid string `json:"osid"`
		} `json:"Medicine"`
	} `json:"request"`
}

type ReadMedicineResponse struct {
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
		Medicine models.ProgramMedicinesItems0 `json:"Medicine"`
	} `json:"result"`
}

func getMedicine(id string) (*models.ProgramMedicinesItems0, error) {
	readMedicineRequest := ReadMedicineRequest{
		ID:  "open-saber.registry.read",
		Ver: config.Config.Registry.ApiVersion,
		Ets: "",
		Request: struct {
			Medicine struct {
				Osid string `json:"osid"`
			} `json:"Medicine"`
		}{
			Medicine: struct {
				Osid string `json:"osid"`
			}{
				Osid: id,
			},
		},
	}
	if resp, err := req.Post(config.Config.Registry.Url+"/"+config.Config.Registry.ReadOperationId, req.BodyJSON(readMedicineRequest)); err != nil {
		log.Errorf("Error in getting medicine info %+v", err)
	} else {
		log.Infof("Get medicine info %+v", resp.String())
		readMedicineResponse := ReadMedicineResponse{}
		if err = resp.ToJSON(&readMedicineResponse); err != nil {
			log.Errorf("Error in json serialization %+v", err)
			return nil, err
		} else {
			//return &readMedicineResponse, nil
			m := readMedicineResponse.Result.Medicine
			return &m, nil
		}
	}
	return nil, nil
}

func valueOf(p map[string]interface{}, key string) string {
	if v, ok := p[key]; ok {
		return v.(string)
	}
	return ""
}
