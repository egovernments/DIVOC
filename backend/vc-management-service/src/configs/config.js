const SUNBIRD_REGISTRY_URL = process.env.SUNBIRD_REGISTRY_URL;
const MINIO_URL = process.env.MINIO_URL;
const MINIO_PORT = process.env.MINIO_PORT;
const MINIO_ACCESSKEY = process.env.MINIO_ACCESSKEY;
const MINIO_SECRETKEY = process.env.MINIO_SECRETKEY;
const MINIO_USESSL = process.env.MINIO_USESSL === "true";
const MINIO_REGION = process.env.MINIO_REGION;
const REDIS_URL = process.env.REDIS_URL;
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';
const PORT = process.env.PORT || 7655;
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'sunbird-rc';
const JWT_PUBLIC_KEY = process.env.AUTH_PUBLIC_KEY;
const BASE_URL = process.env.VC_MANAGEMENT_SERVICE_BASE_URL || '/vc-management/';
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT || 10000;
const TENANT_NAME = process.env.TENANT_NAME || 'Tenant';

module.exports = {
    SUNBIRD_REGISTRY_URL,
    MINIO_URL,
    MINIO_PORT,
    MINIO_ACCESSKEY,
    MINIO_SECRETKEY,
    MINIO_USESSL,
    MINIO_REGION,
    REDIS_URL,
    REDIS_ENABLED,
    PORT,
    KEYCLOAK_URL,
    KEYCLOAK_REALM,
    JWT_PUBLIC_KEY,
    BASE_URL,
    REQUEST_TIMEOUT,
    TENANT_NAME
}
