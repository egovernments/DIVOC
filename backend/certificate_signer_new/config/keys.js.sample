const { KeyType } = require('certificate-signer-library/signer');
const publicKeyPem = process.env.CERTIFICATE_PUBLIC_KEY || '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnXQalrgztecTpc+INjRQ8s73FSE1kU5QSlwBdICCVJBUKiuQUt7s+Z5epgCvLVAOCbP1mm5lV7bfgV/iYWDio7lzX4MlJwDedWLiufr3Ajq+79CQiqPaIbZTo0i13zijKtX7wgxQ78wT/HkJRLkFpmGeK3za21tEfttytkhmJYlwaDTEc+Kx3RJqVhVh/dfwJGeuV4Xc/e2NH++ht0ENGuTk44KpQ+pwQVqtW7lmbDZQJoOJ7HYmmoKGJ0qt2hrj15uwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZfv2AZZ9/7Y+igshzfB0reIFdUKw3cdVTzfv5FNrIqN5pwIDAQAB\n-----END PUBLIC KEY-----\n';
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