const {signJSON, transformW3} = require('../signer');
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
  expect(sign).not.toBe(null);
});

test('Verify the signed json', async () => {
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://www.who.int/2020/credentials/vaccination/v1\"],\"credentialSubject\":{\"gender\":\"Male\",\"id\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Bhaya Mitra\",\"nationality\":\"Indian\",\"type\":\"Person\"},\"evidence\":[{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"facility\":{\"address\":{\"addressCountry\":\"IN\",\"addressRegion\":\"Karnataka\",\"district\":\"Bengaluru South\",\"streetAddress\":\"123, Koramangala\"},\"name\":\"ABC Medical Center\"},\"id\":\"https://nha.gov.in/evidence/vaccine/1234\",\"manufacturer\":\"COVPharma\",\"type\":[\"Vaccination\"],\"verifier\":{\"name\":\"Sooraj Singh\"}}],\"issuanceDate\":\"2020-12-15t13:29:48.902z\",\"issuer\":\"https://nha.gov.in/\",\"nonTransferable\":\"true\",\"proof\":{\"http://purl.org/dc/terms/created\":{\"@value\":\"2020-12-15T13:29:48Z\",\"type\":\"http://www.w3.org/2001/XMLSchema#dateTime\"},\"https://w3id.org/security#jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..uM8rtWe9z5ewU2fZMVudVLO5Vzsx8AqiPaSRoMpA0kNjCwXyNGtaYu1dBow8eyPdTqOSICVXQhOHZ59anIqNg5sfuc7rUbBz0gQIFCDtHQu2xYntsicEVXohSGcYeZbd14yeOfVmu6htzWCDHxpf2uPTki3o4tHduNG1_UeoO_DpCnQJ1MKhIRtM7FSgNIOGLkCsBZPCarZBs8fsaPHxZuq6rCSCW_rYqG7-_N_SG_8oD5m74Bz91h2l7eyyrZlKf5r0e1E-qnfRrUg4Q9BR-m43vTh3fvlnJjlxGuyXs7B3Q-KDVazSt1_91IlEC14AoHSdCHd5jdXviiiaXryL3g\",\"https://w3id.org/security#proofPurpose\":{\"id\":\"https://w3id.org/security#assertionMethod\"},\"type\":\"RsaSignature2018\"},\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"]}";
  const {publicKey} = require('../config/keys');
  const key = new RSAKeyPair({...publicKey});
  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: AssertionProofPurpose
  });
  console.log(result)
});