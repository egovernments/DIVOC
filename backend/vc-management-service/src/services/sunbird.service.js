const axios = require('axios');

const constants = require('../configs/constants');
const customAxios = require('../utils/axios.custom');
const config = require('../configs/config');

const createIssuer = async (issuerRequest) => {
    return axios.post(constants.SUNBIRD_ISSUER_INVITE_URL, issuerRequest).then((res) => {
        res.data
    }).catch(error => {
        console.log(error);
    })
}

const createSchema = async (schemaRequest) => {
    return customAxios.post(constants.SUNBIRD_SCHEMA_ADD_URL, schemaRequest).then(res => res.data).catch(error => {
        console.log(error);
    })
}

const uploadTemplate = async(formData, issuer, headers) => {
    const issuerId = await getIssuerId();
    const url = constants.SUNBIRD_TEMPLATE_UPLOAD_URL
                    .replace(':issuerId', issuerId)
                    .replace(':issuerName', issuer);
    return customAxios.post(url, formData, headers)
            .then(res => res.data)
            .catch(error => {
                console.log(error);
            });
}

const getIssuerId = async() => {
    const url = config.SUNBIRD_REGISTRY_URL + "/api/v1/Issuer"
    return customAxios.get(url)
            .then(res => {
                return res.data[0].osid.substring(2);
            })
            .catch(error => {
                console.error('ERROR : ' + error);
            });
}

module.exports = {
    createIssuer,
    createSchema,
    uploadTemplate,
}
