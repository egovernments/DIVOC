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
    const getEntityResp = {"schema":"{\n    \"$schema\": \"http://json-schema.org/draft-07/schema\",\n \"type\": \"object\",\n \"properties\": {\n \"TrainingCertificateA\": {\n \"$ref\": \"#/definitions/TrainingCertificateA\"\n }\n },\n \"required\": [\n \"TrainingCertificateA\"\n ],\n \"title\": \"TrainingCertificateA\",\n \"definitions\": {\n \"TrainingCertificateA\": {\n \"type\": \"object\",\n \"title\": \"NHAUIP Certificates\",\n \"required\": [\n \"name\",\n \"organisation\",\n \"email\",\n \"courseName\",\n \"issuer\",\n \"issuanceDate\"\n ],\n \"properties\": {\n \"name\": {\n \"type\": \"string\"\n },\n \"issuer\": {\n \"type\": \"string\"\n },\n \"organisation\": {\n \"type\": \"string\"\n },\n \"email\": {\n \"type\": \"string\"\n },\n \"mobileNo\": {\n \"type\": \"string\"\n },\n \"courseName\": {\n \"type\": \"string\"\n },\n \"issuanceDate\": {\n \"type\": \"string\"\n },\n \"courseStartDate\": {\n \"type\": \"string\"\n },\n \"courseEndDate\": {\n \"type\": \"string\"\n }\n }\n }\n },\n \"_osConfig\": {\n \"uniqueIndexFields\": [],\n \"ownershipAttributes\": [],\n \"roles\": [],\n \"inviteRoles\": [\n \"anonymous\"\n ],\n \"enableLogin\": false,\n \"credentialTemplate\": {\n \"@context\": [\n \"https://www.w3.org/2018/credentials/v1\",\n \"http://vc-management-service:7655/vc-management/v1/context/2a485328-47fa-48be-94cf-68acca8f4dc3\"\n ],\n \"type\": [\n \"VerifiableCredential\",\n \"ProofOfTraining\"\n ],\n \"credentialSubject\": {\n \"type\": \"Person\",\n \"name\": \"{{name}}\",\n          \"email\": \"{{email}}\",\n          \"mobileNo\": \"{{mobileNo}}\"\n        },\n        \"issuer\": \"{{{issuer}}}\",\n        \"issuanceDate\": \"{{issuanceDate}}\",\n        \"evidence\": {\n          \"type\": \"TrainingCertificateA\",\n          \"organisation\": \"{{organisation}}\",\n          \"courseName\": \"{{courseName}}\",\n          \"courseStartDate\": \"{{courseStartDate}}\",\n          \"courseEndDate\": \"{{courseEndDate}}\"\n          \n        },\n        \"nonTransferable\": \"true\"\n      },\n      \"certificateTemplates\": {\n        \"html\": \"minio://Tenant/e1005413-8c47-41b5-b5a8-c555ce65f85a/templates/documents/0d86bb17-b163-4faa-99d3-fd4495e20b96-TrainingSvgTemplate.svg\"\n      }\n    }\n  }"};
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
    const getEntityResp = {"schema":"{\n    \"$schema\": \"http://json-schema.org/draft-07/schema\",\n \"type\": \"object\",\n \"properties\": {\n \"TrainingCertificateA\": {\n \"$ref\": \"#/definitions/TrainingCertificateA\"\n }\n },\n \"required\": [\n \"TrainingCertificateA\"\n ],\n \"title\": \"TrainingCertificateA\",\n \"definitions\": {\n \"TrainingCertificateA\": {\n \"type\": \"object\",\n \"title\": \"NHAUIP Certificates\",\n \"required\": [\n \"name\",\n \"organisation\",\n \"email\",\n \"courseName\",\n \"issuer\",\n \"issuanceDate\"\n ],\n \"properties\": {\n \"name\": {\n \"type\": \"string\"\n },\n \"issuer\": {\n \"type\": \"string\"\n },\n \"organisation\": {\n \"type\": \"string\"\n },\n \"email\": {\n \"type\": \"string\"\n },\n \"mobileNo\": {\n \"type\": \"string\"\n },\n \"courseName\": {\n \"type\": \"string\"\n },\n \"issuanceDate\": {\n \"type\": \"string\"\n },\n \"courseStartDate\": {\n \"type\": \"string\"\n },\n \"courseEndDate\": {\n \"type\": \"string\"\n }\n }\n }\n },\n \"_osConfig\": {\n \"uniqueIndexFields\": [],\n \"ownershipAttributes\": [],\n \"roles\": [],\n \"inviteRoles\": [\n \"anonymous\"\n ],\n \"enableLogin\": false,\n \"credentialTemplate\": {\n \"@context\": [\n \"https://www.w3.org/2018/credentials/v1\",\n \"http://vc-management-service:7655/vc-management/v1/context/2a485328-47fa-48be-94cf-68acca8f4dc3\"\n ],\n \"type\": [\n \"VerifiableCredential\",\n \"ProofOfTraining\"\n ],\n \"credentialSubject\": {\n \"type\": \"Person\",\n \"name\": \"{{name}}\",\n          \"email\": \"{{email}}\",\n          \"mobileNo\": \"{{mobileNo}}\"\n        },\n        \"issuer\": \"{{{issuer}}}\",\n        \"issuanceDate\": \"{{issuanceDate}}\",\n        \"evidence\": {\n          \"type\": \"TrainingCertificateA\",\n          \"organisation\": \"{{organisation}}\",\n          \"courseName\": \"{{courseName}}\",\n          \"courseStartDate\": \"{{courseStartDate}}\",\n          \"courseEndDate\": \"{{courseEndDate}}\"\n          \n        },\n        \"nonTransferable\": \"true\"\n      },\n      \"certificateTemplates\": {\n        \"html\": \"minio://Tenant/e1005413-8c47-41b5-b5a8-c555ce65f85a/templates/documents/0d86bb17-b163-4faa-99d3-fd4495e20b96-TrainingSvgTemplate.svg\"\n      }\n    }\n  }"};
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