const { KeyType } = require('certificate-signer-library/signer');
const publicKeyPem = process.env.CERTIFICATE_PUBLIC_KEY;
// eslint-disable-next-line max-len
const signingKeyType = process.env.SIGNING_KEY_TYPE || KeyType.RSA;
const privateKeyPem = process.env.CERTIFICATE_PRIVATE_KEY ;
const smsAuthKey = "";
module.exports = {
  publicKeyPem,
  privateKeyPem,
  smsAuthKey,
  signingKeyType
};

/*
// openssl genrsa -out key.pem; cat key.pem;
// openssl rsa -in key.pem -pubout -out pubkey.pem;
// cat pubkey.pem; rm key.pem pubkey.pem
*/