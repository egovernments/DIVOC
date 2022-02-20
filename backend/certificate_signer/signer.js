const {CERTIFICATE_CONTROLLER_ID,
  CERTIFICATE_DID,
  CERTIFICATE_NAMESPACE,
  CERTIFICATE_ISSUER,
  CERTIFICATE_BASE_URL,
  CERTIFICATE_FEEDBACK_BASE_URL,
  CERTIFICATE_INFO_BASE_URL,
  CERTIFICATE_PUBKEY_ID,
  IDENTITY_REJECTION_PATTERN
} = require ("./config/config");

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
const credentialsv1 = require('./credentials.json');
const {vaccinationContext} = require("vaccination-context");
const redis = require('./redis');

const UNSUCCESSFUL = "UNSUCCESSFUL";
const SUCCESSFUL = "SUCCESSFUL";
const DUPLICATE_MSG = "duplicate key value violates unique constraint";

const publicKey = {
  '@context': jsigs.SECURITY_CONTEXT_URL,
  id: CERTIFICATE_DID,
  type: 'RsaVerificationKey2018',
  controller: CERTIFICATE_PUBKEY_ID,
  publicKeyPem
};
const identityRejectionRegex = new RegExp(IDENTITY_REJECTION_PATTERN);
const documentLoaderMapping = {"https://w3id.org/security/v1" : contexts.get("https://w3id.org/security/v1")};
documentLoaderMapping[CERTIFICATE_DID] = publicKey;
documentLoaderMapping[CERTIFICATE_PUBKEY_ID] = publicKey;
documentLoaderMapping['https://www.w3.org/2018/credentials#'] = credentialsv1;
documentLoaderMapping["https://www.w3.org/2018/credentials/v1"] = credentialsv1;
documentLoaderMapping[CERTIFICATE_NAMESPACE] = vaccinationContext;

const customLoader = url => {
  console.log("checking " + url);
  let context = documentLoaderMapping[url];
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
  console.log("Fallback url lookup for document :" + url);
  return documentLoader()(url);
};


async function signJSON(certificate) {

  const publicKey = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: CERTIFICATE_DID,
    type: 'RsaVerificationKey2018',
    controller: CERTIFICATE_CONTROLLER_ID,
    publicKeyPem
  };
  const controller = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: CERTIFICATE_CONTROLLER_ID,
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
    compactProof: false
  });

  console.info("Signed cert " + JSON.stringify(signed));
  return signed;
}

function ageOfRecipient(recipient) {
  if (recipient.age) return recipient.age;
  if (recipient.dob && new Date(recipient.dob).getFullYear() > 1900)
    return "" + (new Date().getFullYear() - new Date(recipient.dob).getFullYear())
  return "";
}

function populateIdentity(cert, preEnrollmentCode) {
  let identity = R.pathOr('', ['recipient', 'identity'], cert);
  let isURI  = isURIFormat(identity);
  console.log("isURL: "+isURI);
  return isURI ? identity : reinitIdentityFromPayload(identity, preEnrollmentCode);
}

function isURIFormat(param) {
  let parsed;
  let isURI;
  try {
    parsed = new URL(param);
    isURI = true;
  } catch (e) {
    isURI = false;
  }

  if (isURI && !parsed.protocol) {
    isURI = false;
  }
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

function transformW3(cert, certificateId) {
  const certificateFromTemplate = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      CERTIFICATE_NAMESPACE,
    ],
    type: ['VerifiableCredential', 'ProofOfVaccinationCredential'],
    credentialSubject: {
      type: "Person",
      id: populateIdentity(cert, R.pathOr('', ['preEnrollmentCode'], cert)),
      refId: R.pathOr('', ['preEnrollmentCode'], cert),
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
        "addressCountry": R.pathOr('LKA', ['recipient', 'address', 'country'], cert),
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
          "addressCountry": R.pathOr('LKA', ['facility', 'address', 'country'], cert),
          "postalCode": R.pathOr('', ['facility', 'address', 'pincode'], cert)
        },
      }
    }],
    "nonTransferable": "true"
  };
  return certificateFromTemplate;
}

async function signAndSave(certificate, retryCount = 0) {
  const certificateId = "" + Math.floor(1e8 + (Math.random() * 9e8));
  const name = certificate.recipient.name;
  const contact = certificate.recipient.contact;
  const mobile = getContactNumber(contact);
  const preEnrollmentCode = certificate.preEnrollmentCode;
  const currentDose = certificate.vaccination.dose;
  const w3cCertificate = transformW3(certificate, certificateId);
  const signedCertificate = await signJSON(w3cCertificate);
  const programId = certificate["programId"];
  const signedCertificateForDB = {
    name: name,
    contact: contact,
    mobile: mobile,
    preEnrollmentCode: preEnrollmentCode,
    certificateId: certificateId,
    certificate: JSON.stringify(signedCertificate),
    programId: programId,
    meta: certificate["meta"]
  };
  const resp = await registry.saveCertificate(signedCertificateForDB);
  if (R.pathOr("", ["data", "params", "status"], resp) === UNSUCCESSFUL && R.pathOr("", ["data", "params", "errmsg"], resp).includes(DUPLICATE_MSG)) {
    if (retryCount <= config.CERTIFICATE_RETRY_COUNT) {
      console.error("Duplicate certificate id found, retrying attempt " + retryCount + " of " + config.CERTIFICATE_RETRY_COUNT);
      return await signAndSave(certificate, retryCount + 1)
    } else {
      console.error("Max retry attempted");
      throw new Error(resp.data.params.errmsg)
    }
  }
  resp.signedCertificate = signedCertificateForDB;
  if (R.pathOr("", ["data", "params", "status"], resp) === SUCCESSFUL){
    redis.storeKeyWithExpiry(`${preEnrollmentCode}-${programId}-${currentDose}`, certificateId)
  }
  return resp;
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
