const axios = require("axios");
const constants = require('../configs/constants');

const revokeCertificate = (certificateRequest, token) => {
    return axios.post(`${constants.VC_CERTIFICATION_SERVICE_REVOKE_URL}`, certificateRequest, {headers: {Authorization: token}})
        .then(res => res.data).catch(error => {
            console.error("Error in revoking certificate in vc-certification-service", error);
            throw error;
        });
};

module.exports={
    revokeCertificate
}