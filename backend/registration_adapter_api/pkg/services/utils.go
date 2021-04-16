package services

import "github.com/google/uuid"

var photoIds = []map[string]interface{}{
	{"did": "in.gov.drivinglicense", "type": "Driving License", "id": "2", "doc_type": "DRVLC"},
	{"did": "in.gov.kebeleid", "type": "Kebele ID", "id": "3", "doc_type": "KEBELE"},
	{"did": "in.gov.workid", "type": "Work ID", "id": "4", "doc_type": "WORK"},
	{"did": "in.gov.passport", "type": "Passport", "id": "8", "doc_type": "PSPRT"},
	{"did": "in.gov.other", "type": "Other", "id": "9", "doc_type": "OTHER"}
}

var states = []map[string]string{
	{"state_id": "58", "state_name": "123"},
}

var districts = []map[string]string{
	{"district_id": "391", "district_name": "Bole"},
}

func GenerateRandomUUID() string {
	id := uuid.New()
	return id.String()
}

func GetStateNameBy(id string) string {
	for _, stateObj := range states {
		if stateObj["state_id"] == id {
			return stateObj["state_name"]
		}
	}
	return ""
}

func GetPhotoIds() []map[string]interface{} {
	return photoIds
}

func GetDistrictNameBy(id string) string {
	for _, districtObj := range districts {
		if districtObj["district_id"] == id {
			return districtObj["district_name"]
		}
	}
	return ""
}
