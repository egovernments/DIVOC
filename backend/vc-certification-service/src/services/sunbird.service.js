const customAxios = require('../utils/axios.custom');
const certifyConstants = require('../configs/constants');

const createCertificate = (certificateRequest, entityType) => {
    return customAxios.post(`${certifyConstants.SUNBIRD_CERTIFY_URL}${entityType}`, certificateRequest).then(res => res.data).catch(error => {
        console.log(error);
    })
};

module.exports = {
    createCertificate
}
