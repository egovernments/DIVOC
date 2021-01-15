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
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Bhaya Mitra\",\"gender\":\"Male\",\"age\":27,\"nationality\":\"Indian\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"addressRegion\":\"Karnataka\",\"addressCountry\":\"IN\"}},\"issuer\":\"https://nha.gov.in/\",\"issuanceDate\":\"2021-01-06T08:31:25.574Z\",\"evidence\":[{\"id\":\"https://nha.gov.in/evidence/vaccine/123\",\"feedbackUrl\":\"https://divoc.xiv.in/feedback/123\",\"infoUrl\":\"https://divoc.xiv.in/learn/123\",\"type\":[\"Vaccination\"],\"batch\":\"MB3428BX\",\"vaccine\":\"CoVax\",\"manufacturer\":\"COVPharma\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"verifier\":{\"name\":\"Sooraj Singh\"},\"facility\":{\"name\":\"ABC Medical Center\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"Bengaluru\",\"addressRegion\":\"Karnataka\",\"addressCountry\":\"IN\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"http://purl.org/dc/terms/created\":{\"type\":\"http://www.w3.org/2001/XMLSchema#dateTime\",\"@value\":\"2021-01-15T04:31:12Z\"},\"https://w3id.org/security#jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..RlgHnGWxvKyZusSl6natEk_Nbz3RU1bqGMgyO8mpHDO_dolqB_1zpBv3ruy_PZNDUh1fWqht3vH8q8wSrf77ClS_FeQUPcIaKwrQzno7ZvoOPq3z7vtUlYzR67LSb173tH1h5BV2v2GPgOMW-fE4zXnoTOnRLj7ejT8e1zzqeRvrniSt38P_wASx8JwKgAdw9CfZ5cFBByJwg4-1b6-tnQh0oofe_0GGEJGQUsW-Qkr2CPTzItkIO4MQsJyGR6U4pr6YwA3DGWJF1P2YHZQseu79Ly0iRnZsXFoEjjO6wzi_GIi8DlJcB1Xva71uKeyM6mDWZOZ-KItbRFmk0d0hxg\",\"https://w3id.org/security#proofPurpose\":{\"id\":\"https://w3id.org/security#assertionMethod\"},\"https://w3id.org/security#verificationMethod\":{\"id\":\"did:india\"}}}";
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
    expect(sign.evidence[0].id).toBe("https://cowin.gov.in/vaccine/" + certificateId);
    expect(sign.evidence[0].certificateId).toBe(certificateId);
});