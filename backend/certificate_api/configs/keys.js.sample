const publicKeyPem = process.env.CERTIFICATE_PUBLIC_KEY || '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEftkMDoidplcHjVwxbggb8/xdXJQX2S1hib34pFzu1EyifUNAAhcQCQOEkbjaiLSps4GGF+pH4t1GD3rAf3F67g==\n-----END PUBLIC KEY-----\n';
// eslint-disable-next-line max-len
const privateKeyPem = process.env.CERTIFICATE_PRIVATE_KEY || '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIDMzz0wbs+8IB3EC7ymiwevUyeA0NQyWCaX2A6k3s/y5oAoGCCqGSM49AwEHoUQDQgAEftkMDoidplcHjVwxbggb8/xdXJQX2S1hib34pFzu1EyifUNAAhcQCQOEkbjaiLSps4GGF+pH4t1GD3rAf3F67g==\n-----END EC PRIVATE KEY-----\n';
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