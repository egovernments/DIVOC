const axios = require('axios');

const constants = require('../configs/constants');
const customAxios = require('../utils/axios.custom');

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

const uploadTemplate = async(formData, issuer, issuerId, headers) => {
    const url = constants.SUNBIRD_TEMPLATE_UPLOAD_URL
                    .replace(':issuerId', issuerId)
                    .replace(':issuerName', issuer);
    return customAxios.post(url, formData, headers)
            .then(res => res.data)
            .catch(error => {
                console.log(error);
            });
}

module.exports = {
    createIssuer,
    createSchema,
    uploadTemplate
}
