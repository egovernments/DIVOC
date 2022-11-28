const axios = require('axios');
jest.mock('axios');
const sunbirdRegistryService = require('../src/services/sunbird.service');
const config = require('../src/configs/config')
const constants = require('../src/configs/constants')

jest.mock('../src/configs/constants', () => {
    return {
        SUNBIRD_TENANT_INVITE_URL: '/api/v1/Tenant/invite',
        SUNBIRD_GET_TRANSACTION_URL: '/api/v1/TransactionCertificateMap/search',
        MINIO_CONTEXT_URL: '/api/v1/ContextURL'
    }
});

test('should create entity in registry', async() => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const data = {
        url: '/vc-management/v1/context/context.json'
    }
    const token = 123;
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.createEntity(constants.MINIO_CONTEXT_URL, data, token);
    expect(axios.post).toHaveBeenCalledWith('/api/v1/ContextURL', data, {headers: {Authorization: token}});
    expect(actualResponse).toEqual({message: {}});
});

test('error create entity in registry', async() => {
    const data = {
        url: '/vc-management/v1/context/context.json'
    }
    const token = 123;
    axios.post.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.createEntity(constants.MINIO_CONTEXT_URL, data, token)).rejects.toThrow('some problem');
});

test('should get entity from registry', async() => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const token = 123;
    axios.get.mockImplementation((url, headers) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.getEntity(`${constants.MINIO_CONTEXT_URL}/123`, token);
    expect(axios.get).toHaveBeenCalledWith(`${constants.MINIO_CONTEXT_URL}/123`, {headers: {Authorization: token}});
    expect(actualResponse).toEqual({message: {}});
});

test('error get entity from registry', async() => {
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
    const request = {
        url: '/vc-management/v1/tenant'
    }
    axios.post.mockImplementation((url, request) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.createTenant( request);
    expect(axios.post).toHaveBeenCalledWith(constants.SUNBIRD_TENANT_INVITE_URL, request);
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
    const token = 123;
    axios.delete.mockImplementation((url, headers) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.deleteEntity(constants.MINIO_CONTEXT_URL, token);
    expect(axios.delete).toHaveBeenCalledWith(constants.MINIO_CONTEXT_URL, {headers: {Authorization: token}});
    expect(actualResponse).toEqual({message: {}});
});

test('error delete entity in registry', async() => {
    const token = 123;
    axios.delete.mockImplementation((url, headers) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.deleteEntity(constants.MINIO_CONTEXT_URL, token)).rejects.toThrow('some problem');
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
    const UPDATE_URL = `/api/v1/${type}`;
    const data = {
        url: '/vc-management/v1/context/context.json'
    }
    const token = 123;
    axios.put.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.updateEntity(UPDATE_URL, data, token)).rejects.toThrow('some problem');
});

test('get transaction id from transaction request', async () => {
    jest.resetModules();
    const expectedResponse = {
        data : {
            message: 'transaction successfull',
            transactionResponse : {}
        }
    };
    const transactionRequest = {
        "filters": {
            "transactionId": {
                "eq": 123
            }
        }
    };
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(expectedResponse));
    const SUNBIRD_GET_TRANSACTION_URL = '/api/v1/TransactionCertificateMap/search';
    const token = 456;
    const transactionId =  123;
    const actualResponse = await sunbirdRegistryService.getTransaction(transactionId, token);
    expect(axios.post).toHaveBeenCalledWith(SUNBIRD_GET_TRANSACTION_URL, transactionRequest, {headers: {Authorization: token}});
    expect(actualResponse).toEqual(expectedResponse.data);

});

test('error get transaction id from transaction request', async () => {
    const token = 456;
    const transactionId =  1235;
    axios.post.mockImplementation((url, body, headers) => Promise.reject(new Error('some problem')));
    expect(sunbirdRegistryService.getTransaction(transactionId, token)).rejects.toThrow('some problem');

});


test('get tenant id', async () => {
    const expectedResponse = {
        data:[{osid: '1-123'}]
    };
    axios.get.mockImplementation((url, token) => Promise.resolve(expectedResponse));
    const token = 456;
    const actualResponse = await sunbirdRegistryService.getTenantId(token);
    const SUNBIRD_REGISTRY_URL = config.SUNBIRD_REGISTRY_URL;
    expect(axios.get).toHaveBeenCalledWith(`${SUNBIRD_REGISTRY_URL}/api/v1/Tenant`, {headers: {Authorization: token}});
    expect(actualResponse).toEqual('123')
});

test(' error get tenant id', async () => {
    axios.get.mockImplementation((url, token) => Promise.reject(new Error('some problem')));
    const token = 456;
    expect(sunbirdRegistryService.getTenantId(token)).rejects.toThrow('some problem');
});
