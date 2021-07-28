const {CERTIFICATE_CONTROLLER_ID,
  CERTIFICATE_DID,
  CERTIFICATE_NAMESPACE,
  CERTIFICATE_PUBKEY_ID
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

let documentLoaderMapping = {"https://w3id.org/security/v1" : contexts.get("https://w3id.org/security/v1")};
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

async function signAndSave(certificate, transformW3, redisUniqueKey, customLoaderMapping = {}, retryCount = 0) {
  documentLoaderMapping = {...documentLoaderMapping, ...customLoaderMapping};
  const certificateId = "" + Math.floor(1e8 + (Math.random() * 9e8));
  const name = certificate.recipient.name;
  const contact = certificate.recipient.contact;
  const mobile = getContactNumber(contact);
  const preEnrollmentCode = certificate.preEnrollmentCode;
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
      return await signAndSave(certificate, transformW3, redisUniqueKey, customLoaderMapping, retryCount + 1)
    } else {
      console.error("Max retry attempted");
      throw new Error(resp.data.params.errmsg)
    }
  }
  resp.signedCertificate = signedCertificateForDB;
  if (R.pathOr("", ["data", "params", "status"], resp) === SUCCESSFUL){
    redis.storeKeyWithExpiry(redisUniqueKey, certificateId)
  }
  return resp;
}

function getContactNumber(contact) {
  return contact.find(value => /^tel/.test(value)).split(":")[1];
}

module.exports = {
  signAndSave,
  signJSON,
  customLoader
};
