const axios = require('axios');
jest.mock('axios');
const sunbirdRegistryService = require('../src/services/sunbird.service');

test('should create entity in registry', async() => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const CONTEXT_ADD_URL = 'http://localhost:8081/api/v1/ContextURL';
    const data = {
        url: '/vc-management/v1/context/context.json'
    }
    const token = 123;
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(expectedResponse));
    const actualResponse = await sunbirdRegistryService.createEntity(CONTEXT_ADD_URL, data, token);
    expect(axios.post).toHaveBeenCalledWith(CONTEXT_ADD_URL, data, {headers: {Authorization: token}});
    expect(actualResponse).toEqual({message: {}});
});