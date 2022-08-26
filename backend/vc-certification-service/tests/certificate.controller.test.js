const sunbirdRegistryService = require('../src/services/sunbird.service');
const certificateController = require('../src/controllers/certificate.controller');
const validationService = require('../src/services/validation.service');
const uuid = require('uuid');
jest.mock('uuid', () => {
    return {
        v4: jest.fn().mockReturnValue('123')
    }
})
jest.mock('../src/services/sunbird.service', () => {
    return {
        updateCertificate: jest.fn(),
        createCertificate: jest.fn(),
        getCertificate: jest.fn(),
        deleteCertificate: jest.fn(),
        getCertificateForUpdate: jest.fn()
    }
});

beforeEach(() => {
   console.log = jest.fn()
   console.error = jest.fn()
})


test('should call sunbird rc to update certificate', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        body: {
            name: 'Dummy',
            issuanceDate : '12-12-2022'
        },
        header: jest.fn().mockReturnValue('1')
    }

    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    const dataForUpdate = {
        certificateId : "123",
        previousCertificateId : "1",
        startDate : "12-12-2022",
        
     }
    jest.spyOn(sunbirdRegistryService,"getCertificateForUpdate").mockReturnValue(Promise.resolve({issuanceDate : "12-12-2022"}));
    jest.spyOn(sunbirdRegistryService,"createCertificate").mockReturnValue(Promise.resolve({result : {osid : "123"}}));
    await certificateController.updateCertificate(req, res);
    expect(sunbirdRegistryService.getCertificateForUpdate).toHaveBeenCalledWith('Dummy', '1', '1');
    expect(sunbirdRegistryService.createCertificate).toHaveBeenCalledWith(req.body, 'Dummy', '1');
    expect(sunbirdRegistryService.createCertificate).toHaveBeenCalledWith(dataForUpdate, 'RevokedCertificate', '1');
    expect(sunbirdRegistryService.deleteCertificate).toHaveBeenCalledWith(req.body, 'Dummy', '1','1');
});

test('should call sunbird rc to create certificate', async() => {
    const req = {
        params: {
            entityType: 'Dummy'
        },
        body: {
            name: 'Dummy'
        },
        header: jest.fn().mockReturnValue('1')
    }
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    
    };
    jest.spyOn(validationService , 'validateCertificateInput').mockReturnValue ("valid");

    const kafkaProducer = {
        send: jest.fn(),
        connect: jest.fn()
    }
    jest.spyOn(res, 'status');
    jest.spyOn(kafkaProducer, 'send');
    await certificateController.createCertificate(req, res, kafkaProducer);
    expect(kafkaProducer.send).toHaveBeenCalledWith({
        topic: 'vc-certify',
        messages: [
            {key: null, value: JSON.stringify({body: req.body, transactionId: '123', entityType: req.params.entityType, token: req.header("Authorization")})}
        ]}
    );
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should call sunbird rc to get certificate', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        body: {
            name: 'Dummy'
        },
        headers: {
        },
    }
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        },
        setHeader: function(h, v) {}
    };
    certificateController.getCertificate(req, res);
    expect(sunbirdRegistryService.getCertificate).toHaveBeenCalledWith('Dummy', '1', {})
});

test('update certificate should throw error', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            entityId: '1'
        },
        body: {
            name: 'Dummy'
        },
        header: jest.fn().mockReturnValue('1')
    }

    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    jest.spyOn(res, 'status')
    const response = await sunbirdRegistryService.updateCertificate.mockImplementation(() => {throw new Error('some problem');});
    certificateController.updateCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('create certificate should throw error', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            entityId: '1'
        },
        body: {
            name: 'Dummy'
        },
        header: jest.fn().mockReturnValue('1')
    }

    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    jest.spyOn(res, 'status')
    const response = await sunbirdRegistryService.createCertificate.mockImplementation(() => {throw new Error('some problem');});
    certificateController.createCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('get certificate should throw error', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        body: {
            name: 'Dummy'
        },
        header: jest.fn().mockReturnValue('1'),
    }
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        },
        setHeader: function(h, v) {}
    };
    jest.spyOn(res, 'status')
    const response = await sunbirdRegistryService.getCertificate.mockImplementation(() => {throw new Error('some problem');});
    certificateController.getCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
}); 

test('test issuer format', async () => {
    expect(validationService.isURIFormat("2342343334")).toBe(false);
    expect(validationService.isURIFormat("http://test.com/123")).toBe(true);
    expect(validationService.isURIFormat("did:in.gov.uidai.aadhaar:2342343334")).toBe(true);
});
