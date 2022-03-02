import json
import requests as r
import sys
import time
import utils
import random
import etcd3

VACCINATION_API = "http://vaccination-api:8000" + "/divoc/api/v1/"
CERTIFY_REQUEST_BODY = "test_data/certify.json"
ICD_REQUEST_BODY = "test_data/icd.json"
VACCINE_ICD_REQUEST_BODY = "test_data/vaccine_icd.json"
DDCC_TEMPLATE = "test_data/ddcc_w3c_payload.template"
W3C_TEMPLATE = "test_data/w3c_payload.template"
FIELDS_KEY_PATH = "test_data/fields_key_path.json"

def service_check():
    try:
        vacc_api_resp = r.get(VACCINATION_API + "ping")
        registry_resp = r.get(utils.REGISTRY_SEARCH)
    except Exception as e:
        print("Error : %s" % (e))
        return False
    return (vacc_api_resp.status_code == 200) and (registry_resp.status_code == 200)

def call_and_verify():
    cid = str(random.randint(1e11, 1e12))
    print("Creating certificate %s"%cid)
    old_certs = utils.fetch_certificates(cid);
    print("User has %s old certificates" % (len(old_certs)))

    headers = {
        'Authorization' : 'Bearer ' + utils.fetch_auth_token(),
        'Content-Type': 'application/json'
    }
    icd_data = json.load(open(ICD_REQUEST_BODY))
    vaccine_icd_data = json.load(open(VACCINE_ICD_REQUEST_BODY))
    w3c_template = open(W3C_TEMPLATE)
    ddcc_template = open(DDCC_TEMPLATE)
    fields_key_path = json.load(open(FIELDS_KEY_PATH))
    etcd = etcd3.client(host='etcd')
    etcd.put('ICD', str(icd_data).replace("'", '"'))
    etcd.put('VACCINE_ICD', str(vaccine_icd_data).replace("'", '"'))
    etcd.put('W3C_TEMPLATE', str(w3c_template.read()))
    etcd.put('DDCC_TEMPLATE', str(ddcc_template.read()))
    etcd.put('fieldsKeyPath', str(fields_key_path).replace("'", '"'))
    certify_data = json.load(open(CERTIFY_REQUEST_BODY))[0]
    certify_data["preEnrollmentCode"] = cid
    certify_res = r.post(VACCINATION_API + "certify", headers=headers, json=[certify_data])
    assert certify_res.status_code == 200, "post /cerify call failed. Response code : {code}".format(code = certify_res.status_code)
    print("Cerify request sent")
    
    new_certs = []
    max_tries = 12
    for i in range(max_tries):
        print("Fetching certificates...., try no : %s" % (i+1))
        new_certs = utils.fetch_certificates(cid)
        if(len(new_certs) == len(old_certs) + 1):
            latest_cert = [x for x in new_certs if x not in old_certs][0]
            assert latest_cert["name"] == certify_data["recipient"]["name"], "recipient name mismatch"
            assert latest_cert["mobile"] == certify_data["recipient"]["contact"][0][4:], "recipient contact mismatch"
            print("Test Certify Successful")
            break;
        print("No new Certificate found")
        time.sleep(5)
    assert len(new_certs) == len(old_certs) + 1, "Cerrificate creation failed"
    etcd.delete('ICD')
    etcd.delete('VACCINE_ICD')
    etcd.delete('W3C_TEMPLATE')
    etcd.delete('DDCC_TEMPLATE')
    etcd.delete('fieldsKeyPath')

def test_certify():
    test_ran = False
    ping_retries = 24
    for i in range(ping_retries):
        print("Trying to ping...., try no : %s", i+1)
        if(service_check()):
            print("Ping successful. Starting tests")
            call_and_verify()
            test_ran = True
            break
        print("Ping failed. Services not ready")
        time.sleep(5)
    if(not test_ran):
        exit(1)
