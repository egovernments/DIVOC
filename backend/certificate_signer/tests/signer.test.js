const {signJSON, transformW3, customLoader,identityOfSubject, CERTIFICATE_TYPE_V3, CERTIFICATE_TYPE_V2} = require('../signer');
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
  "preEnrollmentCode": "12346",
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
    "identity": "did:in.gov.uidai.aadhaar:2342343334",
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

const certificateId = 123

const publicKeyPem = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnXQalrgztecTpc+INjRQ8s73FSE1kU5QSlwBdICCVJBUKiuQUt7s+Z5epgCvLVAOCbP1mm5lV7bfgV/iYWDio7lzX4MlJwDedWLiufr3Ajq+79CQiqPaIbZTo0i13zijKtX7wgxQ78wT/HkJRLkFpmGeK3za21tEfttytkhmJYlwaDTEc+Kx3RJqVhVh/dfwJGeuV4Xc/e2NH++ht0ENGuTk44KpQ+pwQVqtW7lmbDZQJoOJ7HYmmoKGJ0qt2hrj15uwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZfv2AZZ9/7Y+igshzfB0reIFdUKw3cdVTzfv5FNrIqN5pwIDAQAB\n-----END PUBLIC KEY-----\n';
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

signJSON(transformW3(cert2, certificateId, CERTIFICATE_TYPE_V2))
  .then(d => {
    console.log(d)
  });

test('Sign the json', async () => {
  sign = await signJSON(transformW3(cert2, certificateId, CERTIFICATE_TYPE_V2));
  console.log(JSON.stringify(sign))
  expect(sign).not.toBe(null);
});

test('Sign the json for certificate v3 type', async () => {
  sign = await signJSON(transformW3(cert2, certificateId, CERTIFICATE_TYPE_V3));
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
    sign = await signJSON(transformW3(cert2, certificateId));
    expect(sign.evidence[0].id).toBe("https://cowin.gov.in/vaccine/" + certificateId);
    expect(sign.evidence[0].certificateId).toBe(certificateId);
});

test('did tranformation', async () => {
  expect(identityOfSubject({"recipient":{"identity": ""}})).toBe("")
  expect(identityOfSubject({"recipient":{"identity": "asdf"}})).toBe("asdf")
  expect(identityOfSubject({"recipient":{"identity": "234234"}})).toBe("234234")
  expect(identityOfSubject({"recipient":{"identity": "example.com"}})).toBe("example.com")
  expect(identityOfSubject({"recipient":{"identity": "did:aadhaar:3234234"}})).toBe("did:aadhaar:3234234")
  expect(identityOfSubject({"recipient":{"identity": "did:aadhaar:AB34234"}})).toBe("did:aadhaar:AB34234")
  expect(identityOfSubject({"recipient":{"identity": "custom:Aadhaar Card:AB34234"}})).toBe("custom:Aadhaar Card:AB34234")
});

test('Sign json and verify credentialSubject.id', async () => {
  const credentialSubjectId = 'did:in.gov.uidai.aadhaar:2342343334';
  let sign = await signJSON(transformW3(cert2, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with non-uri identity and verify for did identity', async () => {
  const credentialSubjectId = 'did:india:12345';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = '12345';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with uri identity with space and verify for did identity', async () => {
  const credentialSubjectId = 'did:aadharcard:12345';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'did:Aadhar Card:12345';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with invalid identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:india:12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'NA';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with ANAMIKA identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:india:ANAMIKA';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'ANAMIKA';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with special-char identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:india:12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = '_';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with single-char identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:india:12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'i';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with single-digit identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:india:12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = '6';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with empty-string identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:india:12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = '';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with null identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:india:12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = null;
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with http identity and verify for the same', async () => {
  const credentialSubjectId = 'http://www.aadhar.co.in/id/12346'
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'http://www.aadhar.co.in/id/12346'
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with https with www identity and verify for the same', async () => {
  const credentialSubjectId = 'https://www.aadhar.co.in/id/12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'https://www.aadhar.co.in/id/12346';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with https without www identity and verify for the same', async () => {
  const credentialSubjectId = 'https://aadhar.co.in/id/12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'https://aadhar.co.in/id/12346';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with invalid uri identity and verify for did identity', async () => {
  const credentialSubjectId = 'did:india:aadhar.co.in/id/12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'aadhar.co.in/id/12346';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Verify: Modify signed json credSubj.id did value, and ensure verification fails', async () => {
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://divoc.dev/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:1111222233\",\"refId\":\"36\",\"name\":\"Sam21\",\"gender\":\"Male\",\"age\":\"31\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"\",\"addressRegion\":\"bihar\",\"addressCountry\":\"IN\",\"postalCode\":\"560033\"}},\"issuer\":\"https://divoc.dev/\",\"issuanceDate\":\"2021-07-29T11:23:51.377Z\",\"evidence\":[{\"id\":\"https://divoc.dev/vaccine/244768056\",\"feedbackUrl\":\"https://divoc.dev/?244768056\",\"infoUrl\":\"https://divoc.dev/?244768056\",\"certificateId\":\"244768056\",\"type\":[\"Vaccination\"],\"batch\":\"AB348FS\",\"vaccine\":\"covaxin\",\"manufacturer\":\"Bharat Biotech\",\"date\":\"2021-07-12T19:21:19.646Z\",\"effectiveStart\":\"2021-07-12\",\"effectiveUntil\":\"2021-08-12\",\"dose\":2,\"totalDoses\":2,\"verifier\":{\"name\":\"Sooraj Singh\"},\"facility\":{\"name\":\"ABCD Medical Center\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"\",\"addressRegion\":\"bihar\",\"addressCountry\":\"IN\",\"postalCode\":\"560033\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-07-29T11:23:51Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..PQ51yXe27fF3MJ3jP5VBBMAAHBd88LFZH7S73kzfW7BJz4WunN320Qvlt-wt7zX-ykx7BpKsPgoaHDTWM4S_j_-2W8TXY1p7veUOikh5TbqomJzz5_n3a-VVMXRA-cwDSDQLJt1cvAa-52P6-Pwiw_kL-PEZCgzPhkzeRndNkLwSNfVdt_ck3a_GArouAe0rjT18Z6-PsRriruDHaTWHR_TYIwEPAfUUWLIRGJlO4ZkvakfPu9UO_IskQlmm3NVr1mG6pT-FRoIDiDi0MQDFSaKbuIQ8hq4tN_gLLo2a-4CmW1s4WXNpbhIMk3Hw1XEHCo24xAewZOK-w3lnRdVaxw\"}}";

  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({controller}),
    compactProof: false,
    documentLoader: customLoader
  });
  console.log(result);
  expect(result.verified).toBe(false)
});

test('Verify: Ensure verification passes for a certificate whose credSubj.id has space in it', async () => {
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"custom:aadhar card:123\",\"refId\":\"12346\",\"name\":\"Savteri Devi Gupta\",\"uhid\":\"1232\",\"gender\":\"Female\",\"age\":\"77\",\"nationality\":\"Indian\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"\",\"city\":\"\",\"addressRegion\":\"\",\"addressCountry\":\"IN\",\"postalCode\":\"\"}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2022-01-21T11:38:06.882Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/123\",\"feedbackUrl\":\"https://cowin.gov.in/?123\",\"infoUrl\":\"https://cowin.gov.in/?123\",\"certificateId\":123,\"type\":[\"Vaccination\"],\"batch\":\"12345\",\"vaccine\":\"Covaxin\",\"manufacturer\":\"Serum Institute of India\",\"date\":\"2021-05-02T17:32:54.602Z\",\"effectiveStart\":\"2021-08-02\",\"effectiveUntil\":\"2021-09-02\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Dr. abc\"},\"facility\":{\"name\":\"RAJATJUBLEE GP SC\",\"address\":{\"streetAddress\":\"kundrathur upgraded phc\",\"streetAddress2\":\"\",\"district\":\"South 24 Parganas\",\"city\":\"\",\"addressRegion\":\"\",\"addressCountry\":\"IN\",\"postalCode\":\"\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2022-01-21T11:38:06Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..VMmnuuQX5tL6zuqOTNmWxFIamRdzTarHgPhB-_vlOFHaiNVE8rah5oZNg9ITNbNScq3ZVrLYWLg7IedPy1MDNi04y8hXEouXru3u10lvt1au3UUUP-QdD9CLxZ4vdhVwpn07NjemA-a2eDTzYpDtSU3mrHvuxgiQSvj_9uL1gTdF2o2735BZXevwx84VKQqkWsZfT3Nac_Qwf1tmsSly-lKQiIBzoVsohFAGt2JFeyb8QTKiSQexDv3ui-YmHFI_3aCcL6ux8JDyM7bgpIeSdq8dNlI-Srx7RtcFr7UMMJzEIVIN5eEFYt34OISgtPtXQMRx8CgThbONfQ0ebol7eA\"}}";

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

test('Verify: Modify signed json credSubj.id https value, and ensure verification fails', async () => {

  const modifiedCredSubId = 'https://aadhar.co.in/id/12345';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'https://aadhar.co.in/id/12346';
  let signed = await signJSON(transformW3(certModified, certificateId));
  signed.credentialSubject.id = modifiedCredSubId;

  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({controller}),
    compactProof: false,
    documentLoader: customLoader
  });
  console.log(result);
  expect(result.verified).toBe(false)
});

test('Verify: For empty recipient.identity payload, Modify the signed json credSubj.name value, and ensure verification fails', async () => {
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = '';
  let signed = await signJSON(transformW3(certModified, certificateId));
  signed.credentialSubject.name = "mitra bhaiya";

  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({controller}),
    compactProof: false,
    documentLoader: customLoader
  });
  console.log(result);
  expect(result.verified).toBe(false)
});

test('Verify: Modify signed json credSubj.name value, and ensure verification fails', async () => {
  let signed = await signJSON(transformW3(cert2, certificateId));
  signed.credentialSubject.name = "mitra bhaiya";

  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({controller}),
    compactProof: false,
    documentLoader: customLoader
  });
  console.log(result);
  expect(result.verified).toBe(false)
});

test('Verify: Modify signed json evidence.dose value, and ensure verification fails', async () => {
  let signed = await signJSON(transformW3(cert2, certificateId));
  signed.evidence[0].dose = 2;
  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({controller}),
    compactProof: false,
    documentLoader: customLoader
  });
  console.log(result);
  expect(result.verified).toBe(false)
});

test('Verify: Modify signed json evidence.vaccine value, and ensure verification fails', async () => {
  let signed = await signJSON(transformW3(cert2, certificateId));
  signed.evidence[0].vaccine = 'Moderna';
  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({controller}),
    compactProof: false,
    documentLoader: customLoader
  });
  console.log(result);
  expect(result.verified).toBe(false)
});

test('Verify: Modify signed json credSubj.effectiveStart value, and ensure verification fails', async () => {
  let signed = await signJSON(transformW3(cert2, certificateId));
  signed.evidence[0].effectiveStart = "2020-12-03";
  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({controller}),
    compactProof: false,
    documentLoader: customLoader
  });
  console.log(result);
  expect(result.verified).toBe(false)
});