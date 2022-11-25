const axios = require('axios');
jest.mock('axios');
const vcCertificationService = require('../src/services/vc.certification.service');
const constants = require('../src/configs/constants');

console.error = jest.fn()

test("should call post api to revoke certificate", async() => {
    const response = {
        data: {
            message: 'Certificate revoked Successfully',
            certificateRevokeResponse: {}
        }
    }
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(response));
    const token = 'abc';
    const reqBody = {
        certificateId: '123',
        newCertId: '123'
    };
    const actualResponse = await vcCertificationService.revokeCertificate(reqBody,token);
    expect(axios.post).toHaveBeenCalledWith(`${constants.VC_CERTIFICATION_SERVICE_REVOKE_URL}`, reqBody, {headers: {Authorization:token}});
    expect(actualResponse).toEqual(response.data);
});

test("should call post api to revoke certificate", async() => {
    axios.post.mockImplementation((url, body, headers) => Promise.reject(Error));
    const token = 'abc';
    const reqBody = {
        certificateId: '123',
        newCertId: '123'
    };
    try {
        await vcCertificationService.revokeCertificate(reqBody,token);
    } catch (error) {
        expect(error).toEqual(Error)
    }
    expect(axios.post).toHaveBeenCalledWith(`${constants.VC_CERTIFICATION_SERVICE_REVOKE_URL}`, reqBody, {headers: {Authorization:token}});
});