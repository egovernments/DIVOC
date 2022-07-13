const certifyConfig = require('../../configs/config');
const axios = require('axios');

//TODO: Remove this hardcoded token after issuer invite is added and get token from incoming request
axios.interceptors.request.use(function (config) {
    config.headers.Authorization = certifyConfig.SUNBIRD_REGISTRY_TOKEN;
    return config;
});

const createCertificate = (certificateRequest, entityType) => {
    return axios.post(
        certifyConfig.SUNBIRD_REGISTRY_URL + "/api/v1/" + entityType,
        certificateRequest
    ).then(res => res.data)
};

const createSchema = (schemaName, schema) => {
    const schemaRequest = {
        name:  schemaName,
        schema: schema,
    };

    return axios.post(
        certifyConfig.SUNBIRD_REGISTRY_URL + "/api/v1/Schema",
        schemaRequest
    ).then(res => res.data)
};

module.exports = {
    createSchema,
    createCertificate
}