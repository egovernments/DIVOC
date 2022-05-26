const config = require('../../configs/config');
const axios = require('axios');

const getCertificate = (mobileNumber, certificateId, entityType) => {
    const certificateRequest = {
        id:  "open-saber.registry.search",
        ver: "1.0",
        ets: "",
        "request":{
            "entityType": [entityType],
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
    ).then(res => res.data.result[entityType])
};

const getCertificateByPreEnrollmentCode = (preEnrollmentCode, entityType) => {
    const certificateRequest = {
        id:  "open-saber.registry.search",
        ver: "1.0",
        ets: "",
        "request":{
            "entityType": [entityType],
            "filters": {
                preEnrollmentCode: {
                    eq: preEnrollmentCode
                }
            }
        }
    };

    return axios.post(
        config.REGISTRY_URL + "/search",
        certificateRequest
    ).then(res => res.data.result[entityType])
};

const getCertificateByPhno = (phoneno, entityType) => {
    const certificateRequest = {
        id: "open-saber.registry.search",
        ver: "1.0",
        ets: "",
        "request": {
            "entityType": [entityType],
            "filters": {
                mobile: {
                    eq: phoneno
                }
            }
        }
    };

    return axios.post(
        config.REGISTRY_URL + "/search",
        certificateRequest
    ).then(res => res.data.result[entityType])
}

const getTestCertificateByPreEnrollmentCode = (preEnrollmentCode, entityType) => {
    const certificateRequest = {
        id:  "open-saber.registry.search",
        ver: "1.0",
        ets: "",
        "request":{
            "entityType": [entityType],
            "filters": {
                preEnrollmentCode: {
                    eq: preEnrollmentCode
                }
            }
        }
    };

    return axios.post(
      config.REGISTRY_URL + "/search",
      certificateRequest
    ).then(res => res.data.result[entityType])
};

module.exports = {
    getCertificate,
    getCertificateByPhno,
    getCertificateByPreEnrollmentCode,
    getTestCertificateByPreEnrollmentCode
};
