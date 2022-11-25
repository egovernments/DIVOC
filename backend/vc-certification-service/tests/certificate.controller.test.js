const sunbirdRegistryService = require('../src/services/sunbird.service');
const certificateController = require('../src/controllers/certificate.controller');
const validationService = require('../src/services/validation.service');
const express = require('express-validator');
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
        searchCertificate: jest.fn(),
        getCertificateForUpdate: jest.fn(),
        verifyCertificate: jest.fn(),
        revokeCertificate: jest.fn(),
        searchCertificateWithoutToken: jest.fn()
    }
});
jest.mock('express-validator', () => {
    return {
        validationResult: jest.fn().mockReturnValue({
            isEmpty: () => true
        })
    }
})
jest.mock('../src/services/validation.service', () => {
    return {
        validateCertificateInput: jest.fn().mockImplementation((a, b) => {}),
        isURIFormat: jest.fn().mockImplementation((a) => true),
        validPresentDate:jest.fn().mockImplementation((a) => {})
    }
});

beforeEach(() => {
   console.log = jest.fn()
   console.error = jest.fn()
})




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
        header: jest.fn().mockReturnValue('1'),
        headers: {}
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
    const filters = {
        "filters": {
            "certificateId": {
                "eq": '1'
            }
        },
        "limit": 1,
        "offset": 0
    }
    certificateController.getCertificate(req, res);
    expect(sunbirdRegistryService.searchCertificate).toHaveBeenCalledWith('Dummy', filters, req.header("Authorization"))
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
    const response = await sunbirdRegistryService.searchCertificate.mockImplementation(() => {throw new Error('some problem');});
    certificateController.getCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('should call sunbird rc to update certificate', async() => {
    const req = {
        params: {
            entityType: 'Dummy'
        },
        body: {
            name: 'Dummy',
            certificateId: '1'
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

    const kafkaProducer = {
        send: jest.fn(),
        connect: jest.fn()
    }
    jest.spyOn(res, 'status');
    jest.spyOn(kafkaProducer, 'send');
    await certificateController.updateCertificate(req, res, kafkaProducer);
    expect(kafkaProducer.send).toHaveBeenCalledWith({
        topic: 'vc-certify',
        messages: [
            {key: null, value: JSON.stringify({body: req.body, transactionId: '123', entityType: req.params.entityType, token: req.header("Authorization")})}
        ]}
    );
    expect(res.status).toHaveBeenCalledWith(200);
})

test('update certificate should throw error when registry throws an error', async() => {
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

    jest.spyOn(validationService , 'validateCertificateInput').mockReturnValue ("valid");

    jest.spyOn(res, 'status')
    const response = await sunbirdRegistryService.updateCertificate.mockImplementation(() => {throw new Error('some problem');});
    certificateController.updateCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('should call sunbird to check if certificate exists during revocation', async() => {
    const req = {
        body: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    const filters = {
        "filters": {
            "certificateId": {
                "eq": '1'
            }
        },
        "limit": 1,
        "offset": 0
    }
    await certificateController.revokeCertificate(req, res);
    expect(sunbirdRegistryService.searchCertificate).toHaveBeenCalledWith('Dummy', filters, req.header("Authorization"))
});

test('should respond with 409 if the certificate is already revoked', async() => {
    const req = {
        body: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    const filters = {
        "filters": {
            "certificateId": {
                "eq": '1'
            }
        },
        "limit": 1,
        "offset": 0
    }
    jest.spyOn(res, 'status');
    jest.spyOn(sunbirdRegistryService, 'searchCertificate').mockReturnValue([{}]);
    await certificateController.revokeCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(409)
});

test('should respond with 400 if the certificateId is not found in the corresponding entity for revocation', async() => {
    const req = {
        body: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    const filters = {
        "filters": {
            "certificateId": {
                "eq": '1'
            }
        },
        "limit": 1,
        "offset": 0
    }
    jest.spyOn(res, 'status');
    jest.spyOn(sunbirdRegistryService, 'searchCertificate').mockReturnValue([]);
    await certificateController.revokeCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(400)
});

test('should respond with 200 if the certificateId of an entity is not revoked already', async() => {
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    const req = {
        body: {
            entityName: 'Dummy',
            certificateId: '1',
            endDate: endDate.toISOString()
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    jest.spyOn(res, 'status');
    jest.spyOn(sunbirdRegistryService, 'searchCertificate').mockReturnValueOnce([{}]).mockReturnValueOnce([]);
    jest.spyOn(sunbirdRegistryService, 'revokeCertificate').mockReturnValue({message: 'Revoked successfully'});
    await certificateController.revokeCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(200)
});

test('should respond with invalid input error code if invalid request body is sent during revocation', async() => {
    const req = {
        body: {
            entityName: 'Dummy'
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    const filters = {
        "filters": {
            "certificateId": {
                "eq": '1'
            }
        },
        "limit": 1,
        "offset": 0
    }
    jest.spyOn(res, 'status');
    jest.spyOn(express, 'validationResult').mockReturnValue({
        isEmpty: () => false
    })
    await certificateController.revokeCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(400)
});

test('should call sunbird to search for revokedCertificate during deletion of revoked certificate', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            revokedCertificateId: '1'
        },
        body: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    const filters = {
        "filters": {
            "previousCertificateId": {
                "eq": '1'
            },
            "schema": {
                "eq": 'Dummy'
            }
        },
        "offset": 0
    }
    await certificateController.deleteRevokeCertificate(req, res);
    expect(sunbirdRegistryService.searchCertificate).toHaveBeenCalledWith('RevokedVC', filters, req.header("Authorization"))
});

test('should push message to kafka and respond with 200 if endDate is not null while deleting revokedCertificate', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            revokedCertificateId: '1'
        },
        body: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };

    const kafkaProducer = {
        send: jest.fn(),
        connect: jest.fn()
    }
    jest.spyOn(res, 'status');
    jest.spyOn(kafkaProducer, 'send');
    jest.spyOn(sunbirdRegistryService, 'searchCertificate').mockReturnValue([{osid: 'abc', endDate: '2022-09-09T09:09:09.098Z'}]);
    await certificateController.deleteRevokeCertificate(req, res, kafkaProducer);
    expect(kafkaProducer.send).toHaveBeenCalledWith({
        topic:'vc-remove-suspension',
        messages: [
            {key: null, value: JSON.stringify({revokedCertificateOsId: 'c', token: '1'})}
        ]}
    );
    expect(res.status).toHaveBeenCalledWith(200)
});

test('should respond with 400 if endDate is null while deleting revokedCertificate', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            revokedCertificateId: '1'
        },
        body: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };


    jest.spyOn(res, 'status');
    jest.spyOn(sunbirdRegistryService, 'searchCertificate').mockReturnValue([{osid: 'abc'}]);
    await certificateController.deleteRevokeCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(400)
});

test('should respond with 400 if revoked certificate entry is not found in revocation list table', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            revokedCertificateId: '1'
        },
        body: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };


    jest.spyOn(res, 'status');
    jest.spyOn(sunbirdRegistryService, 'searchCertificate').mockReturnValue([]);
    await certificateController.deleteRevokeCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(400)
});

test('should respond with 500 if sunbird throws error while searching for entry in revocation table', async() => {
    const req = {
        params: {
            entityName: 'Dummy',
            revokedCertificateId: '1'
        },
        body: {
            entityName: 'Dummy',
            certificateId: '1'
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };


    jest.spyOn(res, 'status');
    jest.spyOn(sunbirdRegistryService, 'searchCertificate').mockImplementation(() => Promise.reject(new Error('some problem')));
    await certificateController.deleteRevokeCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(500)
});

test('should call sunbird to check if certificate is valid during verification', async() => {
    const req = {
        body: {
            evidence: {
                type: 'Dummy',
                certificateId: '1'
            }
        },
        header: jest.fn().mockReturnValue('1')
    };
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
    const response = await sunbirdRegistryService.verifyCertificate.mockImplementation(() => { return {verified: false} })
    await certificateController.verifyCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(406);
});

test('should check if certificate is revoked if signature is verified', async() => {
    const req = {
        body: {
            evidence: {
                type: 'Dummy',
                certificateId: '1'
            }
        },
        header: jest.fn().mockReturnValue('1')
    };
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
    const response = await sunbirdRegistryService.verifyCertificate.mockImplementation(() => { return {verified: true} })
    jest.spyOn(sunbirdRegistryService, 'searchCertificateWithoutToken').mockReturnValue([{}])
    await certificateController.verifyCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    jest.spyOn(sunbirdRegistryService, 'searchCertificateWithoutToken').mockReturnValue([])
    await certificateController.verifyCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should throw error if sunbird verification flow throws an error', async() => {
    const req = {
        body: {
            evidence: {
                type: 'Dummy',
                certificateId: '1'
            }
        },
        header: jest.fn().mockReturnValue('1')
    };
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    jest.spyOn(res, 'status');
    const response = await sunbirdRegistryService.verifyCertificate.mockImplementation(() => Promise.reject(new Error('some problem')))
    await certificateController.verifyCertificate(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});
