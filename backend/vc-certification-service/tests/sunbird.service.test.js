const axios = require('axios');
jest.mock('axios');
const sunbirdService = require('../src/services/sunbird.service');

test('should call put api to update certificate', async() => {
    const response = {
        message: 'Certificate Updated Successfully',
        certificateUpdateResponse: {}
    };
    axios.put.mockImplementation((url, body, headers) => Promise.resolve(response))
    const entityName = 'TrainingCertificate';
    const entityId = '1';
    // mockAxios.mockResponse(response);
    const reqBody = {
        name: 'Dummy',
        title: 'Dummy'
    }
    sunbirdService.updateCertificate(reqBody, entityName, entityId, 'abc');
    expect(axios.put).toHaveBeenCalledWith('/api/v1/TrainingCertificate/1', reqBody, {headers: {Authorization: 'abc'}});
});