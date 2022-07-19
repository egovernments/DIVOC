const certifyConstants = require('../configs/constants');
const axios = require("axios");
const stream = require("stream");

const createCertificate = (certificateRequest, entityType, token) => {
    return axios.post(`${certifyConstants.SUNBIRD_CERTIFY_URL}${entityType}`, certificateRequest, {headers: {Authorization: token}})
        .then(res => res.data).catch(error => {
            console.error("Error in creating certificate within sunbird-rc", error);
            throw error;
        });
};

const getCertificate = (entityName, certificateId, outputType, token) => {

    return axios.get(`${certifyConstants.SUNBIRD_CERTIFY_URL}${entityName}/${certificateId}`, {
        headers: {
            Authorization: token,
            Accept: outputType
        }
    }).then(res => {
        console.log("Response Object: ", res);
        return res.data;
    }).catch(error => {
        console.error("Error in downloading certificate: ", error);
        throw error;
    })

};

module.exports = {
    createCertificate,
    getCertificate
}
