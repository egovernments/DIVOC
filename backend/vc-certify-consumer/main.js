const {Kafka} = require('kafkajs');
const sunbirdRegistryService = require('./src/services/sunbird.service');
const config = require('./src/configs/config');
const R = require('ramda');

const REGISTRY_SUCCESS_STATUS = "SUCCESSFUL";
const REGISTRY_FAILED_STATUS = "UNSUCCESSFUL";
const DUPLICATE_MSG = "duplicate key value violates unique constraint";

console.log("vc-certify-consumer");
const kafka = new Kafka({
    clientId: 'vc-certify-consumer',
    brokers: config.KAFKA_BOOTSTRAP_SERVER.split(",")
});
const consumer = kafka.consumer({ groupId: 'vc_certify', sessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT });
const producer = kafka.producer({allowAutoTopicCreation: true});
(async function (){
    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({topic: config.VC_CERTIFY_TOPIC, fromBeginning: true});

    await consumer.run({
      eachMessage: async ({message}) => {
        const createEntityMessage = JSON.parse(message.value.toString());
        const token = createEntityMessage.token;
        const payload = createEntityMessage.body;
        let resp = "";
        do {
          payload.certificateId = getCertificateId();
          console.log("Certificate Payload: ", JSON.stringify(payload));
          try{
            resp = await sunbirdRegistryService.createCertificate(payload, createEntityMessage.entityType, token);
          } catch (error){
            console.error("Error in creating certificate ", error);
            resp = error;
          }
        }
        while (R.pathOr("",["response","data","params","status"], resp) === REGISTRY_FAILED_STATUS && R.pathOr("",["response","data","params","errmsg"], resp).includes(DUPLICATE_MSG));
        if(R.pathOr("",["params","status"], resp) === REGISTRY_SUCCESS_STATUS){
          console.log("Certificate is created successfully");
          console.log("Response : ", resp);
          producer.send({
            topic: config.POST_VC_CERTIFY_TOPIC,
            messages : [
              {key: null, value: JSON.stringify({payload: payload, transactionId: createEntityMessage.transactionId, certificateId: payload.certificateId, token: token})}
            ]
          });
        }else {
          console.log("Unable to create certificate: ", resp);
        }
      }
    });
})();
function getCertificateId(){
  return "" + Math.floor(1e11 + (Math.random() * 9e11));
}