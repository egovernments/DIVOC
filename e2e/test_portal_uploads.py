import requests as r
import utils
import time

def upload_csv(url, token, filePath, params={}):
    headers = {
        'Authorization' : 'Bearer ' + token,
    }
    files = {
        'file': ('file', open(filePath, 'rb'), 'text/csv')
    }
    files.update(params)
    print("Upload request params : ", files)
    try:
        res = r.post(url, headers=headers, files=files)
        return res.status_code == 200
    except Exception as e:
        print("Exception while uploading: ", e)

def fetch_results(url, token):
    headers = {
        'Authorization' : 'Bearer ' + token,
    }
    try:
        res = r.get(url, headers=headers)
        return res.json() if res.status_code == 200 else False
    except Exception as e:
        print("Exception while fetching results: ", e)

def entity_upload_verify(entityType, uploadURL, fetchURL, uploadFile, expectedAdditions, initFetchRetries = 5, initFetchWaitTime = 6, finalFetchRetries = 5, finalFetchWaitTime = 6, params={}):
    token = utils.fetch_auth_token()
    i = initFetchRetries
    while i > 0:
        existing = fetch_results(fetchURL, token)
        if existing is None:
            i = i -1
            time.sleep(initFetchWaitTime)
        else:
            break
    print(entityType, " Existing : ", len(existing))
    upload_csv(uploadURL, token, uploadFile, params)

    uploadSuccess = False
    i = finalFetchRetries
    while i > 0:
        time.sleep(finalFetchWaitTime)
        print("Retries if failed : ", i)
        latest = fetch_results(fetchURL, token)
        print(entityType, " Latest : ", len(existing))
        if len(latest) == len(existing) + expectedAdditions:
            uploadSuccess = True
            break
        else:
            print("Retrying again...")
            i = i - 1
    assert uploadSuccess == True

def test_facility_upload():
    entity_upload_verify(
        "Facilities", 
        "http://portal_api:8001/divoc/admin/api/v1/facilities", 
        "http://portal_api:8001/divoc/admin/api/v1/facilities", 
        "test_data/facilities.csv", 
        5
    )

def test_vaccinator_upload():
    entity_upload_verify(
        "Vaccinators", 
        "http://portal_api:8001/divoc/admin/api/v1/vaccinators", 
        "http://portal_api:8001/divoc/admin/api/v1/vaccinators", 
        "test_data/vaccinators.csv", 
        3
    )

def test_enrollment_upload():
    entity_upload_verify(
        "Enrollments", 
        "http://portal_api:8001/divoc/admin/api/v1/enrollments", 
        "http://portal_api:8001/divoc/admin/api/v1/enrollments", 
        "test_data/enrollments.csv", 
        3,
        finalFetchWaitTime=10, 
        params={'programId': (None, "abcd")}
    )