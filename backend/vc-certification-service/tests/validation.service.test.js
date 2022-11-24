const validationService = require('../src/services/validation.service');
const {CustomError} = require("../src/models/errors");

beforeEach(() => {
    console.log = jest.fn()
    console.error = jest.fn()
})
//
// test('Should throw error if issuanceDate is not present in the certify payload', async() => {
//     const req = {
//         body : {
//             name: "Test"
//         }
//     }
//     const customError = {
//         response: {
//             data: {
//                 message: "IssuanceDate is missing"
//             },
//             status: 400
//         }
//     }
//     expect(validationService.validateCertificateInput(req, 'create')).rejects.toThrow(CustomError);
// })

test('test issuer format', async () => {
    expect(validationService.isURIFormat("2342343334")).toBe(false);
    expect(validationService.isURIFormat("http://test.com/123")).toBe(true);
    expect(validationService.isURIFormat("did:in.gov.uidai.aadhaar:2342343334")).toBe(true);
});