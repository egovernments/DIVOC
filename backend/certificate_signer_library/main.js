const {Kafka} = require('kafkajs');
const signer = require('./signer');
const redis = require('./redis');
const R = require('ramda');
const {initRegistry} = require('./registry')
const registry = require('./registry');

let producer;

const INPROGRESS_KEY_EXPIRY_SECS = 5 * 60;
const CERTIFICATE_INPROGRESS = "P";
const REGISTRY_SUCCESS_STATUS = "SUCCESSFUL";
const REGISTRY_FAILED_STATUS = "UNSUCCESSFUL";
const DUPLICATE_MSG = "duplicate key value violates unique constraint";
let maxRetrycount = 0;

let config = {
  // publicKeyPem: publicKeyPem,
  // privateKeyPem: privateKeyPem,

  // kafkaBootstrapServer: config.KAFKA_BOOTSTRAP_SERVER,
  // kafkaConsumerSessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT,
  // registryUrl: config.REGISTRY_URL,
  // registryCertificateSchema: config.REGISTRY_CERTIFICATE_SCHEMA,
  // redisUrl: config.REDIS_URL,
  // redisKeyExpire: config.REDIS_KEY_EXPIRE,
  //
  // certificateNamespace: config.CERTIFICATE_NAMESPACE,
  // certificateController: config.CERTIFICATE_CONTROLLER_ID,
  // certificateDid: config.CERTIFICATE_DID,
  // certificatePubkeyId: config.CERTIFICATE_PUBKEY_ID,
  // certificateIssuer: config.CERTIFICATE_ISSUER,
  // certificateBaseUrl: config.CERTIFICATE_BASE_URL,
  // certificateFeedbackBaseUrl: config.CERTIFICATE_FEEDBACK_BASE_URL,
  // certificateInfoBaseUrl: config.CERTIFICATE_INFO_BASE_URL,
  //
  // certifyTopic: config.CERTIFY_TOPIC,
  // certifiedTopic: config.CERTIFIED_TOPIC,
  // enableCertifyAck: config.ENABLE_CERTIFY_ACKNOWLEDGEMENT,
  // errorCertificateTopic: config.ERROR_CERTIFICATE_TOPIC,
  // certificateRetryCount: config.CERTIFICATE_RETRY_COUNT,
  // duplicateCertificateTopic: config.DUPLICATE_CERTIFICATE_TOPIC
};

let signingPayloadTransformerFunc;

async function init_signer(conf, signingPayloadTransformer, documentLoader) {
  config = conf;
  signingPayloadTransformerFunc = signingPayloadTransformer;
  signer.setDocumentLoader(documentLoader, conf);
  await redis.initRedis(conf);
  maxRetrycount = config.CERTIFICATE_RETRY_COUNT;

  const kafka = new Kafka({
    clientId: 'divoc-cert',
    brokers: conf.KAFKA_BOOTSTRAP_SERVER.split(",")
  });
  producer = kafka.producer({allowAutoTopicCreation: true});

  initRegistry(conf.REGISTRY_URL, conf.REGISTRY_CERTIFICATE_SCHEMA)

  await producer.connect();
}


async function  signCertificateWithoutPersisting(payload, transformW3, certificateId){
  const w3cCertificate = transformW3(payload, certificateId);
  const signedCertificate = await signJSON(w3cCertificate);
  return signedCertificate;
}

async function signCertificate(certificateJson, headers, redisUniqueKey) {
  let uploadId = headers.uploadId ? headers.uploadId.toString() : '';
  let rowId = headers.rowId ? headers.rowId.toString() : '';
  const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], certificateJson);
  const isSigned = await redis.checkIfKeyExists(redisUniqueKey);
  const isUpdateRequest = R.pathOr(false, ["meta", "previousCertificateId"], certificateJson);
  if (!isSigned || isUpdateRequest) {
    redis.storeKeyWithExpiry(redisUniqueKey, CERTIFICATE_INPROGRESS, INPROGRESS_KEY_EXPIRY_SECS);
    await signAndSave(certificateJson, signingPayloadTransformerFunc, redisUniqueKey)
        .then(res => {
          console.log(`${preEnrollmentCode} | statusCode: ${res.status} `);
          if (process.env.DEBUG) {
            console.log(res);
          }
          let errMsg;
          if (res.status === 200) {
            sendCertifyAck(res.data.params.status, uploadId, rowId, res.data.params.errmsg);
            producer.send({
              topic: config.CERTIFIED_TOPIC,
              messages: [{key: null, value: JSON.stringify(res.signedCertificate)}]
            });
          } else {
            errMsg = "error occurred while signing/saving of certificate - " + res.status;
            sendCertifyAck(REGISTRY_FAILED_STATUS, uploadId, rowId, errMsg)
          }
        })
        .catch(error => {
          console.error(error)
          sendCertifyAck(REGISTRY_FAILED_STATUS, uploadId, rowId, error.message)
          throw error
        });
  } else {
    console.error("Duplicate pre-enrollment code received for certification :" + preEnrollmentCode)
    await producer.send({
      topic: config.DUPLICATE_CERTIFICATE_TOPIC,
      messages: [{
        key: null,
        value: JSON.stringify({message: certificateJson.toString(), error: "Duplicate pre-enrollment code"})
      }]
    });
  }
}

async function signAndSave(certificate, transformW3, redisUniqueKey, retryCount = 0) {
  const name = certificate.recipient.name;
  const contact = certificate.recipient.contact;
  const mobile = getContactNumber(contact);
  const preEnrollmentCode = certificate.preEnrollmentCode;
  const programId = certificate["programId"] || "";
  const certificateId = getCertificateId();
  const signedCertificate = await signCertificateWithoutPersisting(certificate, transformW3, certificateId);
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
  if (R.pathOr("", ["data", "params", "status"], resp) === REGISTRY_FAILED_STATUS && R.pathOr("", ["data", "params", "errmsg"], resp).includes(DUPLICATE_MSG)) {
    if (retryCount <= maxRetrycount) {
      console.error("Duplicate certificate id found, retrying attempt " + retryCount + " of " + maxRetrycount);
      return await signAndSave(certificate, transformW3, redisUniqueKey, retryCount + 1)
    } else {
      console.error("Max retry attempted");
      throw new Error(resp.data.params.errmsg)
    }
  }
  resp.signedCertificate = signedCertificateForDB;
  if (R.pathOr("", ["data", "params", "status"], resp) === REGISTRY_SUCCESS_STATUS){
    redis.storeKeyWithExpiry(redisUniqueKey, certificateId)
  }
  return resp;
}

async function sendCertifyAck(status, uploadId, rowId, errMsg="") {
  if (config.ENABLE_CERTIFY_ACKNOWLEDGEMENT) {
    if (status === REGISTRY_SUCCESS_STATUS) {
      producer.send({
        topic: config.CERTIFICATE_ACK_TOPIC,
        messages: [{
          key: null,
          value: JSON.stringify({
            uploadId: uploadId,
            rowId: rowId,
            status: 'SUCCESS',
            errorMsg: ''
          })}]})
    } else if (status === REGISTRY_FAILED_STATUS) {
      producer.send({
        topic: config.CERTIFICATE_ACK_TOPIC,
        messages: [{
          key: null,
          value: JSON.stringify({
            uploadId: uploadId,
            rowId: rowId,
            status: 'FAILED',
            errorMsg: errMsg
          })}]})
    }
  }
}

function getCertificateId(){
  return "" + Math.floor(1e8 + (Math.random() * 9e8));
}

function getContactNumber(contact) {
  return contact.find(value => /^tel/.test(value)).split(":")[1];
}

async function signJSON(certificate) {
  return signer.signJSON(certificate)
}

async function verifyJSON(signedJSON) {
  return signer.verifyJSON(signedJSON)
}


module.exports = {
  signCertificate,
  signCertificateWithoutPersisting,
  init_signer,
  signJSON,
  verifyJSON
};
