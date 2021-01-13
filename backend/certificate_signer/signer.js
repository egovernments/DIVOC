const jsigs = require('jsonld-signatures');
const config = require('./config/config');
const registry = require('./registry');
const {publicKeyPem, privateKeyPem} = require('./config/keys');
const R = require('ramda');
const {RsaSignature2018} = jsigs.suites;
const {AssertionProofPurpose} = jsigs.purposes;
const {RSAKeyPair} = require('crypto-ld');
const {documentLoaders} = require('jsonld');
const {node: documentLoader} = documentLoaders;
const {contexts} = require('security-context');
const {credentialsv1} = require('./credentials.json');
const {vaccinationContext} = require("vaccination-context");

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
    , "https://cowin.mofw.gov.in/credentials/vaccination/v1": vaccinationContext
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

function ageOfRecipient(recipient) {
  if (recipient.age) return recipient.age;
  if (recipient.dob && new Date(recipient.dob).getFullYear() > 1900)
    return (new Date().getFullYear() - new Date(recipient.dob).getFullYear())
  return "";
}

function transformW3(cert, certificateId) {
  const certificateFromTemplate = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://cowin.mofw.gov.in/credentials/vaccination/v1"
    ],
    type: ['VerifiableCredential', 'ProofOfVaccinationCredential'],
    credentialSubject: {
      type: "Person",
      id: cert.recipient.identity,
      name: cert.recipient.name,
      gender: cert.recipient.gender,
      age: ageOfRecipient(cert.recipient), //from dob
      nationality: cert.recipient.nationality,
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
    issuer: "https://nha.gov.in/",
    issuanceDate: new Date().toISOString(),
    evidence: [{
      "id": "https://nha.gov.in/evidence/vaccine/" + certificateId,
      "feedbackUrl": "https://divoc.xiv.in/feedback/" + certificateId,
      "infoUrl": "https://divoc.xiv.in/learn/" + certificateId,
      "certificateId": certificateId,
      "type": ["Vaccination"],
      "batch": cert.vaccination.batch,
      "vaccine": cert.vaccination.name,
      "manufacturer": cert.vaccination.manufacturer,
      "date": cert.vaccination.date,
      "effectiveStart": cert.vaccination.effectiveStart,
      "effectiveUntil": cert.vaccination.effectiveUntil,
      "dose": cert.vaccination.dose,
      "totalDoses": cert.vaccination.totalDoses,
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
          "addressCountry": cert.facility.address.country ? cert.facility.address.country : "IN",
          "postalCode": cert.facility.address.pincode
        },
        // "seal-image": "..."
      }
    }],
    "nonTransferable": "true"
  };
  return certificateFromTemplate;
}

async function signAndSave(certificate) {
  const certificateId = "" + Math.floor(1e8 + (Math.random() * 9e8));
  const name = certificate.recipient.name;
  const contact = certificate.recipient.contact;
  const mobile = getContactNumber(contact);
  const preEnrollmentCode = certificate.preEnrollmentCode;
  const w3cCertificate = transformW3(certificate, certificateId);
  const signedCertificate = await signJSON(w3cCertificate);
  const signedCertificateForDB = {
    name: name,
    contact: contact,
    mobile: mobile,
    preEnrollmentCode: preEnrollmentCode,
    certificateId: certificateId,
    certificate: JSON.stringify(signedCertificate),
    meta: certificate["meta"]
  };
  return registry.saveCertificate(signedCertificateForDB)
}

function getContactNumber(contact) {
  return contact.find(value => /^tel/.test(value)).split(":")[1];
}

module.exports = {
  signAndSave,
  signJSON,
  transformW3,
  customLoader
};
