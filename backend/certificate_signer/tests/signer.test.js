const {signJSON, transformW3, customLoader} = require('../signer');
const {publicKeyPem,privateKeyPem} = require('../config/keys');
const jsigs = require('jsonld-signatures');
const {RSAKeyPair} = require('crypto-ld');
const {RsaSignature2018} = jsigs.suites;

const cert2 = {
  "comorbidities":[
     
  ],
  "meta":{
     "name":"Covishield",
     "batch":"COVISHIELD - 4121Z009",
     "manufacturer":"india",
     "date":"2021-05-05T05:30:28.187Z",
     "totalDoses":2,
     "issueDate":"2021-09-20T10:37:02.461+0530",
     "cit":"CIT167965143368",
     "status":"Completed",
     "passportNo":"N3303369"
  },
  "recipient":{
     "address":{
        "pincode":"pincode",
        "dob":"1962-12-31",
        "district":"Colombo",
        "addressLine1":"21/ 6 Sri Dharmapala Road, Mount Lavinia",
        "addressLine2":"",
        "state":"state"
     },
     "gender":"Male",
     "nationality":"Sri Lankan",
     "identity":"2342343334",
     "contact":[
        "tel:1111111410"
     ],
     "name":"M H P Wijesekera",
     "age":"60"
  },
  "vaccinator":{
     "name":"Unknown"
  },
  "preEnrollmentCode":"603663383V",
  "enrollmentType":"vaccination",
  "facility":{
     "address":{
        "pincode":"pincode",
        "district":"district",
        "addressLine1":"addressLine1",
        "addressLine2":"addressLine2",
        "state":"state"
     },
     "name":"ABC Medical Center"
  },
  "programId":"VCC001",
  "vaccination":{
     "date":"2021-02-17T00:00:00",
     "effectiveUntil":"2021-01-15",
     "dose":1,
     "effectiveStart":"2020-12-15",
     "totalDoses":2,
     "name":"COVISHIELD",
     "batch":"COVISHIELD - 4120Z025",
     "manufacturer":"COVISHIELD"
  }
};

const certificateId = "123";
signJSON(transformW3(cert2,certificateId))
  .then(d => {
    console.log(d)
  });
const publicKey = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: 'did:srilanka:moh',
    type: 'RsaVerificationKey2018',
    controller:'https://cowin.gov.in/',
    publicKeyPem
};
const controller = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: 'https://cowin.gov.in/',
    publicKey: [publicKey],
    // this authorizes this key to be used for making assertions
    assertionMethod: [publicKey.id]
};
const key = new RSAKeyPair({...publicKey,privateKeyPem});

test('Sign the json', async () => {
  sign = await signJSON(transformW3(cert2));
  console.log(JSON.stringify(sign))
  expect(sign).not.toBe(null);
});

test('Verify the signed json', async () => {
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:srilanka:moh:2342343334\",\"refId\":\"603663383V\",\"name\":\"M H P Wijesekera\",\"gender\":\"Male\",\"age\":\"60\",\"nationality\":\"Sri Lankan\",\"address\":{\"streetAddress\":\"21/ 6 Sri Dharmapala Road, Mount Lavinia\",\"streetAddress2\":\"\",\"district\":\"Colombo\",\"city\":\"\",\"addressRegion\":\"state\",\"addressCountry\":\"IN\",\"postalCode\":\"pincode\"}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2022-01-21T14:30:11.347Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/918252722\",\"feedbackUrl\":\"https://cowin.gov.in/?918252722\",\"infoUrl\":\"https://cowin.gov.in/?918252722\",\"certificateId\":\"918252722\",\"type\":[\"Vaccination\"],\"batch\":\"COVISHIELD - 4120Z025\",\"vaccine\":\"COVISHIELD\",\"manufacturer\":\"COVISHIELD\",\"date\":\"2021-02-17T00:00:00.000Z\",\"effectiveStart\":\"2020-12-15\",\"effectiveUntil\":\"2021-01-15\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Unknown\"},\"facility\":{\"name\":\"ABC Medical Center\",\"address\":{\"streetAddress\":\"addressLine1\",\"streetAddress2\":\"addressLine2\",\"district\":\"district\",\"city\":\"\",\"addressRegion\":\"state\",\"addressCountry\":\"IN\",\"postalCode\":\"pincode\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2022-01-21T14:30:11Z\",\"verificationMethod\":\"did:srilanka:moh\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YUgBltLvRQCoRttvMkjHIhocqmPTSOADUBLOcKeDOqJ3lsmJ4nST8FCtew6bSMuSdzYjfy76JGoQE1xa9_Ual8GKFZRrgnsR-sPJp5Ne-lfJ_0jBFDDYkQEWebHuh5URRmRDQdz7UzioiGgAPGOxUo0CXImEuo5YndO7k3ooxBxZGwqMfakOfqRqWLgB7P-VKBoEjo_vpynZCmIkqDsVeHLZNBMt8EszYTkCBYZ_ZY1gS2HiKcIhO1vlvZgM-lDTtXghCZOtPc3nA5XqjIVdZfTZ29xKyFikGoeI3eGwn-kUPdtTSlBK5gOoiZF_aeMiJXwIm6GXSOYeDMbjzCAs5w\"}}";

  const {AssertionProofPurpose} = jsigs.purposes;
  const result = await jsigs.verify(signed, {
    documentLoader: customLoader,
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({
      controller: controller
    }),
    compactProof: false
  });
  console.log("result:"+result);
  expect(result.verified).toBe(true)
});

test('Signed json to include certificate id', async () => {
    
    sign = await signJSON(transformW3(cert2, certificateId));
    expect(sign.credentialSubject.id).toBe("did:srilanka:moh:"+cert2.recipient.identity);
    expect(sign.evidence[0].id).toBe("https://cowin.gov.in/vaccine/" + certificateId);
    expect(sign.evidence[0].certificateId).toBe(certificateId);
});

test('Sign json with non-uri identity and verify for did identity', async () => {
  const credentialSubjectId = 'did:srilanka:moh:12345';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = '12345';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with invalid identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:srilanka:moh:603663383V';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'NA';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with ANAMIKA identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:srilanka:moh:ANAMIKA';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'ANAMIKA';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with special-char identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:srilanka:moh:603663383V';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = '_';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with single-char identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:srilanka:moh:603663383V';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'i';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with single-digit identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:srilanka:moh:603663383V';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = '6';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with empty-string identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:srilanka:moh:603663383V';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = '';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with null identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:srilanka:moh:603663383V';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = null;
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with http identity and verify for the same', async () => {
  const credentialSubjectId = 'http://www.nic.co.sl/id/12346'
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'http://www.nic.co.sl/id/12346'
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with https with www identity and verify for the same', async () => {
  const credentialSubjectId = 'https://www.nic.co.sl/id/12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'https://www.nic.co.sl/id/12346';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with https without www identity and verify for the same', async () => {
  const credentialSubjectId = 'https://nic.co.sl/id/12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'https://nic.co.sl/id/12346';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Sign json with invalid uri identity and verify for did identity', async () => {
  const credentialSubjectId = 'did:srilanka:moh:nic.co.sl/id/12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'nic.co.sl/id/12346';
  let sign = await signJSON(transformW3(certModified, certificateId));
  expect(sign.credentialSubject.id).toBe(credentialSubjectId);
});

test('Verify: Modify signed json credSubj.id did value, and ensure verification fails', async () => {
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:srilanka:moh:23423334\",\"refId\":\"603663383V\",\"name\":\"M H P Wijesekera\",\"gender\":\"Male\",\"age\":\"60\",\"nationality\":\"Sri Lankan\",\"address\":{\"streetAddress\":\"21/ 6 Sri Dharmapala Road, Mount Lavinia\",\"streetAddress2\":\"\",\"district\":\"Colombo\",\"city\":\"\",\"addressRegion\":\"state\",\"addressCountry\":\"IN\",\"postalCode\":\"pincode\"}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2022-01-21T14:30:11.347Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/918252722\",\"feedbackUrl\":\"https://cowin.gov.in/?918252722\",\"infoUrl\":\"https://cowin.gov.in/?918252722\",\"certificateId\":\"918252722\",\"type\":[\"Vaccination\"],\"batch\":\"COVISHIELD - 4120Z025\",\"vaccine\":\"COVISHIELD\",\"manufacturer\":\"COVISHIELD\",\"date\":\"2021-02-17T00:00:00.000Z\",\"effectiveStart\":\"2020-12-15\",\"effectiveUntil\":\"2021-01-15\",\"dose\":1,\"totalDoses\":2,\"verifier\":{\"name\":\"Unknown\"},\"facility\":{\"name\":\"ABC Medical Center\",\"address\":{\"streetAddress\":\"addressLine1\",\"streetAddress2\":\"addressLine2\",\"district\":\"district\",\"city\":\"\",\"addressRegion\":\"state\",\"addressCountry\":\"IN\",\"postalCode\":\"pincode\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2022-01-21T14:30:11Z\",\"verificationMethod\":\"did:srilanka:moh\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YUgBltLvRQCoRttvMkjHIhocqmPTSOADUBLOcKeDOqJ3lsmJ4nST8FCtew6bSMuSdzYjfy76JGoQE1xa9_Ual8GKFZRrgnsR-sPJp5Ne-lfJ_0jBFDDYkQEWebHuh5URRmRDQdz7UzioiGgAPGOxUo0CXImEuo5YndO7k3ooxBxZGwqMfakOfqRqWLgB7P-VKBoEjo_vpynZCmIkqDsVeHLZNBMt8EszYTkCBYZ_ZY1gS2HiKcIhO1vlvZgM-lDTtXghCZOtPc3nA5XqjIVdZfTZ29xKyFikGoeI3eGwn-kUPdtTSlBK5gOoiZF_aeMiJXwIm6GXSOYeDMbjzCAs5w\"}}";

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

test('Verify: Modify signed json credSubj.id https value, and ensure verification fails', async () => {

  const modifiedCredSubId = 'https://nic.co.sl/id/12345';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'https://nic.co.sl/id/12346';
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
