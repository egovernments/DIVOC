package services

import "github.com/google/uuid"

var photoIds = []map[string]interface{}{
	{"did": "in.gov.uidai.aadhaar", "type": "Aadhaar Card", "id": "1", "doc_type": "UID"},
	{"did": "in.gov.drivinglicense", "type": "Driving License", "id": "2", "doc_type": "DRVLC"},
	{"did": "in.gov.mol", "type": "Health Insurance Smart Card issued under the scheme of Ministry of Labour", "id": "3", "doc_type": "MoL"},
	{"did": "in.gov.mnrega", "type": "MNREGA Job Card", "id": "4", "doc_type": "MNRGA"},
	{"did": "in.gov.oid", "type": "Official identity cards issued to MPs/MLAs/MLCs", "id": "5", "doc_type": "OFFICIAL"},
	{"did": "in.gov.pan", "type": "PAN Card", "id": "6", "doc_type": "PANCR"},
	{"did": "in.gov.passbook", "type": "Passbooks issued by Bank/Post Office", "id": "7", "doc_type": ""},
	{"did": "in.gov.passport", "type": "Passport", "id": "8", "doc_type": "PSPRT"},
	{"did": "in.gov.pension", "type": "Pension Document", "id": "9", "doc_type": "PENSION"},
	{"did": "in.gov.service", "type": "Service Identity Card issued to employees by Central/ State Govt./ PSUs/ Public Limited Companies", "id": "10", "doc_type": "PSID"},
	{"did": "in.gov.smart", "type": "Smart Card issued by RGI under NPR", "id": "11", "doc_type": "NPR"},
	{"did": "in.gov.voter", "type": "Voter ID", "id": "12", "doc_type": "VTRID"},
	{"did": "in.gov.other", "type": "Others(Local Authority)", "id": "13", "doc_type": "STATE"},
}

var states = []map[string]string{
	{"state_id": "58", "state_name": "123"},
	{"state_id": "56", "state_name": "Ambegaon"},
	{"state_id": "1", "state_name": "Andaman and Nicobar Islands"},
	{"state_id": "2", "state_name": "Andhra Pradesh"},
	{"state_id": "3", "state_name": "Arunachal Pradesh"},
	{"state_id": "4", "state_name": "Assam"},
	{"state_id": "5", "state_name": "Bihar"},
}

var districts = []map[string]string{
	{"district_id": "391", "district_name": "Ahmednagar"},
	{"district_id": "364", "district_name": "Akola"},
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
