const keyUtils = require("../src/services/key_utils");

const testPrivateKeyPem = '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIOIKenY0HH15/RbGU/ASHjEKOBGHlUPETQBIVzVHt5VBoAoGCCqGSM49AwEHoUQDQgAEXH+Z6FInDkp4IEKxEzTY7c3WSX0CNEJiiNeuB2UEWNrSTGjcE1IdyqbGUNBhtN8wKQAttWtEaRVf9EQURk2nGw==\n-----END EC PRIVATE KEY-----\n';
const jwksPrivateJson = {
  kty: 'EC',
  kid: '6klOC9uply2_zr98QgFnBIn_jiG7aJ1646miENPFaeQ',
  use: 'sig',
  alg: 'ES256',
  x5c: [],
  crv: 'P-256',
  x: 'XH-Z6FInDkp4IEKxEzTY7c3WSX0CNEJiiNeuB2UEWNo',
  y: '0kxo3BNSHcqmxlDQYbTfMCkALbVrRGkVX_REFEZNpxs',
  d: '4gp6djQcfXn9FsZT8BIeMQo4EYeVQ8RNAEhXNUe3lUE'
};
const jwksPublicJson = {
  kty: 'EC',
  kid: '6klOC9uply2_zr98QgFnBIn_jiG7aJ1646miENPFaeQ',
  use: 'sig',
  alg: 'ES256',
  x5c: [],
  crv: 'P-256',
  x: 'XH-Z6FInDkp4IEKxEzTY7c3WSX0CNEJiiNeuB2UEWNo',
  y: '0kxo3BNSHcqmxlDQYbTfMCkALbVrRGkVX_REFEZNpxs'
}

test('convert pem format to jwks', async () => {
  const keyFile = keyUtils.PEMtoDER(testPrivateKeyPem)
  const keyPair = await keyUtils.DERtoJWK(keyFile, []);

  expect(keyPair.length).toEqual(2);
  expect(keyPair[0]).toEqual(jwksPrivateJson);
  expect(keyPair[1]).toEqual(jwksPublicJson);
})