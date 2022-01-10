const {signJSON, customLoader, setDocumentLoader} = require('../signer');
const jsigs = require('jsonld-signatures');
const {RSAKeyPair} = require('crypto-ld');
const {RsaSignature2018} = jsigs.suites;
const R = require('ramda');
const {vaccinationContext} = require("vaccination-context");
const certificateId = "123";

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

const CERTIFICATE_NAMESPACE = "https://divoc.dev/credentials/vaccination/v1";
const CERTIFICATE_ISSUER = "https://divoc.dev/";
const CERTIFICATE_BASE_URL = "https://divoc.dev/vaccine/";
const CERTIFICATE_FEEDBACK_BASE_URL = "https://divoc.dev/?";
const CERTIFICATE_INFO_BASE_URL = "https://divoc.dev/?";
const CERTIFICATE_DID = "did:india";
const CERTIFICATE_PUBKEY_ID = "https://example.com/i/india";
const IDENTITY_REJECTION_PATTERN = "NA"

// vaccine certificate transformer
function transformW3(cert, certificateId) {
  const preEnrollmentCode = R.pathOr('', ['preEnrollmentCode'], cert);
  const recipientIdentifier = populateIdentity(cert, preEnrollmentCode);
  const certificateFromTemplate = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      CERTIFICATE_NAMESPACE,
    ],
    type: ['VerifiableCredential', 'ProofOfVaccinationCredential'],
    credentialSubject: {
      type: "Person",
      id: recipientIdentifier,
      refId: preEnrollmentCode,
      name: R.pathOr('', ['recipient', 'name'], cert),
      gender: R.pathOr('', ['recipient', 'gender'], cert),
      age: ageOfRecipient(cert.recipient), //from dob
      nationality: R.pathOr('', ['recipient', 'nationality'], cert),
      address: {
        "streetAddress": R.pathOr('', ['recipient', 'address', 'addressLine1'], cert),
        "streetAddress2": R.pathOr('', ['recipient', 'address', 'addressLine2'], cert),
        "district": R.pathOr('', ['recipient', 'address', 'district'], cert),
        "city": R.pathOr('', ['recipient', 'address', 'city'], cert),
        "addressRegion": R.pathOr('', ['recipient', 'address', 'state'], cert),
        "addressCountry": R.pathOr('IN', ['recipient', 'address', 'country'], cert),
        "postalCode": R.pathOr('', ['recipient', 'address', 'pincode'], cert),
      }
    },
    issuer: CERTIFICATE_ISSUER,
    issuanceDate: new Date().toISOString(),
    evidence: [{
      "id": CERTIFICATE_BASE_URL + certificateId,
      "feedbackUrl": CERTIFICATE_FEEDBACK_BASE_URL + certificateId,
      "infoUrl": CERTIFICATE_INFO_BASE_URL + certificateId,
      "certificateId": certificateId,
      "type": ["Vaccination"],
      "batch": R.pathOr('', ['vaccination', 'batch'], cert),
      "vaccine": R.pathOr('', ['vaccination', 'name'], cert),
      "manufacturer": R.pathOr('', ['vaccination', 'manufacturer'], cert),
      "date": R.pathOr('', ['vaccination', 'date'], cert),
      "effectiveStart": R.pathOr('', ['vaccination', 'effectiveStart'], cert),
      "effectiveUntil": R.pathOr('', ['vaccination', 'effectiveUntil'], cert),
      "dose": R.pathOr('', ['vaccination', 'dose'], cert),
      "totalDoses": R.pathOr('', ['vaccination', 'totalDoses'], cert),
      "verifier": {
        "name": R.pathOr('', ['vaccinator', 'name'], cert),
      },
      "facility": {
        // "id": CERTIFICATE_BASE_URL + cert.facility.id,
        "name": R.pathOr('', ['facility', 'name'], cert),
        "address": {
          "streetAddress": R.pathOr('', ['facility', 'address', 'addressLine1'], cert),
          "streetAddress2": R.pathOr('', ['facility', 'address', 'addressLine2'], cert),
          "district": R.pathOr('', ['facility', 'address', 'district'], cert),
          "city": R.pathOr('', ['facility', 'address', 'city'], cert),
          "addressRegion": R.pathOr('', ['facility', 'address', 'state'], cert),
          "addressCountry": R.pathOr('IN', ['facility', 'address', 'country'], cert),
          "postalCode": R.pathOr('', ['facility', 'address', 'pincode'], cert)
        },
      }
    }],
    "nonTransferable": "true"
  };
  return certificateFromTemplate;
}

const publicKeyPem = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnXQalrgztecTpc+INjRQ8s73FSE1kU5QSlwBdICCVJBUKiuQUt7s+Z5epgCvLVAOCbP1mm5lV7bfgV/iYWDio7lzX4MlJwDedWLiufr3Ajq+79CQiqPaIbZTo0i13zijKtX7wgxQ78wT/HkJRLkFpmGeK3za21tEfttytkhmJYlwaDTEc+Kx3RJqVhVh/dfwJGeuV4Xc/e2NH++ht0ENGuTk44KpQ+pwQVqtW7lmbDZQJoOJ7HYmmoKGJ0qt2hrj15uwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZfv2AZZ9/7Y+igshzfB0reIFdUKw3cdVTzfv5FNrIqN5pwIDAQAB\n-----END PUBLIC KEY-----\n';
const privateKeyPem = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAnXQalrgztecTpc+INjRQ8s73FSE1kU5QSlwBdICCVJBUKiuQUt7s+Z5epgCvLVAOCbP1mm5lV7bfgV/iYWDio7lzX4MlJwDedWLiufr3Ajq+79CQiqPaIbZTo0i13zijKtX7wgxQ78wT/HkJRLkFpmGeK3za21tEfttytkhmJYlwaDTEc+Kx3RJqVhVh/dfwJGeuV4Xc/e2NH++ht0ENGuTk44KpQ+pwQVqtW7lmbDZQJoOJ7HYmmoKGJ0qt2hrj15uwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZfv2AZZ9/7Y+igshzfB0reIFdUKw3cdVTzfv5FNrIqN5pwIDAQABAoIBAHPILMUoLt5UTd5f/YnebqgeCRNAmGOBcwk7HtbMqQoGF93qqvZFd30XOAJZ/ncTpz77Vl95ToxxrWk1WQLCe+ZpOK3Dgk5sFSm8zXx1T64UBNPUSnWoh37C1D39+b9rppCZScgnxlyPdSLy3h3q8Hyoy+auqUEkm/ms5W2lT3fJscyN1IAyHrhsOBWjl3Ilq5GxBo5tbYv/Fb1pQiP/p2SIHA1+2ASXNYQP100F5Vn0V6SFtBXTCQnwcvbP083NvlGxs9+xRs3MCUcxCkKepWuzYwOZDmu/2yCz1/EsP6wlsYEHmCZLdIb0tQt0caqzB/RoxfBpNRIlhOtqHvBzUgECgYEAzIRn5Y7lqO3N+V29wXXtVZjYWvBh7xUfOxAwVYv0rKI0y9kHJHhIrU+wOVOKGISxBKmzqBQRPvXtXW8E0/14Zz82g60rRwtNjvW0UoZAY3KPouwruUIjAe2UnKZcQ//MBTrvds8QGpL6nxvPsBqU0y2K+ySAOxBtNtGEjzv8nxUCgYEAxRbMWukIbgVOuQjangkfJEfA1UaRFQqQ8jUmT9aiq2nREnd4mYP8kNKzJa9L7zj6Un6yLH5DbGspZ2gGODeRw3uVFN8XSzRdLvllNEyiG/waiysUtXfG2DPOR6xD8tXXDMm/tl9gTa8cbkvqYy10XT9MpfOAsusEZVmc0/DBBMsCgYAYdAxoKjnThPuHwWma5BrIjUnxNaTADWp6iWj+EYnjylE9vmlYNvmZn1mWwSJV5Ce2QwQ0KJIXURhcf5W4MypeTfSase3mxLc1TLOO2naAbYY3GL3xnLLK3DlUsZ9+kes3BOD097UZOFG3DIA8sjDxPxTLCoY6ibBFSa/r4GRIMQKBgQCranDCgPu79RHLDVBXM0fKnj2xQXbd/hqjDmcL+Xnx7E7S6OYTXyBENX1qwVQh9ESDi34cBJVPrsSME4WVT3+PreS0CnSQDDMfr/m9ywkTnejYMdgJHOvtDuHSpJlUk3g+vxnm3H0+E5d+trhdGiOjFnLrwyWkd5OTMqWcEEFQkQKBgFfXObDz/7KqeSaAxI8RzXWbI3Fa492b4qQUhbKYVpGn98CCVEFJr11vuB/8AXYCa92OtbwgMw6Ah5JOGzRScJKdipoxo7oc2LJ9sSjjw3RB/aWl35ChvnCJhmfSL8Usbj0nWVTrPwRLjMC2bIxkLtnm9qYXPumW1EjEbusjVMpN\n-----END RSA PRIVATE KEY-----\n';

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
const KeyType = {
  RSA: "RSA",
  ED25519: "ED25519"
};
const identityRejectionRegex = new RegExp(IDENTITY_REJECTION_PATTERN);
let signingKeyType = KeyType.RSA;
let signingConfig = {
  publicKeyPem: publicKeyPem,
  privateKeyPem: privateKeyPem,
  publicKeyBase58: publicKeyPem,
  privateKeyBase58: privateKeyPem,
  CERTIFICATE_DID: CERTIFICATE_DID,
  CERTIFICATE_PUBKEY_ID: CERTIFICATE_PUBKEY_ID,
  keyType: signingKeyType
  };
let documentLoaderMapping = {};
documentLoaderMapping[CERTIFICATE_DID] = CERTIFICATE_DID;
documentLoaderMapping[CERTIFICATE_PUBKEY_ID] = CERTIFICATE_PUBKEY_ID;
documentLoaderMapping[CERTIFICATE_NAMESPACE] = vaccinationContext;
setDocumentLoader(documentLoaderMapping, signingConfig)

function populateIdentity(cert, preEnrollmentCode) {
  let isURI = false;
  let identity = R.pathOr('', ['recipient', 'identity'], cert);
  isURI = isURIFormat(identity);

  return isURI ? identity : reinitIdentityFromPayload(identity, preEnrollmentCode);
}

function isURIFormat(param) {
  let parsed;
  let isURI;
  try {
    parsed = new URL(param);
    isURI = true;
  } catch (e) {
    console.error("Identity field must be of URI format");
    isURI = false;
  }

  if (isURI && !parsed.protocol) {
    console.error("Identity field must be of URI format");
    isURI = false;
  }
  console.log("Identity is having the value "+param)
  return isURI;
}

function reinitIdentityFromPayload(identity, preEnrollmentCode) {
  if(identity && !identityRejectionRegex.test(identity.toUpperCase())) {
    let newTempIdentity = `${CERTIFICATE_DID}:${identity}`;
    if (isURIFormat(newTempIdentity)) {
      return newTempIdentity;
    }
  }
  return `${CERTIFICATE_DID}:${preEnrollmentCode}`;
}

function ageOfRecipient(recipient) {
  if (recipient.age) return recipient.age;
  if (recipient.dob && new Date(recipient.dob).getFullYear() > 1900)
    return "" + (Math.floor((new Date() - new Date(recipient.dob))/1000/60/60/24.0/365.25));
  return "";
}

function dobOfRecipient(recipient) {
  if (recipient.dob && new Date(recipient.dob).getFullYear() > 1900) return recipient.dob;
  // administrative dob
  if (recipient.age && recipient.age > 0)
    return (new Date().getFullYear() - recipient.age) + "-01-01";
  return "";
}

test('Sign the json', async () => {
  sign = await signJSON(transformW3(cert2, certificateId));
  console.log(JSON.stringify(sign))
  expect(sign).not.toBe(null);
});

test('Verify the signed json', async () => {
  // const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:2342343334\",\"refId\":\"12346\",\"name\":\"Bhaya Mitra\",\"gender\":\"Male\",\"age\":\"27\",\"nationality\":\"Indian\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"\",\"city\":\"\",\"addressRegion\":\"\",\"addressCountry\":\"IN\",\"postalCode\":\"\"}},\"issuer\":\"https://cowin.gov.in/\",\"issuanceDate\":\"2021-01-15T17:21:13.117Z\",\"evidence\":[{\"id\":\"https://cowin.gov.in/vaccine/undefined\",\"feedbackUrl\":\"https://cowin.gov.in/?undefined\",\"infoUrl\":\"https://cowin.gov.in/?undefined\",\"type\":[\"Vaccination\"],\"batch\":\"MB3428BX\",\"vaccine\":\"CoVax\",\"manufacturer\":\"COVPharma\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"dose\":\"\",\"totalDoses\":\"\",\"verifier\":{\"name\":\"Sooraj Singh\"},\"facility\":{\"name\":\"ABC Medical Center\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"Bengaluru\",\"addressRegion\":\"Karnataka\",\"addressCountry\":\"IN\",\"postalCode\":\"\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-01-15T17:21:13Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mJlHZZRD7VQwVJchfI21ZavjxNKglbf3LSaF1SAjELOWn9MARALkugsmOzG0mBon9R7zXSVPkPM8EDbUZxR4FsRlAFFszFv-0BjyAeIqRv-9MRnlm4cScQi8aCBgBnvsWfNIE175cGNbPUluVv5n6G66tVinioL5IL6uCZNQnSGp4jJrEAZa0t5s3jXfq7soHz1LTfQbLs7cH5-fDi3JW1-WeF4_ELy_9l_OxAc2CoACqYLOLJB-NnPsnz2bwAvH8yXHsjZJphzaBNqpn8DmJvcRHzhz7OjpGfhyouiOyGo_XncadFmftqwfilJkC1EISkSb6QVsyhHLOudY4PTTaA\"}}";
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://divoc.dev/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:11112222334\",\"refId\":\"36\",\"name\":\"Sam21\",\"gender\":\"Male\",\"age\":\"31\",\"nationality\":\"India\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"\",\"addressRegion\":\"bihar\",\"addressCountry\":\"IN\",\"postalCode\":\"560033\"}},\"issuer\":\"https://divoc.dev/\",\"issuanceDate\":\"2021-07-29T11:23:51.377Z\",\"evidence\":[{\"id\":\"https://divoc.dev/vaccine/244768056\",\"feedbackUrl\":\"https://divoc.dev/?244768056\",\"infoUrl\":\"https://divoc.dev/?244768056\",\"certificateId\":\"244768056\",\"type\":[\"Vaccination\"],\"batch\":\"AB348FS\",\"vaccine\":\"covaxin\",\"manufacturer\":\"Bharat Biotech\",\"date\":\"2021-07-12T19:21:19.646Z\",\"effectiveStart\":\"2021-07-12\",\"effectiveUntil\":\"2021-08-12\",\"dose\":2,\"totalDoses\":2,\"verifier\":{\"name\":\"Sooraj Singh\"},\"facility\":{\"name\":\"ABCD Medical Center\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"\",\"addressRegion\":\"bihar\",\"addressCountry\":\"IN\",\"postalCode\":\"560033\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"created\":\"2021-07-29T11:23:51Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..PQ51yXe27fF3MJ3jP5VBBMAAHBd88LFZH7S73kzfW7BJz4WunN320Qvlt-wt7zX-ykx7BpKsPgoaHDTWM4S_j_-2W8TXY1p7veUOikh5TbqomJzz5_n3a-VVMXRA-cwDSDQLJt1cvAa-52P6-Pwiw_kL-PEZCgzPhkzeRndNkLwSNfVdt_ck3a_GArouAe0rjT18Z6-PsRriruDHaTWHR_TYIwEPAfUUWLIRGJlO4ZkvakfPu9UO_IskQlmm3NVr1mG6pT-FRoIDiDi0MQDFSaKbuIQ8hq4tN_gLLo2a-4CmW1s4WXNpbhIMk3Hw1XEHCo24xAewZOK-w3lnRdVaxw\"}}";

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

test('Sign json and verify certificate id', async () => {
  let sign = await signJSON(transformW3(cert2, certificateId));
    expect(sign.credentialSubject.id).toBe(cert2.recipient.identity);
    expect(sign.evidence[0].id).toBe("https://divoc.dev/vaccine/" + certificateId);
    expect(sign.evidence[0].certificateId).toBe(certificateId);
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

test('Sign json with invalid identity and verify for did identity with preEnrollmentCode', async () => {
  const credentialSubjectId = 'did:india:12346';
  let certModified = JSON.parse(JSON.stringify(cert2));
  certModified.recipient.identity = 'NA';
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