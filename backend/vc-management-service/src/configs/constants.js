const config = require('./config');

const SUNBIRD_ISSUER_INVITE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Issuer/invite`;
const SUNBIRD_SCHEMA_ADD_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema`;
const SUNBIRD_TEMPLATE_UPLOAD_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/:issuerName/:issuerId/templates/documents`
const SUNBIRD_GET_TRANSACTION_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/${config.STORED_ENTITY_TYPE}/search`;
module.exports = {
    SUNBIRD_ISSUER_INVITE_URL,
    SUNBIRD_SCHEMA_ADD_URL,
    SUNBIRD_TEMPLATE_UPLOAD_URL,
    SUNBIRD_GET_TRANSACTION_URL
}
