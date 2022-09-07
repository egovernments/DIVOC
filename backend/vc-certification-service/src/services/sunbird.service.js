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

const getCertificateForUpdate = (entityName, certificateId, token) => {

    return axios.get(`${certifyConstants.SUNBIRD_CERTIFICATE_URL}${entityName}/${certificateId}`, 
        {headers: {Authorization: token}}
    ).catch(error => {
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
};
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

const revokeCertificate = (body, token) => {
    return axios.post(`${certifyConstants.SUNBIRD_CERTIFICATE_URL}RevokedVC`, body, {headers: {Authorization: token}})
        .then(res => res.data)
        .catch(error => {
            console.error("Error in revoking certificate : ", error);
            throw error;
        });
}

const searchCertificate = (entityType, filters, token) => {
    return axios.post(`${certifyConstants.SUNBIRD_CERTIFICATE_URL}${entityType}/search`, filters, {headers: {Authorization: token}})
        .then(res => res.data)
        .catch(err => {
            console.error(err);
            throw err;
        })
}

const deleteExpiredSuspensions = (token, kafkaProducer) => {
    
    const requestBody = {
        "filters": {
            "endDate": {
                "lt": new Date()
            }
        },
        "offset": 0,
        "fields": ["osid"]
    }
    
    searchCertificate("RevokedVC", requestBody, token)
    .then(async(results) => {
        await kafkaProducer.connect();
        for (i = 0; i < results.length; i++) {
            kafkaProducer.send({
                topic: certifyConstants.VC_REMOVE_SUSPENSION_TOPIC,
                messages: [
                    { key: null, value: JSON.stringify({  suspendOsId: results[i].osid,token: token }) }
                ]
            });
        }       
    })
};

module.exports = {
    createCertificate,
    getCertificate,
    updateCertificate,
    deleteCertificate,
    getCertificateForUpdate,
    revokeCertificate,
    deleteExpiredSuspensions,
    searchCertificate
}
