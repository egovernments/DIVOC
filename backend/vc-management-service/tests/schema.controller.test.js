beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

const axios = require('axios');
jest.mock('axios');
const sunbirdRegistryService = require('../src/services/sunbird.service');
const schemaController = require('../src/controllers/schema.controller');
const schemaUtils = require('../src/utils/schema.utils');
const utils = require('../src/utils/utils');
const constants = require('../src/configs/constants');
const configs = require('../src/configs/config');
const { PassThrough } = require('stream');
const mockedStream = new PassThrough();
const FormData = require('form-data');
var formData = new FormData();
    

jest.mock('../src/services/sunbird.service', () => {
    return {
        createEntity: jest.fn(),
        getEntity: jest.fn(),
        updateEntity: jest.fn(),
        uploadTemplate: jest.fn()
    }
});

jest.mock('../src/utils/schema.utils', () => {
    return {
        addMandatoryFields: jest.fn(),
        updateSchemaTemplateUrls: jest.fn(),
        validateSchema: jest.fn()
    }
})

test('should create schema and add to registry', async () => {
    const req = {
        baseUrl: '/vc-management/v1/schema',
        header: jest.fn().mockReturnValue('header'),
        raw : 'schema body'
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
    jest.spyOn(res, 'json');
    jest.spyOn(schemaUtils, 'addMandatoryFields').mockReturnValue('fields added');
    jest.spyOn(sunbirdRegistryService, 'createEntity').mockImplementation( () => Promise.resolve(''));
    jest.spyOn(schemaUtils, 'validateSchema').mockImplementation( () => Promise.resolve('schema validated'));
    await schemaController.createSchema(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should not create schema and add to registry when sunbird services fails', async () => {
    const req = {
        baseUrl: '/vc-management/v1/schema',
        header: jest.fn().mockReturnValue('header'),
        raw : 'schema body'
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
    jest.spyOn(res, 'json');
    jest.spyOn(schemaUtils, 'addMandatoryFields').mockReturnValue('fields added');
    jest.spyOn(sunbirdRegistryService, 'createEntity').mockImplementation( () => Promise.reject('schema validated'));
    jest.spyOn(schemaUtils, 'validateSchema').mockImplementation( () => Promise.resolve('schema validated'));
    await schemaController.createSchema(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('should get schema from registry', async () => {
    const req = {
        baseUrl: '/vc-management/v1/schema',
        params: {
            schemaId: '123'
        },
        header: jest.fn().mockReturnValue('header')
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
    jest.spyOn(res, 'json');
    jest.spyOn(sunbirdRegistryService, 'getEntity').mockImplementation( () => Promise.resolve({url: '/vc-management/v1/schema/123'}));
    await schemaController.getSchema(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should not get schema from registry when sunbird services fails', async () => {
    const req = {
        baseUrl: '/vc-management/v1/schema',
        params: {
            
        },
        header: jest.fn().mockReturnValue('header')
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
    jest.spyOn(res, 'json');
    jest.spyOn(sunbirdRegistryService, 'getEntity').mockImplementation( () => Promise.reject({url: '/vc-management/v1/schema/123'}));
    await schemaController.getSchema(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('should update template', async () => {
    jest.resetModules();
    const req = {
        baseUrl: '/vc-management/v1/templates/tenant',
        file: {
            buffer: '123',
            originalname: 'template.html'
        },
        params: {
            schemaId: jest.fn().mockReturnValue('123')
        },
        query: {
            templateKey: ""
        },
        header: jest.fn().mockReturnValue('header')
    };
    formData.append('files', req.file.buffer, {filename: req.file.originalname});
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
        
            documentLocations: 
                ["dummy"]
            ,
            "errors": []
        
    };
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(utils, 'getFormData').mockReturnValue(formData);
    jest.spyOn(sunbirdRegistryService, 'uploadTemplate').mockImplementation((a, b, c) => Promise.resolve(registryResp));
    jest.spyOn(schemaUtils, 'updateSchemaTemplateUrls').mockImplementation((a, b, c) =>  Promise.resolve('updated'));
    await schemaController.updateTemplate(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should not  update template when sunbird services fails', async () => {
    jest.resetModules();
    const req = {
        baseUrl: '/vc-management/v1/templates/tenant',
        file: {
            buffer: '123',
            originalname: 'template.html'
        },
        params: {
            schemaId: jest.fn().mockReturnValue('123')
        },
        query: {
            templateKey: "html"
        },
        header: jest.fn().mockReturnValue('header')
    };
    formData.append('files', req.file.buffer, {filename: req.file.originalname});
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
        
            documentLocations: 
                ["dummy"]
            ,
            "errors": []
        
    };
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(utils, 'getFormData').mockReturnValue(formData);
    jest.spyOn(sunbirdRegistryService, 'uploadTemplate').mockImplementation((a, b, c) => Promise.reject(registryResp));
    jest.spyOn(schemaUtils, 'updateSchemaTemplateUrls').mockImplementation((a, b, c) =>  Promise.resolve('updated'));
    await schemaController.updateTemplate(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('should update template urls', async () => {
    jest.resetModules();
    const req = {
        baseUrl: '/vc-management/v1/tenant',
        params: {
            schemaId:'123'
        },
        header: jest.fn().mockReturnValue('header'),
        body: {}
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
    jest.spyOn(res, 'json');
    jest.spyOn(schemaUtils, 'updateSchemaTemplateUrls').mockImplementation((a,b,c) => Promise.resolve('updated template urls'));
    await schemaController.updateTemplateUrls(req,res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should not update template urls when sunbird services fails', async () => {
    jest.resetModules();
    const req = {
        baseUrl: '/vc-management/v1/tenant',
        params: {
            schemaId:'123'
        },
        header: jest.fn().mockReturnValue('header'),
        body: {}
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
    jest.spyOn(res, 'json');
    jest.spyOn(schemaUtils, 'updateSchemaTemplateUrls').mockImplementation((a,b,c) => Promise.reject('updated template urls'));
    await schemaController.updateTemplateUrls(req,res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('should update schema ', async () => {
    jest.resetModules();
    const req = {
        baseUrl: '/vc-management/v1/tenant',
        params: {
            schemaId:'123'
        },
        header: jest.fn().mockReturnValue('header'),
        body: {}
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
    jest.spyOn(res, 'json');
    jest.spyOn(schemaUtils, 'addMandatoryFields').mockReturnValue('added mandatory feilds');
    jest.spyOn(sunbirdRegistryService, 'updateEntity').mockImplementation((a,b,c) => Promise.resolve('updated entity'));
    await schemaController.updateSchema(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should not update schema when sunbird update entity fails', async () => {
    jest.resetModules();
    const req = {
        baseUrl: '/vc-management/v1/tenant',
        params: {
            schemaId:'123'
        },
        header: jest.fn().mockReturnValue('header'),
        body: {}
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
    jest.spyOn(res, 'json');
    jest.spyOn(schemaUtils, 'addMandatoryFields').mockReturnValue('added mandatory feilds');
    jest.spyOn(sunbirdRegistryService, 'updateEntity').mockImplementation((a,b,c) => Promise.reject('updated entity'));
    await schemaController.updateSchema(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});