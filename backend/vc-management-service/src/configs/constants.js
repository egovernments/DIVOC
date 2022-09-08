const config = require('./config');

const SUNBIRD_TENANT_INVITE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Tenant/invite`;
const SUNBIRD_SCHEMA_ADD_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema`;
const SUNBIRD_SCHEMA_UPDATE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema/:schemaId`;
const SUNBIRD_TEMPLATE_UPLOAD_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/:tenantName/:tenantId/templates/documents`
const SUNBIRD_GET_SCHEMA_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/Schema/:schemaId`
const MINIO_URL_SCHEME = "minio://"
const SUNBIRD_GET_TRANSACTION_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/TransactionCertificateMap/search`;
const MANDATORY_FIELDS = ["issuer", "issuanceDate"];
const MANDATORY_EVIDENCE_FIELDS = ["validFrom", "validUntil" , "certificateId"];
const ROLE_SUFFIX = '-realm-role';
const MINIO_BUCKET_NAME = 'contexts';
const MINIO_CONTEXT_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/ContextURL`;
const MINIO_UPDATE_CONTEXT_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/ContextURL/:osid`;
const SUNBIRD_SSO_CLIENT = process.env.SUNBIRD_SSO_CLIENT || 'admin-api';
const SUNBIRD_SSO_ADMIN_CLIENT_SECRET = process.env.SUNBIRD_SSO_ADMIN_CLIENT_SECRET || '0358fa30-6014-4192-9551-7c61b15b774c';
module.exports = {
    SUNBIRD_TENANT_INVITE_URL,
    SUNBIRD_SCHEMA_ADD_URL,
    SUNBIRD_TEMPLATE_UPLOAD_URL,
    SUNBIRD_SCHEMA_UPDATE_URL,
    SUNBIRD_GET_SCHEMA_URL,
    MINIO_URL_SCHEME,
    SUNBIRD_GET_TRANSACTION_URL,
    MANDATORY_FIELDS,
    MANDATORY_EVIDENCE_FIELDS,
    ROLE_SUFFIX,
    MINIO_BUCKET_NAME,
    MINIO_CONTEXT_URL,
    MINIO_UPDATE_CONTEXT_URL,
    SUNBIRD_SSO_CLIENT,
    SUNBIRD_SSO_ADMIN_CLIENT_SECRET
}
