const sunbirdRegistryService = require('../src/services/sunbird.service');
const certificateController = require('../src/controllers/certificate.controller');
jest.mock('../src/services/sunbird.service', () => {
    return {
        updateCertificate: jest.fn().mockReturnValue((a,b,c,d) => Promise.resolve('abc')),
        createCertificate: jest.fn()
    }
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
})