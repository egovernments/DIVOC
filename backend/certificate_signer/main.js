const { Kafka } = require('kafkajs');
const config = require('./config/config');
const signer = require('./signer');

console.log('Using ' + config.KAFKA_BOOTSTRAP_SERVER)
const kafka = new Kafka({
  clientId: 'divoc-cert',
  brokers: config.KAFKA_BOOTSTRAP_SERVER.split(",")
});

const consumer = kafka.consumer({ groupId: 'certificate_signer' });
const producer = kafka.producer({allowAutoTopicCreation: true});

(async function() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({topic: config.CERTIFY_TOPIC, fromBeginning: true});

  await consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      console.log({
        value: message.value.toString(),
        uploadId: message.headers.uploadId ? message.headers.uploadId.toString():'',
        rowId: message.headers.rowId ? message.headers.rowId.toString():'',
      });
      let uploadId = message.headers.uploadId ? message.headers.uploadId.toString() : '';
      let rowId = message.headers.rowId ? message.headers.rowId.toString() : '';
      try {
        jsonMessage = JSON.parse(message.value.toString());
        signer.signAndSave(jsonMessage)
          .then(res => {
            console.log(`statusCode: ${res.status}`);
            console.log(res);
            sendCertifyAck(res, uploadId, rowId);
          })
          .catch(error => {
            console.error(error)
          });
        producer.send({
          topic: config.CERTIFIED_TOPIC,
          messages: [{key:null, value:message.value.toString()}]});
      } catch (e) {
        console.error("ERROR: " + e.message)
        producer.send({
          topic: 'certify_ack',
          messages: [{
            key: null,
            value: JSON.stringify({
              uploadId: uploadId,
              rowId: rowId,
              status: 'FAILED',
              errorMsg: e.message
            })}]})

      }
    },
  })
})();

async function sendCertifyAck(res, uploadId, rowId) {
  if (config.ENABLE_CERTIFY_ACKNOWLEDGEMENT) {
    if (res.data.params.status === "SUCCESSFUL") {
      producer.send({
        topic: 'certify_ack',
        messages: [{
          key: null,
          value: JSON.stringify({
            uploadId: uploadId,
            rowId: rowId,
            status: 'SUCCESS',
            errorMsg: ''
          })}]})
    } else if (res.data.params.status === "UNSUCCESSFUL") {
      producer.send({
        topic: 'certify_ack',
        messages: [{
          key: null,
          value: JSON.stringify({
            uploadId: uploadId,
            rowId: rowId,
            status: 'FAILED',
            errorMsg: res.data.params.errmsg
          })}]})
    }
  }
}

