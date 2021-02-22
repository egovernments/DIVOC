import json
import requests as r
import logging
import sys
import time
import test_utils

log = logging.getLogger();
log.setLevel(logging.DEBUG);
log.addHandler(logging.StreamHandler(sys.stdout));

VACCINATION_API = "http://vaccination_api:8000" + "/divoc/api/v1/"
CERTIFY_REQUEST_BODY = "test_data/certify.json"
GET_CERTIFICATE_BODY = "test_data/get_certificate.json"


def service_check():
    try:
        vacc_api_resp = r.get(VACCINATION_API + "ping")
        registry_resp = r.get(test_utils.REGISTRY_SEARCH)
    except Exception as e:
        log.info("Error : %s", e)
        return False
    return (vacc_api_resp.status_code == 200) and (registry_resp.status_code == 200)

def test_certify():
    old_certs = test_utils.fetch_certificates(GET_CERTIFICATE_BODY);
    log.info("User has %s old certificates", len(old_certs))

    headers = {
        'Authorization' : 'Bearer ' + test_utils.fetch_auth_token(),
        'Content-Type': 'application/json'
    }
    certify_data = json.load(open(CERTIFY_REQUEST_BODY))[0]
    certify_res = r.post(VACCINATION_API + "certify", headers=headers, data=open(CERTIFY_REQUEST_BODY))
    assert certify_res.status_code == 200, "post /cerify call failed. Response code : {code}".format(code = certify_res.status_code)
    log.info("Cerify request sent")
    
    new_certs = []
    max_tries = 12
    for i in range(max_tries):
        log.info("Fetching certificates...., try no : %s", i+1)
        new_certs = test_utils.fetch_certificates(GET_CERTIFICATE_BODY)
        if(len(new_certs) == len(old_certs) + 1):
            latest_cert = [x for x in new_certs if x not in old_certs][0]
            assert latest_cert["name"] == certify_data["recipient"]["name"], "recipient name mismatch"
            assert latest_cert["mobile"] == certify_data["recipient"]["contact"][0][4:], "recipient contact mismatch"
            log.info("Test Certify Successful")
            break;
        log.info("No new Certificate found")
        time.sleep(5)
    assert len(new_certs) == len(old_certs) + 1, "Cerrificate creation failed"

def run_tests():
    test_certify()

tests_ran = False
ping_retries = 24
for i in range(ping_retries):
    log.info("Trying to ping...., try no : %s", i+1)
    if(service_check()):
        log.info("Ping successful. Starting tests")
        run_tests()
        tests_ran = True
        break
    log.info("Ping failed. Services not ready")
    time.sleep(5)
if(not tests_ran):
    exit(1)
