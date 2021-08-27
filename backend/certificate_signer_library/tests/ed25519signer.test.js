
const {vaccinationContext} = require("vaccination-context");

const vc = require('vc-js');
const {setDocumentLoader,signJSON, customLoader} = require('../signer');
const {transformW3} = require('./signer.test');
const jsigs = require('jsonld-signatures');
const {RSAKeyPair} = require('crypto-ld');
const {RsaSignature2018} = jsigs.suites;
const {Ed25519Signature2018} = jsigs.suites;
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
const {AssertionProofPurpose} = jsigs.purposes;
const {publicKeyBase58, privateKeyBase58} = {CERTIFICATE_DID, CERTIFICATE_PUBKEY_ID, publicKeyBase58: "DaipNW4xaH2bh1XGNNdqjnSYyru3hLnUgTBSfSvmZ2hi", privateKeyBase58: '41WN3qJL5Agwg8MERbEmMLKnkNstv5iSD8oJ8sRnDyBUegeGKgjqgKm9qZTmhcLQSWCdTkSN3Cd1tPqMn1rjM3BJ'};
const {Ed25519KeyPair} = require('crypto-ld');
const key = new Ed25519KeyPair(
  {
    publicKeyBase58: publicKeyBase58,
    id: CERTIFICATE_DID
  }
);
let documentLoaderMapping = {};
documentLoaderMapping[CERTIFICATE_NAMESPACE] = vaccinationContext;
setDocumentLoader(documentLoaderMapping, {CERTIFICATE_DID, CERTIFICATE_PUBKEY_ID, publicKeyBase58: "DaipNW4xaH2bh1XGNNdqjnSYyru3hLnUgTBSfSvmZ2hi", privateKeyBase58: '41WN3qJL5Agwg8MERbEmMLKnkNstv5iSD8oJ8sRnDyBUegeGKgjqgKm9qZTmhcLQSWCdTkSN3Cd1tPqMn1rjM3BJ'})

test('Sign the json', async () => {
  sign = await signJSON(transformW3(cert2, "123321"));
  console.log(JSON.stringify(sign));
  expect(sign).not.toBe(null);
});

test('Verify the signed json', async () => {
  const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://divoc.dev/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:2342343334\",\"refId\":\"12346\",\"name\":\"Bhaya Mitra\",\"gender\":\"Male\",\"age\":\"26\",\"nationality\":\"Indian\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"\",\"city\":\"\",\"addressRegion\":\"\",\"addressCountry\":\"IN\",\"postalCode\":\"\"}},\"issuer\":\"https://divoc.dev/\",\"issuanceDate\":\"2021-08-27T10:57:57.237Z\",\"evidence\":[{\"id\":\"https://divoc.dev/vaccine/undefined\",\"feedbackUrl\":\"https://divoc.dev/?undefined\",\"infoUrl\":\"https://divoc.dev/?undefined\",\"type\":[\"Vaccination\"],\"batch\":\"MB3428BX\",\"vaccine\":\"CoVax\",\"manufacturer\":\"COVPharma\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"dose\":\"\",\"totalDoses\":\"\",\"verifier\":{\"name\":\"Sooraj Singh\"},\"facility\":{\"name\":\"ABC Medical Center\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"Bengaluru\",\"addressRegion\":\"Karnataka\",\"addressCountry\":\"IN\",\"postalCode\":\"\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"Ed25519Signature2018\",\"created\":\"2021-08-27T10:57:57Z\",\"verificationMethod\":\"did:india\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..4Em2HzSFj0swnmZOfDro1NxAjKsndZlbs-rz2BvN9VJg1a4dYCJ0bKGvyJBcBYs7PnsxyS9TT73SPWVbKKYhBQ\"}}";
  const publicKey = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: CERTIFICATE_DID,
    type: 'Ed25519VerificationKey2018',
    controller: 'https://cowin.mohfw.gov.in/vaccine',
  };
  const controller = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: 'https://cowin.mohfw.gov.in/vaccine',
    publicKey: [publicKey],
    // this authorizes this key to be used for making assertions
    assertionMethod: [publicKey.id]
  };

  const purpose = new AssertionProofPurpose({
    controller: controller
  });
  const result = await vc.verifyCredential({
    credential: JSON.parse(signed),
    suite: new Ed25519Signature2018({key}),
    purpose: purpose,
    documentLoader: customLoader,
    compactProof: false
  });
  expect(result.verified).toBe(true);
});

test('Signed json to include certificate id', async () => {
  const certificateId = "123";
  sign = await signJSON(transformW3(cert2, certificateId));
  expect(sign.credentialSubject.id).toBe(cert2.recipient.identity);
  expect(sign.evidence[0].id).toBe(CERTIFICATE_BASE_URL + certificateId);
  expect(sign.evidence[0].certificateId).toBe(certificateId);
});