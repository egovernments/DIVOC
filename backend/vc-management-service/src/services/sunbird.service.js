const axios = require('axios');

const constants = require('../configs/constants');
const config = require('../configs/config');

const createTenant = async (tenantRequest) => {
    return axios.post(constants.SUNBIRD_TENANT_INVITE_URL, tenantRequest).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    })
}

const createEntity = async (url, schemaRequest, token) => {
    return axios.post(url, schemaRequest, { headers: {Authorization: token}}).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    });
}

const updateSchema = async (schemaRequest, token, schemaId) => {
    let url = constants.SUNBIRD_SCHEMA_UPDATE_URL.replace(':schemaId', schemaId)
    return axios.put(url, schemaRequest, { headers: {Authorization: token}}).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    });
}

const getSchema = async (token, schemaId) => {
    let url = constants.SUNBIRD_GET_SCHEMA_URL.replace(':schemaId', schemaId ? schemaId : '');
    return axios.get(url, { headers: {Authorization: token}}).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    });
}

const uploadTemplate = async(formData, tenant, token) => {
    const headers = getHeaders(formData, token);
    try {
        const tenantId = await getTenantId(token);
        let url = constants.SUNBIRD_TEMPLATE_UPLOAD_URL
                    .replace(':tenantName', tenant)
                    .replace(':tenantId', tenantId);
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

const getTenantId = async(token) => {
    const url = config.SUNBIRD_REGISTRY_URL + "/api/v1/Tenant"
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

const getTransaction = async (transactionId, token) => {
    console.log({transctionUrl: constants.SUNBIRD_GET_TRANSACTION_URL, 
                transactionId: transactionId});
    const transactionRequest = {
        "filters": {
            "transactionId": {
                "eq": transactionId
            }
        }
    };
    return axios.post(constants.SUNBIRD_GET_TRANSACTION_URL, transactionRequest ,{headers:{Authorization: token}})
            .then(res => res.data)
            .catch(error => {
                console.error(error);
                throw error;
            });
}
const getContext = async (osid, token) => {
    return axios.get(`${constants.MINIO_CONTEXT_URL}/${osid}` ,{headers:{Authorization: token}})
            .then(res => res.data)
            .catch(error => {
                console.error(error);
                throw error;
            });
}
const updateContext = async (osid,updateRequest, token ) => {
    let url = constants.MINIO_UPDATE_CONTEXT_URL.replace(':osid', osid);
    return axios.put(url, updateRequest, { headers: {Authorization: token}}).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    });
}

module.exports = {
    createTenant,
    createEntity,
    uploadTemplate,
    updateSchema,
    updateContext,
    getSchema,
    getTransaction,
    getContext
}
