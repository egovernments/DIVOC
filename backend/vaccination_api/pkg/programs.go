package pkg

import (
	"github.com/divoc/api/config"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/kernel_library/services"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
	"time"
)

type ProgramsRegistryResponse struct {
	EndDate     string        `json:"endDate"`
	Type        string        `json:"@type"`
	OsCreatedAt time.Time     `json:"_osCreatedAt"`
	OsUpdatedBy string        `json:"_osUpdatedBy"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Osid        string        `json:"osid"`
	OsCreatedBy string        `json:"_osCreatedBy"`
	OsUpdatedAt time.Time     `json:"_osUpdatedAt"`
	MedicineIds []interface{} `json:"medicineIds"`
	StartDate   string        `json:"startDate"`
}

func findProgramsForFacility(facilityCode string) []*models.Program {
	typeId := "Program"
	filter := map[string]interface{}{

		"startDate": map[string]interface{}{
			"gt": "2020-12-12", //todo: temporary filter
		},
		//"enrollmentScopeId": map[string]interface{}{
		//	"eq": scopeId,
		//},
		//"code": map[string]interface{}{
		//	"eq": code,
		//},
	}
	if programs, err := services.QueryRegistry(typeId, filter); err != nil {
		log.Errorf("Error in getting programs for the facility")
	} else {
		log.Infof("Programs %+v", programs)
		programsList := programs[typeId].([]interface{})
		programsResult := []*models.Program{}
		for _, object := range programsList {
			p := object.(map[string]interface{})
			medicines := []*models.ProgramMedicinesItems0{}
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
		Medicine struct {
			EffectiveUntil int     `json:"effectiveUntil"`
			Provider       string  `json:"provider"`
			Price          float64 `json:"price"`
			Name           string  `json:"name"`
			Schedule       struct {
				Osid           string `json:"osid"`
				RepeatTimes    int64  `json:"repeatTimes"`
				RepeatInterval int64  `json:"repeatInterval"`
			} `json:"schedule"`
			Osid            string `json:"osid"`
			Status          string `json:"status"`
			VaccinationMode string `json:"vaccinationMode"`
		} `json:"Medicine"`
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
			return &models.ProgramMedicinesItems0{
				EffectiveUntil: int64(m.EffectiveUntil),
				Name:           m.Name,
				Price:          m.Price,
				Provider:       m.Provider,
				Schedule: &models.ProgramMedicinesItems0Schedule{
					RepeatInterval: m.Schedule.RepeatInterval,
					RepeatTimes:    m.Schedule.RepeatTimes,
				},
				Status:          m.Status,
				VaccinationMode: m.VaccinationMode,
			}, nil
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
