const SUNBIRD_REGISTRY_URL = process.env.SUNBIRD_REGISTRY_URL;
const PORT = process.env.PORT || 7655;
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'sunbird-rc';
const JWT_PUBLIC_KEY = process.env.AUTH_PUBLIC_KEY;
const BASE_URL = process.env.VC_MANAGEMENT_SERVICE_BASE_URL || '/vc-management/';
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT || 10000;
const TENANT_NAME = process.env.TENANT_NAME || 'Tenant';


module.exports = {
    SUNBIRD_REGISTRY_URL,
    PORT,
    KEYCLOAK_URL,
    KEYCLOAK_REALM,
    JWT_PUBLIC_KEY,
    BASE_URL,
    REQUEST_TIMEOUT,
    TENANT_NAME
}
