const {Kafka} = require('kafkajs');
const sunbirdRegistryService = require('./src/services/sunbird.service');
const vcCertificationService = require('./src/services/vc.certification.service');
const config = require('./src/configs/config');
const constants = require('./src/configs/constants')
const R = require('ramda');

const REGISTRY_SUCCESS_STATUS = "SUCCESSFUL";
const REGISTRY_FAILED_STATUS = "UNSUCCESSFUL";
const DUPLICATE_MSG = "duplicate key value violates unique constraint";

console.log("vc-certify-consumer");
const kafka = new Kafka({
    clientId: 'vc-certify-consumer',
    brokers: config.KAFKA_BOOTSTRAP_SERVER.split(",")
});
const vc_certify_consumer = kafka.consumer({ groupId: 'vc_certify', sessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT });
const post_vc_certify_consumer = kafka.consumer({ groupId: 'post_vc_certify', sessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT });
const vc_rm_suspension_consumer = kafka.consumer({ groupId: 'vc-remove-suspension', sessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT });
const producer = kafka.producer({allowAutoTopicCreation: true});

consumeVCCertify();
consumePostVCCertify();
consumeRemoveSuspension();

async function processVCCertifyMessage(payload)  {
  const { topic, partition, message } = payload;
  const createEntityMessage = JSON.parse(message.value.toString());
  const token = createEntityMessage.token;
  const certificatePayload = createEntityMessage.body;
  let resp = "";
  let previousCertId = certificatePayload?.certificateId || "" ;
  do {
    certificatePayload.certificateId = getCertificateId();
    console.log("Certificate Payload: ", JSON.stringify(certificatePayload));
    try {
      resp = await sunbirdRegistryService.createCertificate(certificatePayload, createEntityMessage.entityType, token);
    } catch (error) {
      console.error("Error in creating certificate ", error);
      resp = error;
    }
  }
  while (R.pathOr("", ["response", "data", "params", "status"], resp) === REGISTRY_FAILED_STATUS && R.pathOr("", ["response", "data", "params", "errmsg"], resp).includes(DUPLICATE_MSG));
  let certificateStatus = R.pathOr("", ["params", "status"], resp);
  if (certificateStatus === REGISTRY_SUCCESS_STATUS) {
    console.log("Certificate is created successfully");
    console.log("Response : ", resp);
  } else {
    certificateStatus = REGISTRY_FAILED_STATUS;
    console.log("Unable to create certificate : ", R.pathOr("", ["response", "data"], resp));
  }
  if(previousCertId.trim() !== ""){
    let revokeRequest = JSON.parse(JSON.stringify(certificatePayload));
    revokeRequest.certificateId = previousCertId;
    revokeRequest.newCertId = certificatePayload.certificateId;
    revokeRequest.entityName = createEntityMessage.entityType || "";
    try {
      resp = await vcCertificationService.revokeCertificate(revokeRequest,token);
    } catch (error) {
      console.error("Error in revoking certificate during update request ", error);
      resp = error;
    }
  }
  producer.send({
    topic: config.POST_VC_CERTIFY_TOPIC,
    messages: [
      {
        key: null,
        value: JSON.stringify({
          payload: certificatePayload,
          entityType: createEntityMessage.entityType,
          transactionId: createEntityMessage.transactionId,
          certificateId: certificatePayload.certificateId,
          status: certificateStatus,
          token: token
        })
      }
    ]
  });
}

async function consumeVCCertify() {
  await vc_certify_consumer.connect();
  await producer.connect();
  await vc_certify_consumer.subscribe({topic: config.VC_CERTIFY_TOPIC, fromBeginning: true});

  await vc_certify_consumer.run({
    eachMessage: processVCCertifyMessage
  })
}

async function processPostVCCertifyMessage(payload) {
  const { topic, partition, message } = payload;
  const postVCCertifyMessage = JSON.parse(message.value.toString());
  if (postVCCertifyMessage.entityType !== constants.TRANSACTION_ENTITY_TYPE){
    const token = postVCCertifyMessage.token;
    const transactionEntityReq = {
      transactionId: postVCCertifyMessage.transactionId,
      certificateId: postVCCertifyMessage.certificateId,
      status: postVCCertifyMessage.status,
      payload: JSON.stringify(postVCCertifyMessage.payload),
      entityType: postVCCertifyMessage.entityType
    }
    try {
      const transactionEntityRes = await sunbirdRegistryService.addTransaction(transactionEntityReq, token);
      if (transactionEntityRes?.params?.status === REGISTRY_SUCCESS_STATUS) {
        console.log("Successfully added Transaction to: ",constants.TRANSACTION_ENTITY_TYPE);
      } else {
        console.log("Failed to add Transaction: ", transactionEntityRes);
      }
    } catch (err) {
      console.error("Error while adding transaction: ", err);
    }
  }
}

async function consumePostVCCertify() {
  await post_vc_certify_consumer.connect();
  await post_vc_certify_consumer.subscribe({topic: config.POST_VC_CERTIFY_TOPIC, fromBeginning: true});

  await post_vc_certify_consumer.run({
    eachMessage: processPostVCCertifyMessage
  });
}
async function processRemoveSuspensionMessage(payload) {
  const { topic, partition, message } = payload;
  const removeSuspensionMessage = JSON.parse(message.value.toString());
  const revokedCertificateOsId = removeSuspensionMessage.revokedCertificateOsId;
  const token = removeSuspensionMessage.token;
    try {
      await sunbirdRegistryService.deleteCertificate('RevokedVC',revokedCertificateOsId,token);
     
    } catch (err) {
      console.error("Error while removing suspension: ", err);
    }
  }


async function consumeRemoveSuspension() {
  await vc_rm_suspension_consumer.connect();
  await vc_rm_suspension_consumer.subscribe({topic: config.VC_REMOVE_SUSPENSION_TOPIC, fromBeginning: true});

  await vc_rm_suspension_consumer.run({
    eachMessage: processRemoveSuspensionMessage
  });
}

function getCertificateId(){
  return "" + Math.floor(1e11 + (Math.random() * 9e11));
}