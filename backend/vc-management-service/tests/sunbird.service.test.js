const axios = require('axios');
jest.mock('axios');
const sunbirdRegistryService = require('../src/services/sunbird.service');

jest.mock('../src/configs/constants', () => {
    return {
        SUNBIRD_TENANT_INVITE_URL: '/api/v1/Tenant/invite',
        SUNBIRD_GET_TRANSACTION_URL: '/api/v1/TransactionCertificateMap/search'
    }
});

test('should create entity in registry', async() => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const CONTEXT_ADD_URL = '/api/v1/ContextURL';
    const data = {
        url: '/vc-management/v1/context/context.json'
    }
    const token = 123;
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.createEntity(CONTEXT_ADD_URL, data, token);
    expect(axios.post).toHaveBeenCalledWith('/api/v1/ContextURL', data, {headers: {Authorization: token}});
    expect(actualResponse).toEqual({message: {}});
});

test('error create entity in registry', async() => {
    const CONTEXT_ADD_URL = 'http://localhost:8081/api/v1/ContextURL';
    const data = {
        url: '/vc-management/v1/context/context.json'
    }
    const token = 123;
    axios.post.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.createEntity(CONTEXT_ADD_URL, data, token)).rejects.toThrow('some problem');
});

test('should get entity from registry', async() => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const CONTEXT_ADD_URL = 'http://localhost:8081/api/v1/ContextURL/123';
    const token = 123;
    axios.get.mockImplementation((url, headers) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.getEntity(CONTEXT_ADD_URL, token);
    expect(axios.get).toHaveBeenCalledWith(CONTEXT_ADD_URL, {headers: {Authorization: token}});
    expect(actualResponse).toEqual({message: {}});
});

test('error get entity from registry', async() => {
    const CONTEXT_ADD_URL = 'http://localhost:8081/api/v1/ContextURL/123';
    const token = 123;
    axios.get.mockImplementation((url, headers) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.getEntity).rejects.toThrow('some problem');
});

test('should call create api to create tenant', async () => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const TENANT_INVITE_URL = '/api/v1/Tenant/invite';
    const request = {
        url: '/vc-management/v1/tenant'
    }
    axios.post.mockImplementation((url, request) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.createTenant( request);
    expect(axios.post).toHaveBeenCalledWith(TENANT_INVITE_URL, request);
    expect(actualResponse).toEqual({message: {}})
});

test('error call create api to create tenant', async () => {
    const request = {
        url: '/vc-management/v1/tenant'
    }
    axios.post.mockImplementation((url, request) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.createTenant( request)).rejects.toThrow('some problem');
});

test('should delete entity in registry', async() => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const CONTEXT_URL = 'http://localhost:8081/api/v1/ContextURL';
    const token = 123;
    axios.delete.mockImplementation((url, headers) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.deleteEntity(CONTEXT_URL, token);
    expect(axios.delete).toHaveBeenCalledWith(CONTEXT_URL, {headers: {Authorization: token}});
    expect(actualResponse).toEqual({message: {}});
});

test('error delete entity in registry', async() => {
    const CONTEXT_URL = 'http://localhost:8081/api/v1/ContextURL';
    const token = 123;
    axios.delete.mockImplementation((url, headers) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.deleteEntity(CONTEXT_URL, token)).rejects.toThrow('some problem');
});

test('should update entity in registry', async () => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const type = 'dummy';
    const UPDATE_URL = `/api/v1/${type}`;
    const data = {
        url: '/vc-management/v1/context/context.json'
    }
    const token = 123;
    axios.put.mockImplementation((url, body, headers) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.updateEntity(UPDATE_URL, data, token);
    expect(axios.put).toHaveBeenCalledWith(UPDATE_URL, data, {headers: {Authorization: token}});
    expect(actualResponse).toEqual({message: {}});

});

test('error update entity in registry', async () => {
    const type = 'dummy';
    const UPDATE_URL = `/localhost:8081/api/v1/${type}`;
    const data = {
        url: '/vc-management/v1/context/context.json'
    }
    const token = 123;
    axios.put.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.updateEntity(UPDATE_URL, data, token)).rejects.toThrow('some problem');
});

// test('get transaction id from transaction request', async () => {
//     jest.resetModules();
//     const expectedResponse = {
//         data : {
//             message: 123456
//         }
//     };
//     const transactionRequest = {
//         "filters": {
//             "transactionId": {
//                 "eq": 1235
//             }
//         }
//     };
//     axios.post.mockImplementation((url, body, headers) => Promise.resolve(expectedResponse));
//     const SUNBIRD_GET_TRANSACTION_URL = '/api/v1/TransactionCertificateMap/search';
//     const token = 456;
//     const transactionId =  123;
//     const actualResponse = await sunbirdRegistryService.getTransaction(transactionId, token);
//     await expect(axios.post).toHaveBeenCalledWith(SUNBIRD_GET_TRANSACTION_URL, transactionRequest, {headers: {Authorization: token}});
//     expect(actualResponse).toEqual(expectedResponse.data);

// });

test('error get transaction id from transaction request', async () => {
    const token = 456;
    const transactionId =  1235;
    axios.post.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.getTransaction(transactionId, token)).rejects.toThrow('some problem');

});

test('upload template ', async () => {

})