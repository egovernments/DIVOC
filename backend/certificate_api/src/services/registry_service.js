const config = require('../../configs/config');
const axios = require('axios');
const VaccinationCertificate = "VaccinationCertificate";
const TestCertificate = "TestCertificate";

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

const getCertificateByPreEnrollmentCode = (preEnrollmentCode) => {
    const certificateRequest = {
        id:  "open-saber.registry.search",
        ver: "1.0",
        ets: "",
        "request":{
            "entityType": [VaccinationCertificate],
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
    ).then(res => res.data.result[VaccinationCertificate])
};

const getTestCertificateByPreEnrollmentCode = (preEnrollmentCode) => {
    const certificateRequest = {
        id:  "open-saber.registry.search",
        ver: "1.0",
        ets: "",
        "request":{
            "entityType": [TestCertificate],
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
    ).then(res => res.data.result[TestCertificate])
};

module.exports = {
    getCertificate,
    getCertificateByPreEnrollmentCode,
    getTestCertificateByPreEnrollmentCode
};
