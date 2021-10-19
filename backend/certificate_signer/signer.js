const jsigs = require('jsonld-signatures');
const config = require('./config/config');
const constants = require('./config/constants');
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
const {vaccinationContext, vaccinationContextV2} = require("vaccination-context");
const redis = require('./redis');
const {DEFAULT_TOTAL_DOSES_COUNT} = require("./config/config");

const UNSUCCESSFUL = "UNSUCCESSFUL";
const SUCCESSFUL = "SUCCESSFUL";
const DUPLICATE_MSG = "duplicate key value violates unique constraint";

const CERTIFICATE_TYPE_V2 = "certifyV2";
const CERTIFICATE_TYPE_V3 = "certifyV3";

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
    "https://www.w3.org/2018/credentials/v1": credentialsv1,
    "https://cowin.gov.in/credentials/vaccination/v1": vaccinationContext,
    "https://cowin.gov.in/credentials/vaccination/v2": vaccinationContextV2,
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
  console.log("Fallback url lookup for document :" + url)
  return documentLoader()(url);
};


async function signJSON(certificate) {

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

function identityOfSubject(cert) {
  let identity = R.pathOr('', ['recipient', 'identity'], cert);
  let parts = identity.split(":");
  if (parts.length >= 2 && parts[0] === "did") {
    parts[1] = parts[1].replaceAll(" ", "").toLowerCase();
    return parts.join(":")
  }
  return identity;
}

function transformW3(cert, certificateId, certificateType) {
  let certificateFromTemplate = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://cowin.gov.in/credentials/vaccination/v1"
    ],
    type: ['VerifiableCredential', 'ProofOfVaccinationCredential'],
    credentialSubject: {
      type: "Person",
      id: identityOfSubject(cert),
      refId: R.pathOr('', ['preEnrollmentCode'], cert),
      name: R.pathOr('', ['recipient', 'name'], cert),
      uhid: R.pathOr('', ['recipient', 'uhid'], cert),
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
        "postalCode": R.pathOr("", ['recipient', 'address', 'pincode'], cert),
      }
    },
    issuer: "https://cowin.gov.in/",
    issuanceDate: new Date().toISOString(),
    evidence: [{
      "id": "https://cowin.gov.in/vaccine/" + certificateId,
      "feedbackUrl": "https://cowin.gov.in/?" + certificateId,
      "infoUrl": "https://cowin.gov.in/?" + certificateId,
      "certificateId": certificateId,
      "type": ["Vaccination"],
      "batch": R.pathOr('', ['vaccination', 'batch'], cert),
      "vaccine": R.pathOr('', ['vaccination', 'name'], cert),
      "manufacturer": R.pathOr('', ['vaccination', 'manufacturer'], cert),
      "date": R.pathOr('', ['vaccination', 'date'], cert),
      "effectiveStart": R.pathOr('', ['vaccination', 'effectiveStart'], cert),
      "effectiveUntil": R.pathOr('', ['vaccination', 'effectiveUntil'], cert),
      "dose": R.pathOr('', ['vaccination', 'dose'], cert),
      // TODO: get default count
      "totalDoses": R.pathOr(parseInt(DEFAULT_TOTAL_DOSES_COUNT), ['vaccination', 'totalDoses'], cert),
      "verifier": {
        // "id": "https://nha.gov.in/evidence/vaccinator/" + cert.vaccinator.id,
        "name": R.pathOr('', ['vaccinator', 'name'], cert),
        // "sign-image": "..."
      },
      "facility": {
        // "id": "https://nha.gov.in/evidence/facilities/" + cert.facility.id,
        "name": R.pathOr('', ['facility', 'name'], cert),
        "address": {
          "streetAddress": R.pathOr('', ['facility', 'address', 'addressLine1'], cert),
          "streetAddress2": R.pathOr('', ['facility', 'address', 'addressLine2'], cert),
          "district": R.pathOr('', ['facility', 'address', 'district'], cert),
          "city": R.pathOr('', ['facility', 'address', 'city'], cert),
          "addressRegion": R.pathOr('', ['facility', 'address', 'state'], cert),
          "addressCountry": R.pathOr('IN', ['facility', 'address', 'country'], cert),
          "postalCode": R.pathOr("", ['facility', 'address', 'pincode'], cert)
        },
        // "seal-image": "..."
      }
    }],
    "nonTransferable": "true"
  };
  if (certificateType === CERTIFICATE_TYPE_V3) {
    const vaccineName = R.pathOr('', ['vaccination', 'name'], cert);
    const icd11Code = vaccineName ? constants.VACCINE_ICD11_MAPPINGS[vaccineName.toUpperCase().replace(/ /g, "_")].icd11Code: '';
    const prophylaxis = icd11Code ? constants.ICD11_MAPPINGS[icd11Code]["icd11Term"]: '';
    // update context
    certificateFromTemplate["@context"] = [
      "https://www.w3.org/2018/credentials/v1",
      "https://cowin.gov.in/credentials/vaccination/v2"
    ];

    // dob
    certificateFromTemplate["credentialSubject"] = {
      ...certificateFromTemplate["credentialSubject"],
      "dob": R.pathOr('', ['recipient', 'dob'], cert),
    };

    // icd11code
    certificateFromTemplate["evidence"][0] = {
      ...certificateFromTemplate["evidence"][0],
      "icd11Code": icd11Code ? icd11Code: '',
      "prophylaxis": prophylaxis ? prophylaxis: '',
    };

    // country code
    certificateFromTemplate["credentialSubject"]["address"] = {
      ...certificateFromTemplate["credentialSubject"]["address"],
      "addressCountry": "IND"
    };
    certificateFromTemplate["evidence"][0]["facility"]["address"] = {
      ...certificateFromTemplate["evidence"][0]["facility"]["address"],
      "addressCountry": "IND"
    }
  }
  return certificateFromTemplate;
}

async function signAndSave(certificate, certificateType, retryCount = 0) {
  const certificateId = "" + Math.floor(1e10 + (Math.random() * 9e10));
  const name = certificate.recipient.name;
  const contact = certificate.recipient.contact;
  const mobile = getContactNumber(contact);
  const preEnrollmentCode = certificate.preEnrollmentCode;
  const currentDose = certificate.vaccination.dose;
  const w3cCertificate = transformW3(certificate, certificateId, certificateType);
  const signedCertificate = await signJSON(w3cCertificate);
  const signedCertificateForDB = {
    name: name,
    contact: contact,
    mobile: mobile,
    preEnrollmentCode: preEnrollmentCode,
    certificateId: certificateId,
    certificate: JSON.stringify(signedCertificate),
    dose: currentDose
  };
  let resp = await registry.saveCertificate(signedCertificateForDB);
  if (R.pathOr("", ["data", "params", "status"], resp) === UNSUCCESSFUL && R.pathOr("", ["data", "params", "errmsg"], resp).includes(DUPLICATE_MSG)) {
    if (retryCount <= config.CERTIFICATE_RETRY_COUNT) {
      console.error("Duplicate certificate id found, retrying attempt " + retryCount + " of " + config.CERTIFICATE_RETRY_COUNT);
      return await signAndSave(certificate, certificateType, retryCount + 1)
    } else {
      console.error("Max retry attempted");
      throw new Error(resp.data.params.errmsg)
    }
  }
  if (R.pathOr("", ["data", "params", "status"], resp) === SUCCESSFUL){
    redis.storeKeyWithExpiry(`${preEnrollmentCode}-${currentDose}`, certificateId)
    redis.storeKeyWithExpiry(`${preEnrollmentCode}-cert`, signedCertificateForDB.certificate)
  }
  resp.signedCertificate = {
    ...signedCertificateForDB,
    certificate: signedCertificate,
    meta: certificate["meta"]
  };
  return resp;
}

function getContactNumber(contact) {
  return contact.find(value => /^tel/.test(value)).split(":")[1];
}

module.exports = {
  signAndSave,
  signJSON,
  transformW3,
  customLoader,
  identityOfSubject,
  CERTIFICATE_TYPE_V2,
  CERTIFICATE_TYPE_V3
};
