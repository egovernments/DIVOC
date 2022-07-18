const certifyConstants = require('../configs/constants');
const axios = require("axios");

const createCertificate = (certificateRequest, entityType) => {
    return axios.post(`${certifyConstants.SUNBIRD_CERTIFY_URL}${entityType}`, certificateRequest).then(res => res.data).catch(error => {
        console.log(error);
    })
};

module.exports = {
    createCertificate
}
