const {signJSON, transformW3, customLoader} = require('../signer');
const jsigs = require('jsonld-signatures');
const {RSAKeyPair} = require('crypto-ld');
const {RsaSignature2018} = jsigs.suites;

const cert2 = {
  "preEnrollmentCode": "12346",
  "recipient": {
    "name": "Bhaya Mitra",
    "dob": "1994-11-30",
    "gender": "Male",
    "nationality": "Indian",
    "identity": "did:in.gov.uidai.aadhaar:2342343334",
    "contact": ["tel:9880414888"]
  },
  "vaccination": {
    "name": "CoVax",
    "batch": "MB3428BX",
    "manufacturer": "COVPharma",
    "date": "2020-12-02T19:21:18.646Z",
    "effectiveStart": "2020-12-02",
    "effectiveUntil": "2025-12-02"
  },
  "vaccinator": {
    "name": "Sooraj Singh"
  },
  "facility": {
    "name": "ABC Medical Center",
    "address": {
      "addressLine1": "123, Koramangala",
      "addressLine2": "",
      "district": "Bengaluru South",
      "city": "Bengaluru",
      "state": "Karnataka",
      "pin": 560034
    }
  }
};

signJSON(transformW3(cert2))
  .then(d => {
    console.log(d)
  });

test('Sign the json', async () => {
  sign = await signJSON(transformW3(cert2));
  console.log(JSON.stringify(sign))
  expect(sign).not.toBe(null);
});

test('Verify the signed json', async () => {
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://www.who.int/2020/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:11111111111\",\"name\":\"Pramod K Varma\",\"gender\":\"Male\",\"age\":23,\"nationality\":\"Indian\"},\"evidence\":[{\"id\":\"https://nha.gov.in/evidence/vaccine/1234\",\"type\":[\"Vaccination\"],\"batch\":\"BXO2342JP\",\"manufacturer\":\"COVPharma\",\"date\":\"2021-01-01T12:23:24Z\",\"effectiveStart\":\"2021-01-01T12:23:24Z\",\"effectiveUntil\":\"2025-01-01T12:23:24Z\",\"verifier\":{\"id\":\"https://nha.gov.in/evidence/vaccinator/3223\",\"name\":\"John Doe\",\"sign-image\":\"...\"},\"facility\":{\"id\":\"https://nha.gov.in/evidence/facilities/4545\",\"name\":\"ABC Hospital\",\"address\":{\"streetAddress\":\"#12, Some Rd\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"Bengaluru\",\"addressRegion\":\"Karnataka\",\"addressCountry\":\"IN\",\"postalCode\":\"560034\"},\"seal-image\":\"...\"}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"http://purl.org/dc/terms/created\":{\"type\":\"http://www.w3.org/2001/XMLSchema#dateTime\",\"@value\":\"2020-12-15T16:26:44Z\"},\"https://w3id.org/security#jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..GowGNYJk4KjBBEZjTU4I6-_qPAUbP2XDKORM5fyEk2onBi_6mMl8cgKnfsUMDzRJ9Z9nGR8JF6uP9YDsUypeeuDW_Mv70ky33v4Eatp17WRv7_I-pi59XdKthiwRqsc3x50-kqYF0e0p2ymFZwt3XcJnMXlxqa3GVkD-WkeuFdNpMwK_0cphEe41Y1kqBJ9rWN8R7QmDTOfgdR92t76RLRZcQMiltkZvtU_NYhZx0I-EOiY6fhsBoEDf0Yizri5w1-cO81oAFydsy9U5a32S_EMjk0U-PfzQJ8fcWNtTmYKgeqtmyJAjrndaYR1dEessF8S84liIoRqkoE87X3RCow\",\"https://w3id.org/security#proofPurpose\":{\"id\":\"https://w3id.org/security#assertionMethod\"},\"https://w3id.org/security#verificationMethod\":{\"id\":\"did:india\"}}}";
  const {publicKeyPem} = require('../config/keys');
  const publicKey = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: 'did:india',
    type: 'RsaVerificationKey2018',
    controller: 'https://example.com/i/india',
    publicKeyPem
  };
  const controller = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: 'https://example.com/i/india',
    publicKey: [publicKey],
    // this authorizes this key to be used for making assertions
    assertionMethod: [publicKey.id]
  };
  const key = new RSAKeyPair({...publicKey});
  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({controller}),
    documentLoader: customLoader
  });
  console.log(result);
  expect(result.verified).toBe(true)
});