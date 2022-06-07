const { KeyType } = require('certificate-signer-library/signer');
const signingKeyType = process.env.SIGNING_KEY_TYPE;
const publicKeyPem = process.env.CERTIFICATE_PUBLIC_KEY;
const privateKeyPem = process.env.CERTIFICATE_PRIVATE_KEY;

module.exports = {
    signingKeyType,
    publicKeyPem,
    privateKeyPem
}