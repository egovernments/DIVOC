const mockConfig = {
    CERTIFICATE_NAMESPACE: 'namespace',
    CERTIFICATE_ISSUER: 'issuer',
    REGISTRY_URL: 'registry_url',
    REGISTRY_CERTIFICATE_SCHEMA: 'dummy',
    REDIS_URL: "redis://redis:6379",
    REDIS_KEY_EXPIRE: 172800,
    REDIS_ENABLED: true,
    CERTIFICATE_RETRY_COUNT: 5
};
const config = require('../config/config');
const redis = require('../redis');
const signer_library = require('certificate-signer-library');
const registry = require('../registry');
jest.mock('../redis', () => {
    return {
        storeKeyWithExpiry: jest.fn().mockImplementation(() => jest.fn()),
        checkIfKeyExists: jest.fn().mockImplementation(() => jest.fn())
    }
});
jest.mock('certificate-signer-library', () => {
    return {
        signCertificateWithoutPersisting: jest.fn().mockImplementation(() => jest.fn())
    }
});
jest.mock('../registry', () => {
    return {
        save: jest.fn().mockImplementation(() => jest.fn())
    }
})

const signer = require('../signer');
jest.mock('../config/config', () => mockConfig);
jest.mock('../config/constant', () => mockConstants);

beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2022, 6, 2));
    jest.spyOn(global.Math, 'random').mockReturnValue(123)
});

beforeEach(() => {
    console.error = jest.fn()
})

test('should transform the input into required template form', () => {
    const certificate = {
        recipient: {
            name: "test",
            registrationNumber: "1",
            salutation: "Dr"
        }
    };
    const date = new Date(2022, 6, 2).toISOString();
    const expectedPayload = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "namespace"
        ],
        "type": [
            "VerifiableCredential",
            "ProofOfHealthProfessionalCredential"
        ],
        "credentialSubject": {
            "type": "Person",
            "name": "test",
            "registrationNumber": "1",
            "salutation": "Dr",
            "hpid": "",
            "gender": ""
        },
        "evidence": {
            "type": [
                "HealthProfessional"
            ],
            "systemOfMedicine":"",
            "speciality": "",
            "registeredWithCouncil": "",
            "degree": "",
            "year": "",
            "validFrom": "",
            "validTo": "",
            "certificateId": "123"
        },
        "issuer": "issuer",
        "issuanceDate": date,
        "nonTransferable": "true"
    }
    const actualPayload = signer.transformW3(certificate, "123");
    expect(actualPayload).toEqual(expectedPayload);
});

test('should sign certificate', async() => {
    const certificateJson = {
        recipient: {
            name: "test",
            registrationNumber: "1",
            salutation: "Dr"
        },
        preEnrollmentCode: '1'
    };
    jest.spyOn(redis, 'checkIfKeyExists').mockReturnValue(false);
    const signed = {name: 'test'};
    jest.spyOn(signer_library, 'signCertificateWithoutPersisting').mockReturnValue(signed);
    const expectedSignedCertificate = {
        name: 'test',
        contact: undefined,
        mobile: '',
        preEnrollmentCode: '1',
        certificateId: '110800000000',
        certificate: JSON.stringify(signed),
        programId: '',
        meta: undefined
    }
    const actualSignedCertificate = await signer.signCertificate(certificateJson);
    expect(actualSignedCertificate).toEqual(expectedSignedCertificate);
});

test('should print duplicate pre-enrollment message on console', async() => {
    const certificateJson = {
        recipient: {
            name: "test",
            registrationNumber: "1",
            salutation: "Dr"
        },
        preEnrollmentCode: '1'
    };
    jest.spyOn(redis, 'checkIfKeyExists').mockReturnValue(true);
    jest.spyOn(console, 'error');
    await signer.signCertificate(certificateJson);
    expect(console.error).toHaveBeenCalledWith("Duplicate pre-enrollment code received for certification :1");
});

test('should call save method of registry', async() => {
    const signed = {name: 'test'};
    const signedCertificate = {
        name: 'test',
        contact: undefined,
        mobile: '',
        preEnrollmentCode: '1',
        certificateId: '110800000000',
        certificate: JSON.stringify(signed),
        programId: '',
        meta: undefined
    };
    const savedResponse = Promise.resolve({status: 200, data: {params: {status: "SUCCESSFUL"}}, signedCertificate: signedCertificate});
    jest.spyOn(registry, 'save').mockReturnValue(savedResponse);
    jest.spyOn(redis, 'storeKeyWithExpiry');
    await signer.saveCertificate(signedCertificate, 123);
    expect(redis.storeKeyWithExpiry).toHaveBeenCalledWith(123, "110800000000");
});

test('should throw error if retry count exceeds prescribed count', async() => {
    const signed = {name: 'test'};
    const signedCertificate = {
        name: 'test',
        contact: undefined,
        mobile: '',
        preEnrollmentCode: '1',
        certificateId: '110800000000',
        certificate: JSON.stringify(signed),
        programId: '',
        meta: undefined
    };
    const unsuccessfulResponse = Promise.resolve({
        status: 400,
        data: {
            params: {
                status: "UNSUCCESSFUL",
                errmsg: "duplicate key value violates unique constraint"
            }
        }});
    const successfulResponse = Promise.resolve({
        status: 200,
        data: {
            params: {
                status: "SUCCESSFUL"
            }
        }});
    jest.spyOn(registry, 'save').mockReturnValueOnce(unsuccessfulResponse).mockReturnValueOnce(successfulResponse);
    jest.spyOn(signer, 'saveCertificate');
    await signer.saveCertificate(signedCertificate, 123);
    expect(registry.save).toHaveBeenCalledTimes(2);
});

afterAll(() => {
    jest.useRealTimers();
    jest.spyOn(global.Math, 'random').mockRestore();
});

afterEach(() => {
    jest.clearAllMocks();
})