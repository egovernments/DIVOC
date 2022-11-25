const validationService = require('../src/services/validation.service');
const {CustomError} = require("../src/models/errors");

beforeEach(() => {
    console.log = jest.fn()
    console.error = jest.fn()
})

test('Should throw error if issuanceDate is not present in the certify payload', async() => {
    const req = {
        body : {
            name: "Test"
        }
    }
    let thrownError;
    try {
        validationService.validateCertificateInput(req, 'create')
    } catch (err) {
        thrownError = err
    }
    expect(thrownError).toEqual(new CustomError('IssuanceDate is missing', 400));
})

test('Should throw error if issuer is not present in the certify payload', async() => {
    const req = {
        body : {
            name: "Test",
            issuanceDate: '2022-10-09T09:08:09.899Z'
        }
    }
    let thrownError;
    try {
        validationService.validateCertificateInput(req, 'create')
    } catch (err) {
        thrownError = err
    }
    expect(thrownError).toEqual(new CustomError('Issuer detail is missing', 400));
})

test('Should throw error if certificateId is not present in the certify payload during update', async() => {
    const req = {
        body : {
            name: "Test",
            issuanceDate: '2022-10-09T09:08:09.899Z',
            issuer: 'did:123'
        }
    }
    let thrownError;
    try {
        validationService.validateCertificateInput(req, 'update')
    } catch (err) {
        thrownError = err
    }
    expect(thrownError).toEqual(new CustomError('certificateId is missing', 400));
})


test('Should throw error if issuance date is not in valid iso date format in the certify payload', async() => {
    const req = {
        body : {
            name: "Test",
            issuanceDate: '2022-10-09',
            issuer: 'did:123'
        }
    }
    let thrownError;
    try {
        validationService.validateCertificateInput(req, 'create')
    } catch (err) {
        thrownError = err
    }
    expect(thrownError).toEqual(new CustomError('IssuanceDate is not in valid format', 400));
})

test('Should throw error if valid from date is not in valid iso date format in the certify payload', async() => {
    const req = {
        body : {
            name: "Test",
            issuanceDate: '2022-10-09T09:08:09.899Z',
            issuer: 'did:123',
            validFrom: '2022-10-09'
        }
    }
    let thrownError;
    try {
        validationService.validateCertificateInput(req, 'create')
    } catch (err) {
        thrownError = err
    }
    expect(thrownError).toEqual(new CustomError('Valid from date is not in valid format', 400));
})

test('Should throw error if valid till date is not in valid iso date format in the certify payload', async() => {
    const req = {
        body : {
            name: "Test",
            issuanceDate: '2022-10-09T09:08:09.899Z',
            issuer: 'did:123',
            validTill: '2022-10-09'
        }
    }
    let thrownError;
    try {
        validationService.validateCertificateInput(req, 'create')
    } catch (err) {
        thrownError = err
    }
    expect(thrownError).toEqual(new CustomError('Valid till date is not in valid format', 400));
})

test('Should throw error if issuer is not in valid uri format in the certify payload', async() => {
    const req = {
        body : {
            name: "Test",
            issuanceDate: '2022-10-09T09:08:09.899Z',
            issuer: '123'
        }
    }
    let thrownError;
    try {
        validationService.validateCertificateInput(req, 'create')
    } catch (err) {
        thrownError = err
    }
    expect(thrownError).toEqual(new CustomError('Invalid Issuer format', 400));
})

test('test issuer format', async () => {
    expect(validationService.isURIFormat("2342343334")).toBe(false);
    expect(validationService.isURIFormat("http://test.com/123")).toBe(true);
    expect(validationService.isURIFormat("test.com")).toBe(false);
    expect(validationService.isURIFormat("did:in.gov.uidai.aadhaar:2342343334")).toBe(true);
});

test('throw error if date is not in valid iso date format', async () => {
    let thrownError;
    const date = '1972-10-09'
    try {
        validationService.validPresentDate(date)
    } catch (err) {
        thrownError = err
    }
    expect(thrownError).toEqual(new CustomError('Valid End date is not in valid format', 400));
})

test('throw error if end date is older than current date', async () => {
    let thrownError;
    const date = '1972-10-09T09:09:09.098Z';
    try {
        validationService.validPresentDate(date)
    } catch (err) {
        thrownError = err
    }
    expect(thrownError).toEqual(new CustomError('Valid End date can\'t be past date', 400));
})