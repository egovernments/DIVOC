import requests as r

KEYCLOAK_URL = "http://keycloak:8080/auth"
TOKEN_URL = KEYCLOAK_URL + "/realms/divoc/protocol/openid-connect/token"
REGISTRY_SEARCH = "http://registry:8081/search"

def fetch_auth_token():
    headers = {
        "Content-type" : "application/x-www-form-urlencoded"
    }
    body = {
        "grant_type" : "client_credentials",
        "client_id" : "admin-api",
        "client_secret" : "a1832880-059a-40d0-86b1-e318ced82613"
    }
    resp = r.post(TOKEN_URL, data=body, headers=headers)
    assert resp.status_code == 200, "Failed to fetch Auth Token. Response code : {code}".format(code = resp.status_code)
    return resp.json()['access_token']

def fetch_certificates(enrollmentCode):
    body = """{
    "id": "open-saber.registry.search",
    "ver": "1.0",
    "ets": "11234",
    "params": {
        "did": "",
        "key": "",
        "msgid": ""
    },
    "request": {
        "entityType":["VaccinationCertificate"],
        "filters": {
            "preEnrollmentCode":{"eq":"%s"}
         }
    } 
}"""%enrollmentCode
    print("Posting %s"%body)
    get_cert_response = r.post(REGISTRY_SEARCH, headers={"Content-Type": "application/json"}, data=body)
    print("Resp %s"%get_cert_response.content)
    assert get_cert_response.status_code == 200, "Failed to fetch Certificates from registry. Response code : {c}".format(c=get_cert_response.status_code)
    response_json = get_cert_response.json()
    assert response_json["params"]["status"] == "SUCCESSFUL", "Request unsuccessful"    
    return response_json["result"]["VaccinationCertificate"]
