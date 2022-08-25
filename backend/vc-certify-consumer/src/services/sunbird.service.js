const axios = require("axios");
const constants = require('../configs/constants');

const createCertificate = (certificateRequest, entityType, token) => {
    return axios.post(`${constants.SUNBIRD_TRANSACTION_URL}${entityType}`, certificateRequest, {headers: {Authorization: token}})
        .then(res => res.data).catch(error => {
            console.error("Error in creating certificate within sunbird-rc", error);
            throw error;
        });
};

module.exports={
    createCertificate
}