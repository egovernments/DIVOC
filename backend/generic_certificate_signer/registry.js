const axios = require('axios').default;

const save = (certificate, registryUrl, registryCertificateSchema) => {
    const certificateRequest = {
        id:  "open-saber.registry.create",
        ver: "1.0",
        ets: "",
        "request":{
            [registryCertificateSchema]: certificate
        }
    };
    return axios.post(registryUrl + 'add', certificateRequest)
}

module.exports = {
    save
}