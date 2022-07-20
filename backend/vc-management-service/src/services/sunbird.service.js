const axios = require('axios');

const constants = require('../configs/constants');

const createIssuer = async (issuerRequest) => {
    return axios.post(constants.SUNBIRD_ISSUER_INVITE_URL, issuerRequest).then((res) => {
        res.data
    }).catch(error => {
        console.error(error);
        throw error;
    })
}

const createSchema = async (schemaRequest, token) => {
    return axios.post(constants.SUNBIRD_SCHEMA_ADD_URL, schemaRequest, { headers: {Authorization: token}}).then(res => res.data).catch(error => {
        console.error(error);
        throw error;
    });
}

module.exports = {
    createIssuer,
    createSchema
}