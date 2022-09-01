const config = require('./config');

const SUNBIRD_TRANSACTION_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/`;
const TRANSACTION_ENTITY_TYPE = "TransactionCertificateMap";

module.exports = {
    SUNBIRD_TRANSACTION_URL,
    TRANSACTION_ENTITY_TYPE
}
