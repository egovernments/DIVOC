const config = require('./config');

const SUNBIRD_ISSUER_INVITE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Issuer/invite`;
const SUNBIRD_SCHEMA_ADD_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema`;
const SUNBIRD_SCHEMA_UPDATE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema/:schemaId`;
const SUNBIRD_TEMPLATE_UPLOAD_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/:issuerName/:issuerId/templates/documents`
const SUNBIRD_GET_SCHEMA_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema/:schemaId`
const MINIO_URL_SCHEME = "minio://"

module.exports = {
    SUNBIRD_ISSUER_INVITE_URL,
    SUNBIRD_SCHEMA_ADD_URL,
    SUNBIRD_TEMPLATE_UPLOAD_URL,
    SUNBIRD_SCHEMA_UPDATE_URL,
    SUNBIRD_GET_SCHEMA_URL,
    MINIO_URL_SCHEME
}
