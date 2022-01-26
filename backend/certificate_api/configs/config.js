const REGISTRY_URL = process.env.REGISTRY_URL || 'http://0.0.0.0:8081';
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'https://divoc.xiv.in/keycloak/auth';
const KEYCLOAK_REALM = 'divoc';
const JWT_PUBLIC_KEY = process.env.AUTH_PUBLIC_KEY;
const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092';
const DISEASE_CODE = process.env.DISEASE_CODE || 'COVID-19';
const PUBLIC_HEALTH_AUTHORITY = process.env.FHIR_PUBLIC_HEALTH_AUTHORITY || 'Govt Of India';
const EU_CERTIFICATE_EXPIRY = parseInt(process.env.EU_CERTIFICATE_EXPIRY) || 12;
const CERTIFICATE_ISSUER = process.env.CERTIFICATE_ISSUER || "https://divoc.dev";
const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379"
const REDIS_KEY_EXPIRE = process.env.REDIS_KEY_EXPIRE || 2 * 24 * 60 * 60; // in secs
const REDIS_ENABLED = process.env.REDIS_ENABLED || true
const ETCD_URL = process.env.ETCD_URL || 'etcd:2379';
module.exports = {
    REGISTRY_URL,
    JWT_PUBLIC_KEY,
    KAFKA_BOOTSTRAP_SERVER,
    KEYCLOAK_URL,
    KEYCLOAK_REALM,
    DISEASE_CODE,
    PUBLIC_HEALTH_AUTHORITY,
    EU_CERTIFICATE_EXPIRY,
    CERTIFICATE_ISSUER,
    REDIS_ENABLED,
    REDIS_URL,
    REDIS_KEY_EXPIRE,
    ETCD_URL
};