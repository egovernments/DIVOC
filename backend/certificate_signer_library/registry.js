const axios = require('axios');

let registryCertificateSchema = '';
let regisryURL = '';

const initRegistry = (registryUrl, registrySchema) => {
  registryCertificateSchema = registrySchema;
  regisryURL = registryUrl
};

const saveCertificate = (certificate) => {
  const certificateRequest = {
    id:  "open-saber.registry.create",
    ver: "1.0",
    ets: "",
    "request":{
      [registryCertificateSchema]: certificate

    }
  };

  return axios.post(
      regisryURL + "/add",
    certificateRequest
  )
};

module.exports = {
  saveCertificate,
  initRegistry
};
