const sunbirdRegistryService = require('../services/sunbird.service');
const {getFormData, isValidTenantName} = require('../utils/utils');
const {TENANT_NAME,MINIO_REGISTRY_BUCKET,IS_MINIO,MINIO_PORT,MINIO_URL,MINIO_USESSL,MINIO_ACCESSKEY,MINIO_SECRETKEY} = require("../configs/config");
const { HTTP_URI_PREFIX, HTTPS_URI_PREFIX} = require("../configs/constants");
const minio = require('minio');
const axios = require('axios');

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


async function uploadTemplate(req, res) {
    try {
        const formData = getFormData(req);
        const isValidTenant = isValidTenantName(req.params.tenant);
        if(isValidTenant) {
            const uploadTemplateResponse = await sunbirdRegistryService.uploadTemplate(
                formData,
                req.params.tenant,
                req.header('Authorization')
            );
            console.log('Successfully uploaded template');
            res.status(200).json({
                message: uploadTemplateResponse.message,
                uploadTemplateResponse: uploadTemplateResponse
            });
            return;
        }
        res.status(400).json({
            message: "tenant invalid"
        })
    } catch(err) {
        console.error(err);
        res.status(err?.response?.status || err?.status || 500).json({
            message: err?.response?.data || err?.message
        });
    }
}

async function getTemplate(req, res) {
    const {template} = req.query;
    let templateSignedUrl = "";
    if (template.startsWith(HTTP_URI_PREFIX) || template.startsWith(HTTPS_URI_PREFIX)) {
        templateSignedUrl = template;
        const data = await axios.get(templateSignedUrl);
        res.status(200).json({
            htmlData: data.data
        });
        console.log("templateSignedUrl : ",templateSignedUrl)

    } else {
        templateSignedUrl = await minioClient.presignedGetObject(MINIO_REGISTRY_BUCKET, template?.split("://")[1], 24*60*60);
        console.log("templateSignedUrl : ",templateSignedUrl)
        const data = await sunbirdRegistryService.getTemplate(templateSignedUrl);
        res.status(200).json({
            htmlData: data.data
        });
    }
    return;
}
module.exports = {
    uploadTemplate,
    getTemplate
}