const jsigs = require('jsonld-signatures');
const config = require('./config/config');
const registry = require('./registry');
const {publicKeyPem, privateKeyPem} = require('./config/keys');

const {RsaSignature2018} = jsigs.suites;
const {AssertionProofPurpose} = jsigs.purposes;
const {RSAKeyPair} = require('crypto-ld');
const {documentLoaders} = require('jsonld');
const {node: documentLoader} = documentLoaders;
const {contexts} = require('security-context');
const {credentialsv1} = require('./credentials');
const {vaccinationv1} = require('./vaccinationv1');

const publicKey = {
  '@context': jsigs.SECURITY_CONTEXT_URL,
  id: 'did:india',
  type: 'RsaVerificationKey2018',
  controller: 'https://example.com/i/india',
  publicKeyPem
};

const customLoader = url => {
  console.log("checking " + url);
  const c = {
    "did:india": publicKey,
    "https://example.com/i/india": publicKey,
    "https://w3id.org/security/v1": contexts.get("https://w3id.org/security/v1"),
    'https://www.w3.org/2018/credentials#': credentialsv1,
    "https://www.w3.org/2018/credentials/v1": credentialsv1
    , "https://www.who.int/2020/credentials/vaccination/v1": vaccinationv1
  };
  let context = c[url];
  if (context === undefined) {
    context = contexts[url];
  }
  if (context !== undefined) {
    return {
      contextUrl: null,
      documentUrl: url,
      document: context
    };
  }
  if (url.startsWith("{")) {
    return JSON.parse(url);
  }
  return documentLoader()(url);
};


async function signJSON(certificate) {

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

  const key = new RSAKeyPair({...publicKey, privateKeyPem});

  const signed = await jsigs.sign(certificate, {
    documentLoader: customLoader,
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({
      controller: controller
    }),
    compactProof: true
  });

  console.info("Signed cert " + JSON.stringify(signed));
  return signed;
}

function transformW3(cert) {
  const certificateFromTemplate = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.who.int/2020/credentials/vaccination/v1"
    ],
    type: ['VerifiableCredential', 'ProofOfVaccinationCredential'],
    credentialSubject: {
      type: "Person",
      id: cert.recipient.identity,
      name: cert.recipient.name,
      gender: cert.recipient.gender,
      age: cert.recipient.age, //from dob
      nationality: cert.recipient.nationality
    },
    issuer: "https://nha.gov.in/",
    issuanceDate: new Date().toISOString().toLowerCase(),
    evidence: [{
      "id": "https://nha.gov.in/evidence/vaccine/1234",
      "type": ["Vaccination"],
      "batch": cert.vaccination.batch,
      "manufacturer": cert.vaccination.manufacturer,
      "date": cert.vaccination.date,
      "effectiveStart": cert.vaccination.effectiveStart,
      "effectiveUntil": cert.vaccination.effectiveUntil,
      "verifier": {
        // "id": "https://nha.gov.in/evidence/vaccinator/" + cert.vaccinator.id,
        "name": cert.vaccinator.name,
        // "sign-image": "..."
      },
      "facility": {
        // "id": "https://nha.gov.in/evidence/facilities/" + cert.facility.id,
        "name": cert.facility.name,
        "address": {
          "streetAddress": cert.facility.address.addressLine1,
          "streetAddress2": cert.facility.address.addressLine2,
          "district": cert.facility.address.district,
          "city": cert.facility.address.city,
          "addressRegion": cert.facility.address.state,
          "addressCountry": cert.facility.address.country?cert.facility.address.country:"IN",
          "postalCode": cert.facility.address.pin
        },
        // "seal-image": "..."
      }
    }],
    "nonTransferable": "true"
  };
  return certificateFromTemplate;
}

async function signAndSave(certificate) {
  const name = certificate.recipient.name;
  const contact = certificate.recipient.contact;
  const w3cCertificate = transformW3(certificate);
  const signedCertificate = await signJSON(w3cCertificate);
  const signedCertificateForDB = {
    name : name,
    contact: contact,
    certificateId: "" + Math.floor(1e8 + (Math.random() * 9e8)),
    certificate: JSON.stringify(signedCertificate)
  };
  registry.saveCertificate(signedCertificateForDB)
}

module.exports = {
  signAndSave,
  signJSON,
  transformW3,
  customLoader
};