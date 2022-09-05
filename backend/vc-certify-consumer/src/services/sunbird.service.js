const axios = require("axios");
const constants = require('../configs/constants');

const createCertificate = (certificateRequest, entityType, token) => {
    return axios.post(`${constants.SUNBIRD_TRANSACTION_URL}${entityType}`, certificateRequest, {headers: {Authorization: token}})
        .then(res => res.data).catch(error => {
            console.error("Error in creating certificate within sunbird-rc", error);
            throw error;
        });
};

const addTransaction = (transactionEntityReq, token) => {
    return axios.post(`${constants.SUNBIRD_TRANSACTION_URL}${constants.TRANSACTION_ENTITY_TYPE}`, transactionEntityReq, {headers: {Authorization: token}})
        .then(res => res.data).catch(error => {
            console.error("Error while adding transaction: ", error);
            throw error;
        })
}
const deleteCertificate = (entityName, entityId, token) => {
    console.log(`${certifyConstants.SUNBIRD_CERTIFICATE_URL}${entityName}/${entityId}`)
    return axios.delete(`${certifyConstants.SUNBIRD_CERTIFICATE_URL}${entityName}/${entityId}`,
                    {headers: {Authorization: token}}
        ).then(res => res.data)
        .catch(err => {
            console.error("Error in deleting certificate : ", err);
            throw err;
        });
};
module.exports={
    createCertificate,
    addTransaction,
    deleteCertificate
}