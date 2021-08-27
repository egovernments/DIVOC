const publicKeyPem = process.env.CERTIFICATE_PUBLIC_KEY || '8LdaHAemmG4VdbQYGjLsc4Uy73wMP988VXLtMLBuTiBn';
// eslint-disable-next-line max-len
const privateKeyPem = process.env.CERTIFICATE_PRIVATE_KEY || '55qYEzVfvhfvp2NebeRstWQR5id2Ns67ye9m8oaQHcaa5Lk3rHsH1trUifUMihgrv6jFW2tsFXUwRbdUYGrjzQC';


const smsAuthKey = "";
module.exports = {
  publicKeyPem,
  privateKeyPem,
  smsAuthKey
};

/*
// openssl genrsa -out key.pem; cat key.pem;
// openssl rsa -in key.pem -pubout -out pubkey.pem;
// cat pubkey.pem; rm key.pem pubkey.pem
*/