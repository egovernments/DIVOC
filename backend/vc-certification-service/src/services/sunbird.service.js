const certifyConstants = require('../configs/constants');
const axios = require("axios");

const createCertificate = (certificateRequest, entityType, token) => {
    return axios.post(`${certifyConstants.SUNBIRD_CERTIFY_URL}${entityType}`, certificateRequest, {headers: { Authorization: token }})
        .then(res => res.data).catch(error => {
        console.error("Error in creating certificate within sunbird-rc", error);
        throw error;
    });
};

module.exports = {
    createCertificate
}
