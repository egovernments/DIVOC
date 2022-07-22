const sunbirdRegistryService = require('../src/services/sunbird.service');
const certificateController = require('../src/controllers/certificate.controller');
jest.mock('../src/services/sunbird.service', () => {
    return {
        updateCertificate: jest.fn(),
        createCertificate: jest.fn(),
        getCertificate: jest.fn()
    }
})

beforeEach(() => {
    console.log = jest.fn()
    console.error = jest.fn()
})

test('should call sunbird rc to update certificate', async() => {
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
    certificateController.updateCertificate(req, res)
    expect(sunbirdRegistryService.updateCertificate).toHaveBeenCalledWith(req.body, 'Dummy', '1', '1');
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
    certificateController.createCertificate(req, res);
    expect(sunbirdRegistryService.createCertificate).toHaveBeenCalledWith(req.body, 'Dummy', '1')
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
    expect(sunbirdRegistryService.getCertificate).toHaveBeenCalledWith('Dummy', '1', '1', '1')
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
