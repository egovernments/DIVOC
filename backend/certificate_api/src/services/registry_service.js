const config = require('../../configs/config');
const axios = require('axios');
const VaccinationCertificate = "VaccinationCertificate";

const getCertificate = (mobileNumber, certificateId) => {
    const certificateRequest = {
        id:  "open-saber.registry.search",
        ver: "1.0",
        ets: "",
        "request":{
            "entityType": [VaccinationCertificate],
            "filters": {
                mobile: {
                    eq: mobileNumber
                },
                certificateId: {
                    eq: certificateId
                }
                
            }
        }
    };

    return axios.post(
        config.REGISTRY_URL + "/search",
        certificateRequest
    ).then(res => res.data.result[VaccinationCertificate])
};

module.exports = {
    getCertificate
};
