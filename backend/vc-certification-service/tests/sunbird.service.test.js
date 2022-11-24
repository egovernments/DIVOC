const axios = require('axios');
jest.mock('axios');
const sunbirdService = require('../src/services/sunbird.service');
const {body} = require("express-validator");

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
    const actualResponse = await sunbirdService.getCertificate(entityName, certificateId, {});
    expect(axios.get).toHaveBeenCalledWith('/api/v1/TrainingCertificate/1', {responseType: 'stream', headers: {}});
    expect(actualResponse).toEqual(response);
});

test('should call get api to get certificate for update', async() => {
    const response = {
        data: {
            certificate: {}
        }
    };
    axios.get.mockImplementation((url, headers) => Promise.resolve(response));
    const entityName = 'TrainingCertificate';
    const certificateId = '1';
    const token = '1';
    const actualResponse = await sunbirdService.getCertificateForUpdate(entityName, certificateId, token);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/TrainingCertificate/1', {headers: {Authorization: token}});
    expect(actualResponse).toEqual(response);
});

test('should call delete api to delete certificate', async() => {
    const response = {
        data: {}
    };
    axios.delete.mockImplementation((url, headers) => Promise.resolve(response));
    const entityName = 'TrainingCertificate';
    const entityId = '1';
    const token = '1';
    const actualResponse = await sunbirdService.deleteCertificate(entityName, entityId, token);
    expect(axios.delete).toHaveBeenCalledWith('/api/v1/TrainingCertificate/1', {headers: {Authorization: token}});
    expect(actualResponse).toEqual(response.data);
});

test('should call post api to revoke certificate', async() => {
    const response = {
        data: {
            message: 'Certificate revoked Successfully'
        }
    }
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(response));
    const token = 'abc';
    const reqBody = {
        name: 'Dummy',
        title: 'Dummy'
    };
    const actualResponse = await sunbirdService.revokeCertificate(reqBody, token);
    expect(axios.post).toHaveBeenCalledWith('/api/v1/RevokedVC', reqBody, {headers: {Authorization:token}});
    expect(actualResponse).toEqual(response.data);

});

test('should call post api to search certificate', async() => {
    const response = {
        data: {
            certificates: []
        }
    }
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(response));
    const token = 'abc';
    const entityType = 'TrainingCertificate';
    const filters = {
        "certificateId": {
            "eq": '1'
        }
    };
    const actualResponse = await sunbirdService.searchCertificate(entityType, filters, token);
    expect(axios.post).toHaveBeenCalledWith('/api/v1/TrainingCertificate/search', filters, {headers: {Authorization:token}});
    expect(actualResponse).toEqual(response.data);

});

test('should call post api to search certificate without token', async() => {
    const response = {
        data: {
            certificates: []
        }
    }
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(response));
    const entityType = 'TrainingCertificate';
    const filters = {
        "certificateId": {
            "eq": '1'
        }
    };
    const actualResponse = await sunbirdService.searchCertificateWithoutToken(entityType, filters);
    expect(axios.post).toHaveBeenCalledWith('/api/v1/TrainingCertificate/search', filters);
    expect(actualResponse).toEqual(response.data);

});

test('should call post api to verify certificate', async() => {
    const response = {
        data: {
            isVerified: true
        }
    }
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(response));
    const body = {
        "certificate": {
            "context": [],
            "evidence": []
        }
    };
    const actualResponse = await sunbirdService.verifyCertificate(body);
    expect(axios.post).toHaveBeenCalledWith('/verify', body);
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

test('get api should throw error while getting certificate for update', async() => {
    axios.get.mockImplementation((url, headers) => Promise.reject(new Error('some problem')))
    const entityName = 'TrainingCertificate';
    const certificateId = '1';
    const token = 'abc';
    expect(sunbirdService.getCertificateForUpdate(entityName, certificateId, token)).rejects.toThrow('some problem');
});

test('delete api should throw error while deleting certificate', async() => {
    axios.delete.mockImplementation((url, headers) => Promise.reject(new Error('some problem')))
    const entityName = 'TrainingCertificate';
    const entityId = '1';
    const token = 'abc';
    expect(sunbirdService.deleteCertificate(entityName, entityId, token)).rejects.toThrow('some problem');
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

test('post api should throw error while revoking certificate', async() => {
    axios.post.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')))
    const token = 'abc';
    const reqBody = {
        name: 'Dummy',
        title: 'Dummy'
    };
    expect(sunbirdService.revokeCertificate(reqBody, token)).rejects.toThrow('some problem');
});

test('post api should throw error while searching certificate', async() => {
    axios.post.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')))
    const token = 'abc';
    const entityType = 'TrainingCertificate';
    const filters = {
        "certificateId": {
            "eq": '1'
        }
    };
    expect(sunbirdService.searchCertificate(entityType, filters, token)).rejects.toThrow('some problem');
});

test('post api should throw error while searching certificate without token', async() => {
    axios.post.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')))
    const entityType = 'TrainingCertificate';
    const filters = {
        "certificateId": {
            "eq": '1'
        }
    };
    expect(sunbirdService.searchCertificateWithoutToken(entityType, filters)).rejects.toThrow('some problem');
});

test('post api should throw error while verifying certificate', async() => {
    axios.post.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')))
    const body = {
        "certificate": {
            "context": [],
            "evidence": []
        }
    };
    expect(sunbirdService.verifyCertificate(body)).rejects.toThrow('some problem');
});
