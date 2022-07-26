const sunbirdRegistryService = require('../services/sunbird.service')
const {getFormData} = require("../utils/utils");
const {ISSUER_NAME} = require("../configs/config");
const {MINIO_URL_SCHEME} = require("../configs/constants");

async function createSchema(req, res) {
    try {
        const token = req.header("Authorization");
        const schemaAddResponse = await sunbirdRegistryService.createSchema(req.body, token);
        res.status(200).json({
            message: "Successfully created Schema",
            schemaAddResponse: schemaAddResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

async function updateSchema(req, res) {
    try {
        const schemaId = req.params.schemaId;
        const token = req.header("Authorization");
        const schemaUpdateResponse = await sunbirdRegistryService.updateSchema(req.body, token, schemaId);
        res.status(200).json({
            message: "Successfully updated Schema",
            schemaUpdateResponse: schemaUpdateResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
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
            ISSUER_NAME,
            token
        );
        const uploadUrl = MINIO_URL_SCHEME + uploadTemplateResponse?.documentLocations[0];
        const getSchemaResponse = await sunbirdRegistryService.getSchema(token, schemaId);
        let schema = JSON.parse(getSchemaResponse?.schema);
        if (schema?._osConfig) {
            if (!schema._osConfig.certificateTemplates) {
                schema._osConfig.certificateTemplates = {};
            }
            schema._osConfig.certificateTemplates[templateKey] = uploadUrl;
        }
        const schemaString = JSON.stringify(schema);
        const updateSchemaRequestBody = {"schema": schemaString}
        const templateUpdateResponse = await sunbirdRegistryService.updateSchema(updateSchemaRequestBody, token, schemaId);
        res.status(200).json({
            message: "Successfully updated Schema",
            templateUpdateResponse: templateUpdateResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

async function updateTemplateUrls(req, res) {
    try {
        const schemaId = req.params.schemaId;
        const token = req.header("Authorization");
        const urlUpdates = req.body;
        const getSchemaResponse = await sunbirdRegistryService.getSchema(token, schemaId);
        let schema = JSON.parse(getSchemaResponse?.schema);
        if (schema?._osConfig) {
            if (!schema._osConfig.certificateTemplates) {
                schema._osConfig.certificateTemplates = {};
            }
            for (const key in urlUpdates) {
                schema._osConfig.certificateTemplates[key] = urlUpdates[key];
            }
        }
        const schemaString = JSON.stringify(schema);
        const updateSchemaRequestBody = {"schema": schemaString};
        const templateUpdateResponse = await sunbirdRegistryService.updateSchema(updateSchemaRequestBody, token, schemaId);
        res.status(200).json({
            message: "Successfully updated Schema with template URLs",
            templateUpdateResponse: templateUpdateResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

module.exports = {
    createSchema,
    updateSchema,
    updateTemplate,
    updateTemplateUrls
}
