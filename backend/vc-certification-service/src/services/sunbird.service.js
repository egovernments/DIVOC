const certifyConstants = require('../configs/constants');
const axios = require("axios");

const createCertificate = (certificateRequest, entityType, token) => {
    return axios.post(`${certifyConstants.SUNBIRD_CERTIFICATE_URL}${entityType}`, certificateRequest, {headers: {Authorization: token}})
        .then(res => res.data).catch(error => {
            console.error("Error in creating certificate within sunbird-rc", error);
            throw error;
        });
};

const getCertificate = (entityName, certificateId, headers) => {

    return axios.get(`${certifyConstants.SUNBIRD_CERTIFICATE_URL}${entityName}/${certificateId}`, {
        responseType: "stream",
        headers: headers
    }).catch(error => {
        console.error("Error in downloading certificate: ", error);
        throw error;
    })

};

const updateCertificate = (certificateRequestBody, entityName, entityId, token) => {
    return axios.put(`${certifyConstants.SUNBIRD_CERTIFICATE_URL}${entityName}/${entityId}`,
                    certificateRequestBody,
                    {headers: {Authorization: token}}
        ).then(res => res.data)
        .catch(err => {
            console.error("Error in updating certificate : ", err);
            throw err;
        });
}

module.exports = {
    createCertificate,
    getCertificate,
    updateCertificate
}
