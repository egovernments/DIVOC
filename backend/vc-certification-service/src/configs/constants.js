const config = require('./config');

const SUNBIRD_CERTIFICATE_URL = `${config.SUNBIRD_REGISTRY_URL}/api/v1/`;
const SVG_ACCEPT_HEADER = "image/svg+xml";
const IMAGE_RESPONSE_TYPE = 'svg';

module.exports = {
    SUNBIRD_CERTIFICATE_URL,
    SVG_ACCEPT_HEADER,
    IMAGE_RESPONSE_TYPE
}
