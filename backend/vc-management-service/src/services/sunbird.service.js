const axios = require('axios');

const constants = require('../configs/constants');
const config = require('../configs/config');

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

const uploadTemplate = async(formData, issuer, token) => {
    const headers = getHeaders(formData, token);
    const issuerId = await getIssuerId(token);
    const url = constants.SUNBIRD_TEMPLATE_UPLOAD_URL
                    .replace(':issuerId', issuerId)
                    .replace(':issuerName', issuer);
    return axios.post(url, formData, headers)
            .then(res => res.data)
            .catch(error => {
                console.log(error);
            });
}


function getHeaders(formData, token) {
    return {
        headers: {
            'Authorization': token,
            ...formData.getHeaders()
        }
    };
}

const getIssuerId = async(token) => {
    const url = config.SUNBIRD_REGISTRY_URL + "/api/v1/Issuer"
    return axios.get(url, {headers: {Authorization: token}})
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
