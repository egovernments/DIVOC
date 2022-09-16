const sunbirdRegistryService = require('../services/sunbird.service')
const {getFormData} = require("../utils/utils");
const {TENANT_NAME} = require("../configs/config");
const {MINIO_URL_SCHEME, MANDATORY_FIELDS, MANDATORY_EVIDENCE_FIELDS, SUNBIRD_SCHEMA_ADD_URL, SUNBIRD_SCHEMA_UPDATE_URL, SUNBIRD_GET_SCHEMA_URL} = require("../configs/constants");
const axios = require("axios");
const {CustomError} = require("../models/error");

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
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
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
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
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
        const templateUpdateResponse = await updateSchemaTemplateUrls(urlUpdates, schemaId, token);
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

async function updateSchemaTemplateUrls(urlMap, schemaId, token) {
    let url = SUNBIRD_GET_SCHEMA_URL.replace(':schemaId', schemaId ? schemaId : '');
    const getSchemaResponse = await sunbirdRegistryService.getEntity(url, token);
    let schema = JSON.parse(getSchemaResponse?.schema);
    if (schema?._osConfig) {
        if (!schema._osConfig.certificateTemplates) {
            schema._osConfig.certificateTemplates = {};
        }
        for (const key in urlMap) {
            schema._osConfig.certificateTemplates[key] = urlMap[key];
        }
    }
    const schemaString = JSON.stringify(schema);
    const updateSchemaRequestBody = {"schema": schemaString};
    return await sunbirdRegistryService.updateEntity(url, updateSchemaRequestBody, token);
}

function addMandatoryFields(schemaRequest) {
    const mandatoryFields = MANDATORY_FIELDS;
    const mandatoryEvidenceFields = MANDATORY_EVIDENCE_FIELDS;
    const schemaName = schemaRequest.name;
    const schemaUnparsed = schemaRequest.schema;
    const schema = JSON.parse(schemaUnparsed);
    if (schema._osConfig.credentialTemplate) {
        let totalMandatoryFields = [...new Set([...mandatoryFields, ...mandatoryEvidenceFields])]

        let reqFields = schema.definitions[schemaName].required;
        addInRequiredFields(reqFields, totalMandatoryFields)

        let properties = schema.definitions[schemaName].properties;
        addInProperties(properties, totalMandatoryFields)

        let credTemp = schema._osConfig.credentialTemplate;
        addInCredentialTemplate(credTemp, mandatoryFields, mandatoryEvidenceFields)
    }

    return {
        "name": schemaName,
        "schema": JSON.stringify(schema)
    };
}

function validateEvidence(vcEvidence) {
    if (vcEvidence) {
        vcEvidence = Array.isArray(vcEvidence) ? vcEvidence[0] : vcEvidence;
    } else {
        throw new CustomError("evidence not available in VC", 400).error();
    }
}

function validateEvidenceType(vcEvidenceType, schemaName) {
    if (vcEvidenceType) {
        if ((Array.isArray(vcEvidenceType) && !vcEvidenceType.includes(schemaName)) || (!Array.isArray(vcEvidenceType) && (vcEvidenceType !== schemaName))) {
            throw new CustomError("evidence type doesn't match with schema", 400).error();
        }
    } else {
        throw new CustomError("evidence doesn't have a valid type", 400).error();
    }
}

async function validateSchema(schemaRequest) {
    const schemaName = schemaRequest.name;
    const schemaUnparsed = schemaRequest.schema;
    const schema = JSON.parse(schemaUnparsed);

    if (schema._osConfig.credentialTemplate) {
        try {
            let vcEvidence = schema._osConfig.credentialTemplate.evidence;
            validateEvidence(vcEvidence);
            validateEvidenceType(vcEvidence.type, schemaName);
            await checkInContextsForEvidenceType(schema._osConfig.credentialTemplate, schemaName)
        } catch (err) {
            throw err;
        }
    }
}

async function checkInContextsForEvidenceType(credentialTemplate, schemaName) {
    if (credentialTemplate && credentialTemplate["@context"]) {
        for (let i = 0; i < credentialTemplate["@context"].length; i++) {
            let context;
            await axios.get(credentialTemplate["@context"][i])
                .then(res => { context = res.data })
                .catch(err => {
                    console.error(err);
                    throw err;
                });
            if (context["@context"].hasOwnProperty(schemaName)) {
                return
            }
        }
        throw new CustomError("evidence type isn't defined in any context", 400).error();
    }
    throw new CustomError("context is not available", 400).error();
}

function addInRequiredFields(reqFields, totalMandatoryFields){
    for (let field of totalMandatoryFields) {
        if (!reqFields.includes(field)) {
            reqFields.push(field);
        }
    }
}

function addInProperties(properties, totalMandatoryFields){
    for (let field of totalMandatoryFields) {
        properties[field] = { ...properties[field], type : 'string'};
    }
}

function addInCredentialTemplate(credTemp, mandatoryFields, mandatoryEvidenceFields){
    for (let index = 0; index<mandatoryFields.length; index++) {
        if (!credTemp[mandatoryFields[index]]) {
            if(mandatoryFields[index] === "issuer") {
                credTemp[mandatoryFields[index]] = '{{{'+mandatoryFields[index]+'}}}';
            } else {
                credTemp[mandatoryFields[index]] = '{{'+mandatoryFields[index]+'}}';
            }
        }

    }
    for (let index = 0; index<mandatoryEvidenceFields.length; index++) {
        Array.isArray(credTemp.evidence) ?
            credTemp.evidence[0][mandatoryEvidenceFields[index]] = '{{'+mandatoryEvidenceFields[index]+'}}' :
            credTemp.evidence[mandatoryEvidenceFields[index]] = '{{'+mandatoryEvidenceFields[index]+'}}';
    }
}

module.exports = {
    createSchema,
    getSchema,
    updateSchema,
    updateTemplate,
    updateTemplateUrls
}
