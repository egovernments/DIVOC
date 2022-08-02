const config = require('./config');

const SUNBIRD_TRANSACTION_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/`;
const STORED_ENTITY_TYPE = "TransactionOsidMap";
module.exports = {
    SUNBIRD_TRANSACTION_URL,
    STORED_ENTITY_TYPE
}
