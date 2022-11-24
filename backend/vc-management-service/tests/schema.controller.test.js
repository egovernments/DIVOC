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
    jest.spyOn(sunbirdRegistryService, 'getEntity').mockReturnValue({url: '/vc-management/v1/schema/123'});
    await schemaController.getSchema(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should update schema template urls', async () => {
    const schemaId = jest.fn().mockReturnValue('123');
    const token = jest.fn().mockReturnValue('token');
    const urlMap = '';
    const getEntityResp = {"schema":"{\n    \"$schema\": \"http://json-schema.org/draft-07/schema\",\n \"type\": \"object\",\n \"properties\": {\n \"TrainingCertificateA\": {\n \"$ref\": \"#/definitions/TrainingCertificateA\"\n }\n },\n \"required\": [\n \"TrainingCertificateA\"\n ],\n \"title\": \"TrainingCertificateA\",\n \"definitions\": {\n \"TrainingCertificateA\": {\n \"type\": \"object\",\n \"title\": \"NHAUIP Certificates\",\n \"required\": [\n \"name\",\n \"organisation\",\n \"email\",\n \"courseName\",\n \"issuer\",\n \"issuanceDate\"\n ],\n \"properties\": {\n \"name\": {\n \"type\": \"string\"\n },\n \"issuer\": {\n \"type\": \"string\"\n },\n \"organisation\": {\n \"type\": \"string\"\n },\n \"email\": {\n \"type\": \"string\"\n },\n \"mobileNo\": {\n \"type\": \"string\"\n },\n \"courseName\": {\n \"type\": \"string\"\n },\n \"issuanceDate\": {\n \"type\": \"string\"\n },\n \"courseStartDate\": {\n \"type\": \"string\"\n },\n \"courseEndDate\": {\n \"type\": \"string\"\n }\n }\n }\n },\n \"_osConfig\": {\n \"uniqueIndexFields\": [],\n \"ownershipAttributes\": [],\n \"roles\": [],\n \"inviteRoles\": [\n \"anonymous\"\n ],\n \"enableLogin\": false,\n \"credentialTemplate\": {\n \"@context\": [\n \"https://www.w3.org/2018/credentials/v1\",\n \"http://vc-management-service:7655/vc-management/v1/context/2a485328-47fa-48be-94cf-68acca8f4dc3\"\n ],\n \"type\": [\n \"VerifiableCredential\",\n \"ProofOfTraining\"\n ],\n \"credentialSubject\": {\n \"type\": \"Person\",\n \"name\": \"{{name}}\",\n          \"email\": \"{{email}}\",\n          \"mobileNo\": \"{{mobileNo}}\"\n        },\n        \"issuer\": \"{{{issuer}}}\",\n        \"issuanceDate\": \"{{issuanceDate}}\",\n        \"evidence\": {\n          \"type\": \"TrainingCertificateA\",\n          \"organisation\": \"{{organisation}}\",\n          \"courseName\": \"{{courseName}}\",\n          \"courseStartDate\": \"{{courseStartDate}}\",\n          \"courseEndDate\": \"{{courseEndDate}}\"\n          \n        },\n        \"nonTransferable\": \"true\"\n      },\n      \"certificateTemplates\": {\n        \"html\": \"minio://Tenant/e1005413-8c47-41b5-b5a8-c555ce65f85a/templates/documents/0d86bb17-b163-4faa-99d3-fd4495e20b96-TrainingSvgTemplate.svg\"\n      }\n    }\n  }"};
    jest.spyOn(sunbirdRegistryService, 'getEntity').mockReturnValue(getEntityResp);
    jest.spyOn(sunbirdRegistryService, 'updateEntity').mockReturnValue('entityUpdated');
    const response = await schemaUtils.updateSchemaTemplateUrls(urlMap, schemaId, token);
    expect(response).toEqual('entityUpdated');
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
            templateKey: "html"
        },
        header: jest.fn().mockReturnValue('header')
    };
    formData.append('files', req.file.buffer, {filename: req.file.originalname});
    const schemaId = req.params.schemaId;
    const token = jest.fn().mockReturnValue('token');
    const urlMap = '';
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
        "uploadTemplateResponse": {
            "documentLocations": [
                "dummy"
            ],
            "errors": []
        }
    };
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(utils, 'getFormData').mockReturnValue(formData);
    jest.spyOn(sunbirdRegistryService, 'uploadTemplate').mockReturnValue(registryResp);
    jest.spyOn(sunbirdRegistryService, 'getEntity').mockReturnValue(getEntityResp);
    jest.spyOn(sunbirdRegistryService, 'updateEntity').mockReturnValue('entityUpdated');
    const response = await schemaUtils.updateSchemaTemplateUrls(urlMap, schemaId, token);
    expect(response).toEqual('entityUpdated');
    await schemaController.updateTemplate(req, res);
    // expect(res.status).toHaveBeenCalledWith(200);
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
    const schemaId = jest.fn().mockReturnValue('123');
    const token = jest.fn().mockReturnValue('token');
    const urlMap = '';
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
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(sunbirdRegistryService, 'getEntity').mockReturnValue(getEntityResp);
    jest.spyOn(sunbirdRegistryService, 'updateEntity').mockReturnValue('entityUpdated');
    const response = await schemaUtils.updateSchemaTemplateUrls(urlMap, schemaId, token);
    expect(response).toEqual('entityUpdated');
    await schemaController.updateTemplateUrls(req,res);
    expect(res.status).toHaveBeenCalledWith(200);
});
