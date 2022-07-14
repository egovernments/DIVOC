const certifyConfig = require('../../configs/config');
const axios = require('axios');

const createCertificate = (certificateRequest, entityType, config) => {
    return axios.post(
        certifyConfig.SUNBIRD_REGISTRY_URL + "/api/v1/" + entityType,
        certificateRequest,
        config
    ).then(res => res.data)
};

module.exports = {
    createSchema,
    createCertificate
}