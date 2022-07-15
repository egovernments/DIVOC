const config = require('./config');

const SUNBIRD_ISSUER_INVITE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Issuer/invite`;
const SUNBIRD_SCHEMA_ADD_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema`;

module.exports = {
    SUNBIRD_ISSUER_INVITE_URL,
    SUNBIRD_SCHEMA_ADD_URL
}
