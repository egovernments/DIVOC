const { Kafka } = require('kafkajs');
const config = require('./config/config');
const signer = require('./signer');

console.log('Using ' + config.KAFKA_BOOTSTRAP_SERVER)
const kafka = new Kafka({
  clientId: 'divoc-cert',
  brokers: config.KAFKA_BOOTSTRAP_SERVER.split(",")
});

const consumer = kafka.consumer({ groupId: 'certify' });
const producer = kafka.producer({allowAutoTopicCreation: true});

(async function() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({topic: config.CERTIFY_TOPIC, fromBeginning: false});

  await consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      console.log({
        value: message.value.toString(),
      });
      try {
        jsonMessage = JSON.parse(message.value.toString());
        signer.signAndSave(jsonMessage);
        producer.send({topic: config.CERTIFIED_TOPIC, messages:[{key:null, value:message.value.toString()}]});
      } catch (e) {
        console.error("ERROR: " + e.message)
      }
    },
  })
})();

