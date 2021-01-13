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
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.mofw.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Bhaya Mitra\",\"gender\":\"Male\",\"age\":27,\"nationality\":\"Indian\"},\"issuer\":\"https://nha.gov.in/\",\"issuanceDate\":\"2021-01-11T04:36:58.948Z\",\"evidence\":[{\"id\":\"https://nha.gov.in/evidence/vaccine/undefined\",\"feedbackUrl\":\"https://divoc.xiv.in/feedback/undefined\",\"infoUrl\":\"https://divoc.xiv.in/learn/undefined\",\"type\":[\"Vaccination\"],\"batch\":\"MB3428BX\",\"vaccine\":\"CoVax\",\"manufacturer\":\"COVPharma\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"verifier\":{\"name\":\"Sooraj Singh\"},\"facility\":{\"name\":\"ABC Medical Center\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"Bengaluru\",\"addressRegion\":\"Karnataka\",\"addressCountry\":\"IN\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"http://purl.org/dc/terms/created\":{\"type\":\"http://www.w3.org/2001/XMLSchema#dateTime\",\"@value\":\"2021-01-11T04:37:00Z\"},\"https://w3id.org/security#jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..k2AUoe1yMoXq4z_MgevWF4NKOGyLw8SqF4yOXMMfmy44Bx2Qe_6A9IrnD4ltytk0R0Cc0blJ0TjQp86mhDN9QDpg83hJmTJCzDygLIuFQZKTv-Qf1VYXitlcSvTsb_ezmOE_w8gia229EIRHv02vA2A7m1om5KypxQYet0wIHrYVTBwQ6RYNMKGCrEax6K-6A8-A6t_aup_8YaOiz_4Uh2esU7y1aFpiEmFRXsQ0i6i44keQLaX4IejazffdXy5yJ4myfHCNUCHYiWD7el06I_ibk7n0hxyO6yBdP3ARRymBlHpIOPbR8AJkI_VRbAHoBtUgfVv68nCdb4kLe9rDwg\",\"https://w3id.org/security#proofPurpose\":{\"id\":\"https://w3id.org/security#assertionMethod\"},\"https://w3id.org/security#verificationMethod\":{\"id\":\"did:india\"}}}";
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

test('Signed json to include certificate id', async () => {
    const certificateId = "123";
    sign = await signJSON(transformW3(cert2, certificateId));
    expect(sign.credentialSubject.id).toBe(cert2.recipient.identity);
    expect(sign.evidence[0].id).toBe("https://nha.gov.in/evidence/vaccine/" + certificateId);
    expect(sign.evidence[0].certificateId).toBe(certificateId);
});