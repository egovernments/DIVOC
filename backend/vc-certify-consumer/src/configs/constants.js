const config = require('./config');

const SUNBIRD_TRANSACTION_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/`;
const TRANSACTION_ENTITY_TYPE = "TransactionCertificateMap";
const VC_CERTIFICATION_SERVICE_URL = `${config.VC_CERTIFICATION_SERVICE_URL}/v1/certificate/revoke`;

module.exports = {
    SUNBIRD_TRANSACTION_URL,
    TRANSACTION_ENTITY_TYPE,
    VC_CERTIFICATION_SERVICE_URL
}
