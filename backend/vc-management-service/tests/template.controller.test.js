beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

const templateController = require('../src/controllers/template.controller');
const utils = require('../src/utils/utils');
const sunbirdRegistryService = require('../src/services/sunbird.service');
const FormData = require('form-data');
var formData = new FormData();

 jest.mock('../src/utils/utils', () => {
    return {
        getFormData: jest.fn(),
        isValidTenantName: jest.fn()
    }
 });
 jest.mock('../src/services/sunbird.service', () => {
    return {
        uploadTemplate: jest.fn()
    }
});

test('should upload template successfully', async () => {
    const req = {
        baseUrl: '/vc-management/v1/templates/tenant',
        file: {
            buffer: '123',
            originalname: 'template.html'
        },
        params: {tenant: 'Tenant'},
        header: jest.fn().mockReturnValue('1')
    }
    formData.append('files', req.file.buffer, {filename: req.file.originalname})
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    const registryResp = {
        "uploadTemplateResponse": {
            "documentLocations": [
                "dummy"
            ],
            "errors": []
        }
    }
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(utils, 'getFormData').mockReturnValue(formData);
    jest.spyOn(utils, 'isValidTenantName').mockReturnValue(true);
    jest.spyOn(sunbirdRegistryService, 'uploadTemplate').mockReturnValue(registryResp);
    await templateController.uploadTemplate(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should not upload template if tenant name is not valid', async () => {
    jest.resetModules();
    const req = {
        baseUrl: '/vc-management/v1/templates/tenant',
        file: {
            buffer: '123',
            originalname: 'template.html'
        },
        params: {tenant: 'Tenant'},
        header: jest.fn().mockReturnValue('1')
    }
    formData.append('files', req.file.buffer, {filename: req.file.originalname})
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    const registryResp = {
        "uploadTemplateResponse": {
            "documentLocations": [
                "dummy"
            ],
            "errors": []
        }
    }
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(utils, 'getFormData').mockReturnValue(formData);
    jest.spyOn(utils, 'isValidTenantName').mockReturnValue(false);
    jest.spyOn(sunbirdRegistryService, 'uploadTemplate').mockReturnValue(registryResp);
    await templateController.uploadTemplate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
});