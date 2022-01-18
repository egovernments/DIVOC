const {
  CERTIFICATE_DID,
  CERTIFICATE_NAMESPACE,
  CERTIFICATE_NAMESPACE_V2,
  CERTIFICATE_ISSUER,
  CERTIFICATE_BASE_URL,
  CERTIFICATE_FEEDBACK_BASE_URL,
  CERTIFICATE_INFO_BASE_URL,
  IDENTITY_REJECTION_PATTERN,
  ENABLE_FEEDBACK_URL
} = require ("./config/config");
const {Kafka} = require('kafkajs');
const fs = require('fs');
const config = require('./config/config');
const constants = require("./config/constants");
const R = require('ramda');
const {vaccinationContext, vaccinationContextV2} = require("vaccination-context");
const signer = require('certificate-signer-library');
const Mustache = require("mustache");
const {publicKeyPem, privateKeyPem, signingKeyType} = require('./config/keys');
const identityRejectionRegex = new RegExp(IDENTITY_REJECTION_PATTERN);

console.log('Using ' + config.KAFKA_BOOTSTRAP_SERVER);
console.log('Using ' + publicKeyPem);

// Overriding escape function to not escape any values
// This should not have any security issues as its not executed
// we convert the json to string and store it.
Mustache.escape = function (value)
{
  return value;
};

const CERTIFICATE_TYPE_V2 = "certifyV2";
const CERTIFICATE_TYPE_V3 = "certifyV3";

const TEMPLATES_FOLDER = __dirname +'/config/templates/';
const DDCC_TEMPLATE_FILEPATH = TEMPLATES_FOLDER+"ddcc_w3c_certificate_payload.template";
const W3C_TEMPLATE_FILEPATH = TEMPLATES_FOLDER+"w3c_certificate_payload.template";

const kafka = new Kafka({
  clientId: 'divoc-cert',
  brokers: config.KAFKA_BOOTSTRAP_SERVER.split(",")
});

const consumer = kafka.consumer({ groupId: 'certificate_signer', sessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT });
const producer = kafka.producer({allowAutoTopicCreation: true});

let signingConfig = {
  publicKeyPem: publicKeyPem,
  privateKeyPem: privateKeyPem,
  publicKeyBase58: publicKeyPem,
  privateKeyBase58: privateKeyPem,
  keyType: signingKeyType,
  KAFKA_BOOTSTRAP_SERVER: config.KAFKA_BOOTSTRAP_SERVER,
  KAFKA_CONSUMER_SESSION_TIMEOUT: config.KAFKA_CONSUMER_SESSION_TIMEOUT,
  REGISTRY_URL: config.REGISTRY_URL,
  REGISTRY_CERTIFICATE_SCHEMA: config.REGISTRY_CERTIFICATE_SCHEMA,
  REDIS_ENABLED: config.REDIS_ENABLED,
  REDIS_URL: config.REDIS_URL,
  REDIS_KEY_EXPIRE: config.REDIS_KEY_EXPIRE,

  CERTIFICATE_NAMESPACE: config.CERTIFICATE_NAMESPACE,
  CERTIFICATE_CONTROLLER_ID: config.CERTIFICATE_CONTROLLER_ID,
  CERTIFICATE_DID: config.CERTIFICATE_DID,
  CERTIFICATE_PUBKEY_ID: config.CERTIFICATE_PUBKEY_ID,
  CERTIFICATE_ISSUER: config.CERTIFICATE_ISSUER,
  CERTIFICATE_BASE_URL: config.CERTIFICATE_BASE_URL,
  CERTIFICATE_FEEDBACK_BASE_URL: config.CERTIFICATE_FEEDBACK_BASE_URL,
  CERTIFICATE_INFO_BASE_URL: config.CERTIFICATE_INFO_BASE_URL,

  CERTIFY_TOPIC: config.CERTIFY_TOPIC,
  CERTIFIED_TOPIC: config.CERTIFIED_TOPIC,
  ENABLE_CERTIFY_ACKNOWLEDGEMENT: config.ENABLE_CERTIFY_ACKNOWLEDGEMENT,
  ERROR_CERTIFICATE_TOPIC: config.ERROR_CERTIFICATE_TOPIC,
  CERTIFICATE_RETRY_COUNT: config.CERTIFICATE_RETRY_COUNT,
  DUPLICATE_CERTIFICATE_TOPIC: config.DUPLICATE_CERTIFICATE_TOPIC,
  CERTIFICATE_ACK_TOPIC: config.CERTIFICATE_ACK_TOPIC,

};

const documentLoader = {};
documentLoader[CERTIFICATE_NAMESPACE] = vaccinationContext;
documentLoader[CERTIFICATE_NAMESPACE_V2] = vaccinationContextV2;

(async function() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({topic: config.CERTIFY_TOPIC, fromBeginning: true});

  await signer.init_signer(signingConfig, transformW3, documentLoader);

  await consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      console.time("certify");
      console.log({
        value: message.value.toString(),
        uploadId: message.headers.uploadId ? message.headers.uploadId.toString():'',
        rowId: message.headers.rowId ? message.headers.rowId.toString():'',
      });
      let jsonMessage = {};
      try {
        jsonMessage = JSON.parse(message.value.toString());
        const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], jsonMessage);
        const currentDose = R.pathOr("", ["vaccination", "dose"], jsonMessage);
        const programId = R.pathOr("", ["programId"], jsonMessage);
        const enablePid = JSON.parse(config.ENABLE_PROGRAM_ID_CACHING_KEY)
        if (preEnrollmentCode === "" || currentDose === "" || (enablePid && programId === "")) {
          throw Error("Required parameters not available")
        }
        const key = enablePid ? `${preEnrollmentCode}-${programId}-${currentDose}` : `${preEnrollmentCode}-${currentDose}`;
        await signer.signCertificate(jsonMessage, message.headers, key);
      } catch (e) {
        // const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], jsonMessage);
        // const currentDose = R.pathOr("", ["vaccination", "dose"], jsonMessage);
        // if (preEnrollmentCode !== "" && currentDose !== "") {
        //   redis.deleteKey(`${preEnrollmentCode}-${currentDose}`) //if retry fails it clears the key -
        // }
        console.error("ERROR: " + e.message)
        await producer.send({
          topic: config.ERROR_CERTIFICATE_TOPIC,
          messages: [{key: null, value: JSON.stringify({message: message.value.toString(), error: e.message})}]
        });
      }
      console.timeEnd("certify");
    },
  })
})();

function populateIdentity(cert, preEnrollmentCode) {
  let identity = R.pathOr('', ['recipient', 'identity'], cert);
  let isURI  = isURIFormat(identity);
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

function render(template, data) {
  return JSON.parse(Mustache.render(template, data))
}

function transformW3(cert, certificateId) {
  const certificateType = R.pathOr('', ['meta', 'certificateType'], cert);

  const namespace = certificateType === CERTIFICATE_TYPE_V3 ? CERTIFICATE_NAMESPACE_V2 : CERTIFICATE_NAMESPACE;
  const preEnrollmentCode = R.pathOr('', ['preEnrollmentCode'], cert);
  const recipientIdentifier = populateIdentity(cert, preEnrollmentCode);
  const recipientName = R.pathOr('', ['recipient', 'name'], cert);
  const recipientGender = R.pathOr('', ['recipient', 'gender'], cert);
  const recipientNationality = R.pathOr('', ['recipient', 'nationality'], cert);
  const recipientAge = ageOfRecipient(cert.recipient); //from dob
  const recipientDob = dobOfRecipient(cert.recipient);
  const recipientAddressLine1 = R.pathOr('', ['recipient', 'address', 'addressLine1'], cert);
  const recipientAddressLine2 = R.pathOr('', ['recipient', 'address', 'addressLine2'], cert);
  const recipientAddressDistrict = R.pathOr('', ['recipient', 'address', 'district'], cert);
  const recipientAddressCity = R.pathOr('', ['recipient', 'address', 'city'], cert);
  const recipientAddressRegion = R.pathOr('', ['recipient', 'address', 'state'], cert);
  const recipientAddressCountry = R.pathOr('', ['recipient', 'address', 'country'], cert);
  const recipientAddressPostalCode = R.pathOr('', ['recipient', 'address', 'pincode'], cert);

  const issuer = CERTIFICATE_ISSUER;
  const issuanceDate = new Date().toISOString();

  const evidenceId = CERTIFICATE_BASE_URL + certificateId;
  const InfoUrl = CERTIFICATE_INFO_BASE_URL + certificateId;
  const feedbackUrl = CERTIFICATE_FEEDBACK_BASE_URL + certificateId;

  const batch = R.pathOr('', ['vaccination', 'batch'], cert);
  const vaccine = R.pathOr('', ['vaccination', 'name'], cert);
  const icd11Code = vaccine ? constants.VACCINE_ICD11_MAPPINGS.filter(a => vaccine.toLowerCase().includes(a.vaccineName)).map(a => a.icd11Code)[0]: '';
  const prophylaxis = icd11Code ? constants.ICD11_MAPPINGS[icd11Code]["icd11Term"]: '';
  const manufacturer = R.pathOr('', ['vaccination', 'manufacturer'], cert);
  const vaccinationDate = R.pathOr('', ['vaccination', 'date'], cert);
  const effectiveStart = R.pathOr('', ['vaccination', 'effectiveStart'], cert);
  const effectiveUntil = R.pathOr('', ['vaccination', 'effectiveUntil'], cert);
  const dose = R.pathOr('', ['vaccination', 'dose'], cert);
  const totalDoses = R.pathOr('', ['vaccination', 'totalDoses'], cert);
  const verifierName = R.pathOr('', ['vaccinator', 'name'], cert);
  const facilityName = R.pathOr('', ['facility', 'name'], cert);
  const facilityAddressLine1 = R.pathOr('', ['facility', 'address', 'addressLine1'], cert);
  const facilityAddressLine2 = R.pathOr('', ['facility', 'address', 'addressLine2'], cert);
  const facilityAddressDistrict = R.pathOr('', ['facility', 'address', 'district'], cert);
  const facilityAddressCity = R.pathOr('', ['facility', 'address', 'city'], cert);
  const facilityAddressRegion = R.pathOr('', ['facility', 'address', 'state'], cert);
  const facilityAddressCountry = R.pathOr(config.FACILITY_COUNTRY_CODE, ['facility', 'address', 'country'], cert);
  const facilityAddressPostalCode = R.pathOr('', ['facility', 'address', 'pincode'], cert);

  let data = {
    namespace, recipientIdentifier, preEnrollmentCode, recipientName, recipientGender, recipientDob, recipientAge, recipientNationality,
    recipientAddressLine1, recipientAddressLine2, recipientAddressDistrict, recipientAddressCity, recipientAddressRegion, recipientAddressCountry, recipientAddressPostalCode,
    issuer, issuanceDate, evidenceId, InfoUrl, feedbackUrl,
    certificateId, batch, vaccine, icd11Code,  prophylaxis, manufacturer, vaccinationDate, effectiveStart, effectiveUntil, dose, totalDoses,
    verifierName,
    facilityName, facilityAddressLine1, facilityAddressLine2, facilityAddressDistrict, facilityAddressCity, facilityAddressRegion, facilityAddressCountry, facilityAddressPostalCode
  };

  const template = certificateType === CERTIFICATE_TYPE_V3 ? fs.readFileSync(DDCC_TEMPLATE_FILEPATH, 'utf8') : fs.readFileSync(W3C_TEMPLATE_FILEPATH, 'utf8');
  return render(template, data);
}
