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

  axios.post(
    config.REGISTRY_URL + "/add",
    certificateRequest
  ).then(res => {
    console.log(`statusCode: ${res.status}`);
    console.log(res)
  })
    .catch(error => {
      console.error(error)
    })
};

module.exports = {
  saveCertificate
};