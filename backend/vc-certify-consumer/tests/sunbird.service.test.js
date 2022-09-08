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