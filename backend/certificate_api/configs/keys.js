const publicKeyPem = process.env.CERTIFICATE_PUBLIC_KEY || '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEftkMDoidplcHjVwxbggb8/xdXJQX2S1hib34pFzu1EyifUNAAhcQCQOEkbjaiLSps4GGF+pH4t1GD3rAf3F67g==\n-----END PUBLIC KEY-----\n';
// eslint-disable-next-line max-len
const privateKeyPem = process.env.CERTIFICATE_PRIVATE_KEY || '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIDMzz0wbs+8IB3EC7ymiwevUyeA0NQyWCaX2A6k3s/y5oAoGCCqGSM49AwEHoUQDQgAEftkMDoidplcHjVwxbggb8/xdXJQX2S1hib34pFzu1EyifUNAAhcQCQOEkbjaiLSps4GGF+pH4t1GD3rAf3F67g==\n-----END EC PRIVATE KEY-----\n';
const euPublicKeyP8 = process.env.EU_CERTIFICATE_PUBLIC_KEY || '-----BEGIN CERTIFICATE-----\nMIIBYDCCAQYCEQCAG8uscdLb0ppaneNN5sB7MAoGCCqGSM49BAMCMDIxIzAhBgNVBAMMGk5hdGlvbmFsIENTQ0Egb2YgRnJpZXNsYW5kMQswCQYDVQQGEwJGUjAeFw0yMTA0MjcyMDQ3MDVaFw0yNjAzMTIyMDQ3MDVaMDYxJzAlBgNVBAMMHkRTQyBudW1iZXIgd29ya2VyIG9mIEZyaWVzbGFuZDELMAkGA1UEBhMCRlIwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARkJeqyO85dyR+UrQ5Ey8EdgLyf9NtsCrwORAj6T68/elL19aoISQDbzaNYJjdD77XdHtd+nFGTQVpB88wPTwgbMAoGCCqGSM49BAMCA0gAMEUCIQDvDacGFQO3tuATpoqf40CBv09nfglL3wh5wBwA1uA7lAIgZ4sOK2iaaTsFNqENAF7zi+d862ePRQ9Lwymr7XfwVm0=\n-----END CERTIFICATE-----\n';
const euPrivateKeyPem = process.env.EU_CERTIFICATE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgZgp3uylFeCIIXozbZkCkSNr4DcLDxplZ1ax/u7ndXqahRANCAARkJeqyO85dyR+UrQ5Ey8EdgLyf9NtsCrwORAj6T68/elL19aoISQDbzaNYJjdD77XdHtd+nFGTQVpB88wPTwgb\n-----END PRIVATE KEY-----\n';
const shcPrivateKeyPem = process.env.SHC_CERTIFICATE_PRIVATE_KEY || '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIDMzz0wbs+8IB3EC7ymiwevUyeA0NQyWCaX2A6k3s/y5oAoGCCqGSM49AwEHoUQDQgAEftkMDoidplcHjVwxbggb8/xdXJQX2S1hib34pFzu1EyifUNAAhcQCQOEkbjaiLSps4GGF+pH4t1GD3rAf3F67g==\n-----END EC PRIVATE KEY-----\n';

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