const axios = require('axios');
jest.mock('axios');
const sunbirdService = require('../src/services/sunbird.service');

console.error = jest.fn()

test('should call put api to update certificate', async() => {
    const response = {
        data: {
            message: 'Certificate Updated Successfully',
            certificateUpdateResponse: {}
        }
    };
    axios.put.mockImplementation((url, body, headers) => Promise.resolve(response))
    const entityName = 'TrainingCertificate';
    const entityId = '1';
    const token = 'abc';
    const reqBody = {
        name: 'Dummy',
        title: 'Dummy'
    }
    const actualResponse = await sunbirdService.updateCertificate(reqBody, entityName, entityId, token);
    expect(axios.put).toHaveBeenCalledWith('/api/v1/TrainingCertificate/1', reqBody, {headers: {Authorization: token}});
    expect(actualResponse).toEqual(response.data);
});

test('should call post api to create certificate', async() => {
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
    expect(axios.post).toHaveBeenCalledWith('/api/v1/TrainingCertificate', reqBody, {headers: {Authorization:token}});
    expect(actualResponse).toEqual(response.data);

});

test('should call get api to get certificate', async() => {
    const response = {
        data: {
            certificate: {}
        }
    };
    axios.get.mockImplementation((url, headers) => Promise.resolve(response));
    const entityName = 'TrainingCertificate';
    const certificateId = '1';
    const outputType = 'pdf';
    const token = 'abc';
    const actualResponse = await sunbirdService.getCertificate(entityName, certificateId, outputType, token);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/TrainingCertificate/1', {headers: {Accept: 'pdf', Authorization: 'abc'}});
    expect(actualResponse).toEqual(response.data);
});

test('put api should throw error while updating certificate', async() => {
    axios.put.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')))
    const entityName = 'TrainingCertificate';
    const entityId = '1';
    const token = 'abc';
    const reqBody = {
        name: 'Dummy',
        title: 'Dummy'
    }
    expect(sunbirdService.updateCertificate(reqBody, entityName, entityId, token)).rejects.toThrow('some problem');
});

test('get api should throw error while getting certificate', async() => {
    axios.get.mockImplementation((url, headers) => Promise.reject(new Error('some problem')))
    const entityName = 'TrainingCertificate';
    const certificateId = '1';
    const outputType = 'pdf';
    const token = 'abc';
    expect(sunbirdService.getCertificate(entityName, certificateId, outputType, token)).rejects.toThrow('some problem');
});

test('post api should throw error while creating certificate', async() => {
    axios.post.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')))
    const entityType = 'TrainingCertificate';
    const token = 'abc';
    const reqBody = {
        name: 'Dummy',
        title: 'Dummy'
    };
    expect(sunbirdService.createCertificate(reqBody, entityType, token)).rejects.toThrow('some problem');
});