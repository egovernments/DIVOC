const config = require('./config');

const SUNBIRD_CERTIFICATE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/`;
const SVG_ACCEPT_HEADER = "image/svg+xml";
const IMAGE_RESPONSE_TYPE = 'svg';
const VC_CERTIFY_TOPIC = process.env.VC_CERTIFY_TOPIC || 'vc-certify';
const REVOKED_ENTITY_TYPE = "RevokedVC";
module.exports = {
    SUNBIRD_CERTIFICATE_URL,
    SVG_ACCEPT_HEADER,
    IMAGE_RESPONSE_TYPE,
    VC_CERTIFY_TOPIC,
    REVOKED_ENTITY_TYPE
}
