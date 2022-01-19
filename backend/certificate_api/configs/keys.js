const publicKeyPem = process.env.CERTIFICATE_PUBLIC_KEY;
// eslint-disable-next-line max-len
const privateKeyPem = process.env.CERTIFICATE_PRIVATE_KEY ;
const euPublicKeyP8 = process.env.EU_CERTIFICATE_PUBLIC_KEY ;

const euPrivateKeyPem = process.env.EU_CERTIFICATE_PRIVATE_KEY;
const shcPrivateKeyPem = process.env.SHC_CERTIFICATE_PRIVATE_KEY;

const smsAuthKey = "";
module.exports = {
  publicKeyPem,
  privateKeyPem,
  euPublicKeyP8,
  euPrivateKeyPem,
  smsAuthKey,
  shcPrivateKeyPem
};

/*
// openssl genrsa -out key.pem; cat key.pem;
// openssl rsa -in key.pem -pubout -out pubkey.pem;
// cat pubkey.pem; rm key.pem pubkey.pem
*/