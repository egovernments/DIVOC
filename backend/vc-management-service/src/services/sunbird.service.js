const axios = require('axios');

const constants = require('../configs/constants');
const config = require('../configs/config');

const createIssuer = async (issuerRequest) => {
    return axios.post(constants.SUNBIRD_ISSUER_INVITE_URL, issuerRequest).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    })
}

const createSchema = async (schemaRequest, token) => {
    return axios.post(constants.SUNBIRD_SCHEMA_ADD_URL, schemaRequest, { headers: {Authorization: token}}).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    });
}

const uploadTemplate = async(formData, issuer, token) => {
    const headers = getHeaders(formData, token);
    try {
        const issuerId = await getIssuerId(token);
        let url = constants.SUNBIRD_TEMPLATE_UPLOAD_URL
                    .replace(':issuerName', issuer)
                    .replace(':issuerId', issuerId);
        return axios.post(url, formData, headers)
            .then(res => res.data)
            .catch(error => {
                console.error(error);
                return error;
            });
    } catch(err) {
        console.error(err);
        throw err;
    }
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
                try {
                    return res.data[0].osid.substring(2);
                } catch(err) {
                    throw new axios.AxiosError("Some error in uploading template", "BAD_REQUEST", undefined, null, {status: 400});
                }
            })
            .catch(error => {
                console.error('ERROR : ', error);
                throw error;
            });
}

module.exports = {
    createIssuer,
    createSchema,
    uploadTemplate,
}
