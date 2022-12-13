const sunbirdRegistryService = require('../services/sunbird.service')
const {getFormData} = require("../utils/utils");
const {TENANT_NAME,MINIO_REGISTRY_BUCKET,IS_MINIO,MINIO_PORT,MINIO_URL,MINIO_USESSL,MINIO_ACCESSKEY,MINIO_SECRETKEY} = require("../configs/config");
const {MINIO_URL_SCHEME, SUNBIRD_SCHEMA_ADD_URL, SUNBIRD_SCHEMA_UPDATE_URL, SUNBIRD_GET_SCHEMA_URL} = require("../configs/constants");
const {CustomError} = require("../models/error");
const {addMandatoryFields, validateSchema, updateSchemaTemplateUrls} = require('../utils/schema.utils')
const minio = require('minio');

let minioClient;
(async function() {
    try {
        let minioOptions = {
            endPoint: MINIO_URL,
            useSSL: MINIO_USESSL,
            accessKey: MINIO_ACCESSKEY,
            secretKey:MINIO_SECRETKEY
        }
        if(IS_MINIO) {
            minioOptions = {
                port: parseInt(MINIO_PORT),
                ...minioOptions
            }
        }
        minioClient = new minio.Client(minioOptions);
    } catch(err) {
        console.error(err);
    }
})();


async function createSchema(req, res) {
    try {
        const token = req.header("Authorization");
        await validateSchema(req.body)
        var schemaRequest = addMandatoryFields(req.body);
        const schemaAddResponse = await sunbirdRegistryService.createEntity(SUNBIRD_SCHEMA_ADD_URL, schemaRequest, token);
        res.status(200).json({
            message: "Successfully created Schema",
            schemaAddResponse: schemaAddResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || err?.status || 500).json({
            message: err?.response?.data || err?.message
        });
    }
}

async function getSchema(req, res) {
    try {
        const token = req.header("Authorization");
        const schemaId = req.params.schemaId;
        let url = SUNBIRD_GET_SCHEMA_URL.replace(':schemaId', schemaId ? schemaId : '');
        const schemaResponse = await sunbirdRegistryService.getEntity(url, token);
        let schemas = schemaId ? [schemaResponse] : schemaResponse
        res.status(200).json({
            schemas: schemas
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || err?.status || 500).json({
            message: err?.response?.data || err?.message
        });
    }
}

async function updateSchema(req, res) {
    try {
        const schemaId = req.params.schemaId;
        const token = req.header("Authorization");
        var schemaRequest = addMandatoryFields(req.body);
        let url = SUNBIRD_SCHEMA_UPDATE_URL.replace(':schemaId', schemaId);
        const schemaUpdateResponse = await sunbirdRegistryService.updateEntity(url, schemaRequest, token);
        res.status(200).json({
            message: "Successfully updated Schema",
            schemaUpdateResponse: schemaUpdateResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || err?.status || 500).json({
            message: err?.response?.data || err?.message
        });
    }
}

async function updateTemplate(req, res) {
    try {
        const schemaId = req.params.schemaId;
        const templateKey = req.query.templateKey || "html";
        const token = req.header("Authorization");
        const formData = getFormData(req);
        const uploadTemplateResponse = await sunbirdRegistryService.uploadTemplate(
            formData,
            TENANT_NAME,
            token
        );
        const uploadUrl = MINIO_URL_SCHEME + uploadTemplateResponse?.documentLocations[0];
        let urlUpdates = {[templateKey]: uploadUrl};
        const templateUpdateResponse = await updateSchemaTemplateUrls(urlUpdates, schemaId, token);
        res.status(200).json({
            message: "Successfully updated Schema",
            templateUpdateResponse: templateUpdateResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || err?.status || 500).json({
            message: err?.response?.data || err?.message
        });
    }
}

async function updateTemplateUrls(req, res) {
    try {
        const schemaId = req.params.schemaId;
        const token = req.header("Authorization");
        const urlUpdates = req.body;
        const templateUpdateResponse = await updateSchemaTemplateUrls(urlUpdates, schemaId, token);
        res.status(200).json({
            message: "Successfully updated Schema with template URLs",
            templateUpdateResponse: templateUpdateResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || err?.status || 500).json({
            message: err?.response?.data || err?.message
        });
    }
}
 async function previewSchema(req,res){
    try {
        const token = req.header("Authorization");
        const {credentialTemplate, data, template} = req.body;
        const createCertReq = {
            credentialTemplate: credentialTemplate,
            data : data
        }
        console.log("Create certificate request: ",createCertReq);
        const createCertResp = await sunbirdRegistryService.createCertBySigner(createCertReq,token);
        console.log("Signed certificate: ",createCertResp);
        let templateSignedUrl = await minioClient.presignedGetObject(MINIO_REGISTRY_BUCKET, template, 24*60*60);
        console.log("templateSignedUrl : ",templateSignedUrl)
        const getCertReq = {
            certificate: JSON.stringify(createCertResp),
            templateUrl: templateSignedUrl
        }
        const acceptType = "application/pdf"
        const getCert = await sunbirdRegistryService.getCertByApi(getCertReq,token,acceptType);
        getCert.data.pipe(res);
    }catch (err){
        console.error(err);
        res.status(err?.response?.status || err?.status || 500).json({
            message: err?.response?.data || err?.message || err
        });
    }
 }

module.exports = {
    createSchema,
    getSchema,
    updateSchema,
    updateTemplate,
    updateTemplateUrls,
    previewSchema
}
