const config = require('./config/config');
const axios = require('axios');

const saveCertificate = (certificate) => {
  const certificateRequest = {
    id:  "open-saber.registry.create",
    ver: "1.0",
    ets: "",
    "request":{
      "VaccinationCertificate": certificate

    }
  };

  return axios.post(
    config.REGISTRY_URL + "/add",
    certificateRequest
  )
};

module.exports = {
  saveCertificate
};
