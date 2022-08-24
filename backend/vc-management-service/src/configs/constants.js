const config = require('./config');

const SUNBIRD_TENANT_INVITE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Tenant/invite`;
const SUNBIRD_SCHEMA_ADD_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema`;
const SUNBIRD_SCHEMA_UPDATE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema/:schemaId`;
const SUNBIRD_TEMPLATE_UPLOAD_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/:tenantName/:tenantId/templates/documents`
const SUNBIRD_GET_SCHEMA_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema/:schemaId`
const MINIO_URL_SCHEME = "minio://"
const SUNBIRD_GET_TRANSACTION_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/TransactionOsidMap/search`;

module.exports = {
    SUNBIRD_TENANT_INVITE_URL,
    SUNBIRD_SCHEMA_ADD_URL,
    SUNBIRD_TEMPLATE_UPLOAD_URL,
    SUNBIRD_SCHEMA_UPDATE_URL,
    SUNBIRD_GET_SCHEMA_URL,
    MINIO_URL_SCHEME,
    SUNBIRD_GET_TRANSACTION_URL
}
