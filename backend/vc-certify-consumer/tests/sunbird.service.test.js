const axios = require('axios');
jest.mock('axios');
const sunbirdService = require('../src/services/sunbird.service');
const constants = require('../src/configs/constants');

console.error = jest.fn()

test("should call post api to create certificate", async() => {
    const response = {
        data: {
            message: 'Certificate Created Successfully',
            certificateCreateResponse: {}
        }
    }
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(response));
    const entityType = 'TrainingCertificate';
    const token = 'abc';
    const reqBody = {
        name: 'Dummy',
        title: 'Dummy'
    };
    const actualResponse = await sunbirdService.createCertificate(reqBody, entityType, token);
    expect(axios.post).toHaveBeenCalledWith(`/api/v1/TrainingCertificate`, reqBody, {headers: {Authorization:token}});
    expect(actualResponse).toEqual(response.data);

});

test("should create error while calling post api to create certificate", async() => {
    axios.post.mockImplementation((url, body, headers) => Promise.reject(Error));
    const entityType = 'TrainingCertificate';
    const token = 'abc';
    const reqBody = {
        name: 'Dummy',
        title: 'Dummy'
    };
    try{
        await sunbirdService.createCertificate(reqBody, entityType, token);
    }
    catch(e){
        expect(e).toEqual(Error)
    }
    expect(axios.post).toHaveBeenCalledWith(`/api/v1/TrainingCertificate`, reqBody, {headers: {Authorization:token}});
});

test("should call post api to add transaction", async() => {
    const response = {
        data: {
            message: 'Transaction added successfully',
            transactionEntityRes: {}
        }
    }
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(response));
    const token = 'abc';
    const reqBody = {
        transactionId: '123',
        certificateId: '123'
    };
    const actualResponse = await sunbirdService.addTransaction(reqBody,token);
    expect(axios.post).toHaveBeenCalledWith(`/api/v1/${constants.TRANSACTION_ENTITY_TYPE}`, reqBody, {headers: {Authorization:token}});
    expect(actualResponse).toEqual(response.data);
});

test("should create error while calling post api to add transaction", async() => {
    axios.post.mockImplementation((url, body, headers) => Promise.reject(Error));
    const token = 'abc';
    const reqBody = {
        transactionId: '123',
        certificateId: '123'
    };
    try{
        await sunbirdService.addTransaction(reqBody, token);
    }
    catch(e){
        expect(e).toEqual(Error)
    }
    expect(axios.post).toHaveBeenCalledWith(`/api/v1/${constants.TRANSACTION_ENTITY_TYPE}`, reqBody, {headers: {Authorization:token}});

});

test("Should call delete api to delete certificate", async() => {
    const response = {
        data: {
            message: 'Certificate deleted Successfully',
            certificateDeleteResponse: {}
        }
    }
    axios.delete.mockImplementation((url, headers) => Promise.resolve(response));
    const entityName = 'RevokedVC';
    const token = 'abc';
    const entityId = "123";
    const actualResponse = await sunbirdService.deleteCertificate(entityName, entityId, token);
    expect(axios.delete).toHaveBeenCalledWith(`${constants.SUNBIRD_TRANSACTION_URL}${entityName}/${entityId}`, {headers: {Authorization:token}});
    expect(actualResponse).toEqual(response.data);

});

test("Should create error while calling delete api to delete certificate", async() => {

    axios.delete.mockImplementation((url, headers) => Promise.reject(Error));
    const entityName = 'RevokedVC';
    const token = 'abc';
    const entityId = "123";
    try{
        await sunbirdService.deleteCertificate(entityName, entityId, token);
    }
    catch(e){
        expect(e).toEqual(Error)
    }
     
    expect(axios.delete).toHaveBeenCalledWith(`${constants.SUNBIRD_TRANSACTION_URL}${entityName}/${entityId}`, {headers: {Authorization:token}});
});

test("Should call search api to search certificate", async() => {
    const response = {
        data: {
            message: 'Certificate found Successfully',
            certificates: {}
        }
    }
    axios.post.mockImplementation((url,body, headers) => Promise.resolve(response));
    const entityType = 'RevokedVC';
    const filters = {
        "filters": {
            "osOwner": {
                "eq": '["1234"]'
            }
        },
        "limit": 1,
        "offset": 0
    };
    const token = 'abc';
    const actualResponse = await sunbirdService.searchCertificate(entityType, filters, token);
    expect(axios.post).toHaveBeenCalledWith(`${constants.SUNBIRD_TRANSACTION_URL}${entityType}/search`,filters, {headers: {Authorization:token}});
    expect(actualResponse).toEqual(response.data);

});

test("Should create error while calling search api to search certificate", async() => {
    axios.post.mockImplementation((url,body, headers) => Promise.reject(Error));
    const entityType = 'RevokedVC';
    const filters = {
        "filters": {
            "osOwner": {
                "eq": '["1234"]'
            }
        },
        "limit": 1,
        "offset": 0
    };
    const token = 'abc';
    try {
        await sunbirdService.searchCertificate(entityType, filters, token);
    } catch (error) {
        expect(error).toEqual(Error)
    }
    expect(axios.post).toHaveBeenCalledWith(`${constants.SUNBIRD_TRANSACTION_URL}${entityType}/search`,filters, {headers: {Authorization:token}});
});