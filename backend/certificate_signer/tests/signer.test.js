const {signJSON, transformW3, customLoader, CERTIFICATE_TYPE_V3, CERTIFICATE_TYPE_V2} = require('../signer');
const jsigs = require('jsonld-signatures');
const {RSAKeyPair} = require('crypto-ld');
const {RsaSignature2018} = jsigs.suites;

const cert2 = {
  "facility": {
    "address": {
      "addressLine1": "kundrathur upgraded phc",
      "district": "South 24 Parganas",
      "state": ""
    },
    "name": "RAJATJUBLEE GP SC"
  },
  "preEnrollmentCode": "42655211223324",
  "recipient": {
    "address": {
      "state": ""
    },
    "age": "77",
    "contact": [
      "tel:9460942221"
    ],
    "dob": "1944-05-21",
    "gender": "Female",
    "identity": "did:Ration Card:1524",
    "name": "Savteri Devi Gupta",
    "nationality": "Indian",
    "uhid":"1232"
  },
  "vaccination": {
    "batch": "12345",
    "date": "2021-05-02T17:32:54.602Z",
    "dose": 1,
    "effectiveStart": "2021-08-02",
    "effectiveUntil": "2021-09-02",
    "manufacturer": "Serum Institute of India",
    "name": "Covaxin",
    "totalDoses": 2
  },
  "vaccinator": {
    "name": "Dr. abc"
  }
};

signJSON(transformW3(cert2, 123, CERTIFICATE_TYPE_V2))
  .then(d => {
    console.log(d)
  });

test('Sign the json', async () => {
  sign = await signJSON(transformW3(cert2, 123, CERTIFICATE_TYPE_V2));
  console.log(JSON.stringify(sign))
  expect(sign).not.toBe(null);
});

test('Sign the json for certificate v3 type', async () => {
  sign = await signJSON(transformW3(cert2, 123, CERTIFICATE_TYPE_V3));
  console.log(JSON.stringify(sign))
  expect(sign).not.toBe(null);
});

test('Verify the signed json', async () => {
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:2342343334\",\"refId\":\"12346\",\"name\":\"Bhaya Mitra\",\"gender\":\"Male\",\"age\":\"27\",\"nationality\":\"Indian\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"\",\"city\":\"\",\"addressRegion\":\"\",\"addressCountry\":\"IN\",\"postalCode\":\"\"}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-01-15T17:21:13.117Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/undefined\",\"feedbackUrl\":\"https://cowin.gov.in/?undefined\",\"infoUrl\":\"https://cowin.gov.in/?undefined\",\"type\":[\"Vaccination\"],\"batch\":\"MB3428BX\",\"vaccine\":\"CoVax\",\"manufacturer\":\"COVPharma\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"dose\":\"\",\"totalDoses\":\"\",\"verifier\":{\"name\":\"Sooraj Singh\"},\"facility\":{\"name\":\"ABC Medical Center\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"Bengaluru\",\"addressRegion\":\"Karnataka\",\"addressCountry\":\"IN\",\"postalCode\":\"\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-01-15T17:21:13Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mJlHZZRD7VQwVJchfI21ZavjxNKglbf3LSaF1SAjELOWn9MARALkugsmOzG0mBon9R7zXSVPkPM8EDbUZxR4FsRlAFFszFv-0BjyAeIqRv-9MRnlm4cScQi8aCBgBnvsWfNIE175cGNbPUluVv5n6G66tVinioL5IL6uCZNQnSGp4jJrEAZa0t5s3jXfq7soHz1LTfQbLs7cH5-fDi3JW1-WeF4_ELy_9l_OxAc2CoACqYLOLJB-NnPsnz2bwAvH8yXHsjZJphzaBNqpn8DmJvcRHzhz7OjpGfhyouiOyGo_XncadFmftqwfilJkC1EISkSb6QVsyhHLOudY4PTTaA\"}}";
  const {publicKeyPem} = require('../config/keys');
  const publicKey = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: 'did:india',
    type: 'RsaVerificationKey2018',
    controller: 'https://cowin.gov.in/',
    publicKeyPem
  };
  const controller = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: 'https://cowin.gov.in/',
    publicKey: [publicKey],
    // this authorizes this key to be used for making assertions
    assertionMethod: [publicKey.id]
  };
  const key = new RSAKeyPair({...publicKey});
  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({controller}),
    compactProof: false,
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