const {
  CERTIFICATE_DID,
  CERTIFICATE_NAMESPACE,
  CERTIFICATE_NAMESPACE_V2,
  CERTIFICATE_ISSUER,
  CERTIFICATE_BASE_URL,
  CERTIFICATE_FEEDBACK_BASE_URL,
  CERTIFICATE_INFO_BASE_URL,
  IDENTITY_REJECTION_PATTERN,
  FACILITY_COUNTRY_CODE,
  ENABLE_FEEDBACK_URL
} = require ("./config/config");
const {Kafka} = require('kafkajs');
const fs = require('fs');
const config = require('./config/config');
const configuration_service = require('./configuration_service');
const R = require('ramda');
const {vaccinationContext, vaccinationContextV2} = require("vaccination-context");
const signer = require('certificate-signer-library');
const Mustache = require("mustache");
const {publicKeyPem, privateKeyPem, signingKeyType} = require('./config/keys');
const identityRejectionRegex = new RegExp(IDENTITY_REJECTION_PATTERN);
const {CONFIG_KEYS} = require('./config/constants');
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

let DDCC_TEMPLATE;
let W3C_TEMPLATE;

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

let ICD11_MAPPINGS;
let VACCINE_ICD11_MAPPINGS;
let certificateFieldsKeyPath;
let configLayerObj;
const documentLoader = {};
documentLoader[CERTIFICATE_NAMESPACE] = vaccinationContext;
documentLoader[CERTIFICATE_NAMESPACE_V2] = vaccinationContextV2;

(async function() {
  configuration_service.init();
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({topic: config.CERTIFY_TOPIC, fromBeginning: true});
  await signer.init_signer(signingConfig, transformW3, documentLoader);
  configLayerObj = new configuration_service.ConfigLayer();
  await consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      console.time("certify");
      console.log({
        value: message.value.toString(),
        uploadId: message.headers.uploadId ? message.headers.uploadId.toString():'',
        rowId: message.headers.rowId ? message.headers.rowId.toString():'',
      });
      ICD11_MAPPINGS = JSON.parse(await configLayerObj.getConfigValue(CONFIG_KEYS.ICD));
      VACCINE_ICD11_MAPPINGS = JSON.parse( await configLayerObj.getConfigValue(CONFIG_KEYS.VACCINE_ICD));
      certificateFieldsKeyPath = JSON.parse(await configLayerObj.getConfigValue(CONFIG_KEYS.CERTIFICATES_OPTIONAL_FIELDS_KEY_PATH));
      DDCC_TEMPLATE = await configLayerObj.getConfigValue(CONFIG_KEYS.DDCC_TEMPLATE);
      W3C_TEMPLATE = await configLayerObj.getConfigValue(CONFIG_KEYS.W3C_TEMPLATE);
      let jsonMessage = {};
      try {
        jsonMessage = JSON.parse(message.value.toString());
        const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], jsonMessage);
        const currentDose = R.pathOr("", ["vaccination", "dose"], jsonMessage);
        const programId = R.pathOr("", ["programId"], jsonMessage);
        const enablePid = JSON.parse(config.ENABLE_PROGRAM_ID_CACHING_KEY)
        if (preEnrollmentCode === "" || currentDose === "" || (enablePid && programId === "")) {
          throw Error("Required parameters not available");
        }
        if(ICD11_MAPPINGS === null || VACCINE_ICD11_MAPPINGS === null) {
          throw Error("Please set ICD11 and VACCINE_ICD11 Mappings in ETCD");
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

function populateIdentity(identity, preEnrollmentCode) {
  let isURI  = isURIFormat(identity);
  return isURI ? identity : reinitIdentityFromPayload(identity, preEnrollmentCode);
}

function isURIFormat(param) {
  let optionalCertificateFieldsObj;
  let isURI;
  try {
    optionalCertificateFieldsObj = new URL(param);
    isURI = true;
  } catch (e) {
    isURI = false;
  }

  if (isURI && !optionalCertificateFieldsObj.protocol) {
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

function transformW3(cert, certificateID) {
  const certificateType = R.pathOr('', ['meta', 'certificateType'], cert);
  const namespace = certificateType === CERTIFICATE_TYPE_V3 ? CERTIFICATE_NAMESPACE_V2 : CERTIFICATE_NAMESPACE;
  const preEnrollmentCode = R.pathOr('', ['preEnrollmentCode'], cert);
  const recipientName = R.pathOr('', ['recipient', 'name'], cert);
  const recipientDob = dobOfRecipient(cert.recipient);
  const vaccine = R.pathOr('', ['vaccination', 'name'], cert);
  const icd11Code = vaccine ? VACCINE_ICD11_MAPPINGS.filter(a => vaccine.toLowerCase().includes(a.vaccineName)).map(a => a.icd11Code)[0]: '';
  const prophylaxis = icd11Code ? ICD11_MAPPINGS[icd11Code]["icd11Term"]: '';
  const batch = R.pathOr('', ['vaccination', 'batch'], cert);
  const vaccinationDate = R.pathOr('', ['vaccination', 'date'], cert);
  const dose = R.pathOr('', ['vaccination', 'dose'], cert);
  const totalDoses = R.pathOr('', ['vaccination', 'totalDoses'], cert);
  const facilityAddressCountry = R.pathOr(config.FACILITY_COUNTRY_CODE, ['facility', 'address', 'country'], cert);
  const issuer = CERTIFICATE_ISSUER;
  const certificateId = certificateID;

  const evidenceId = CERTIFICATE_BASE_URL + certificateId;
  const InfoUrl = CERTIFICATE_INFO_BASE_URL + certificateId;
  const feedbackUrl = CERTIFICATE_FEEDBACK_BASE_URL + certificateId;

  const issuanceDate = new Date().toISOString();  
  let optionalCertificateFields = {};
  for(const [fieldName, certificatePath] of Object.entries(certificateFieldsKeyPath)) {
    let fieldValue = R.pathOr('', certificatePath, cert);
    if(fieldName === "recipientIdentifier") {
      fieldValue = populateIdentity(fieldValue, preEnrollmentCode);
    }
    else if(fieldName === "recipientAge") {
      fieldValue = ageOfRecipient(cert.recipient);
    }
    optionalCertificateFields[fieldName] = fieldValue;
  }

  let data = {
    namespace, preEnrollmentCode, 
    recipientName, recipientDob,
    issuer, issuanceDate, evidenceId, InfoUrl, feedbackUrl,
    certificateId, batch, vaccine, icd11Code, prophylaxis, vaccinationDate, dose, totalDoses,
    facilityAddressCountry,
    ...optionalCertificateFields
  };
  const template = certificateType === CERTIFICATE_TYPE_V3 ? DDCC_TEMPLATE : W3C_TEMPLATE;
  return render(template, data);
}
