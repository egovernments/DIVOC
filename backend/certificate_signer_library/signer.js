const jsigs = require('jsonld-signatures');
const registry = require('./registry');
const R = require('ramda');
const {RsaSignature2018} = jsigs.suites;
const {Ed25519Signature2018} = jsigs.suites;
const {Ed25519KeyPair} = require('crypto-ld');
const {AssertionProofPurpose} = jsigs.purposes;
const {RSAKeyPair} = require('crypto-ld');
const {documentLoaders} = require('jsonld');
const {node: documentLoader} = documentLoaders;
const {contexts} = require('security-context');
const credentialsv1 = require('./credentials.json');
const redis = require('./redis');
const vc = require('vc-js');

const UNSUCCESSFUL = "UNSUCCESSFUL";
const SUCCESSFUL = "SUCCESSFUL";
const DUPLICATE_MSG = "duplicate key value violates unique constraint";

let documentLoaderMapping = {"https://w3id.org/security/v1" : contexts.get("https://w3id.org/security/v1")};
documentLoaderMapping['https://www.w3.org/2018/credentials#'] = credentialsv1;
documentLoaderMapping["https://www.w3.org/2018/credentials/v1"] = credentialsv1;

let publicKey = {};
let controller = {};
let privateKeyPem = '';
let maxRetrycount = 0;
let certificateDID = '';
let publicKeyBase58 = '';
let privateKeyBase58 = '';
const KeyType = {
  RSA: "RSA",
  ED25519: "ED25519"
};
let signingKeyType = KeyType.RSA;

const getPublicKey = (config) => {
  switch(config.keyType) {
    case KeyType.RSA:
      return {
        '@context': jsigs.SECURITY_CONTEXT_URL,
        id: config.CERTIFICATE_DID,
        type: 'RsaVerificationKey2018',
        controller: config.CERTIFICATE_PUBKEY_ID,
        publicKeyPem: config.publicKeyPem
      };
    case KeyType.ED25519: 
      return {
        '@context': jsigs.SECURITY_CONTEXT_URL,
        id: config.CERTIFICATE_DID,
        type: 'Ed25519VerificationKey2018',
        controller: config.CERTIFICATE_PUBKEY_ID
      }
  }
}

const setDocumentLoader = (customLoaderMapping, config) => {
    privateKeyPem = config.privateKeyPem;
    maxRetrycount = config.CERTIFICATE_RETRY_COUNT;
    signingKeyType = config?.keyType || KeyType.RSA;
    publicKey = getPublicKey(config);
    controller = {
        '@context': jsigs.SECURITY_CONTEXT_URL,
        id: config.CERTIFICATE_CONTROLLER_ID,
        publicKey: [publicKey],
        // this authorizes this key to be used for making assertions
        assertionMethod: [publicKey.id]
    };
    documentLoaderMapping[config.CERTIFICATE_DID] = publicKey;
    documentLoaderMapping[config.CERTIFICATE_PUBKEY_ID] = publicKey;
    documentLoaderMapping = {...documentLoaderMapping, ...customLoaderMapping}
    certificateDID = config.CERTIFICATE_DID;
    publicKeyBase58 = config?.publicKeyBase58 || '';
    privateKeyBase58 = config?.privateKeyBase58 || '';
};

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
  let signed = "";
  if(signingKeyType === KeyType.RSA) {
    const key = new RSAKeyPair({...publicKey, privateKeyPem});

    signed = await jsigs.sign(certificate, {
      documentLoader: customLoader,
      suite: new RsaSignature2018({key}),
      purpose: new AssertionProofPurpose({
        controller: controller
      }),
      compactProof: false
    });
  } else if (signingKeyType === KeyType.ED25519) {
    const key = new Ed25519KeyPair(
        {
            publicKeyBase58: publicKeyBase58,
            privateKeyBase58: privateKeyBase58,
            id: certificateDID
        }
    );
    const purpose = new AssertionProofPurpose({
        controller: controller
    });

    signed = await vc.issue({
        credential: certificate,
        suite: new Ed25519Signature2018({key}),
        purpose: purpose,
        documentLoader: customLoader,
        compactProof: false
    });
  }
  console.info("Signed cert " + JSON.stringify(signed));

  return signed;
}

async function signAndSave(certificate, transformW3, redisUniqueKey, retryCount = 0) {
  const certificateId = "" + Math.floor(1e8 + (Math.random() * 9e8));
  const name = certificate.recipient.name;
  const contact = certificate.recipient.contact;
  const mobile = getContactNumber(contact);
  const preEnrollmentCode = certificate.preEnrollmentCode;
  const w3cCertificate = transformW3(certificate, certificateId);
  const signedCertificate = await signJSON(w3cCertificate);
  const programId = certificate["programId"] || "";
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
    if (retryCount <= maxRetrycount) {
      console.error("Duplicate certificate id found, retrying attempt " + retryCount + " of " + maxRetrycount);
      return await signAndSave(certificate, transformW3, redisUniqueKey, retryCount + 1)
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
  customLoader,
  setDocumentLoader,
  KeyType
};
