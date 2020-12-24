const { Kafka } = require('kafkajs');
const config = require('./config/config');
const signer = require('./signer');
const notifier = require('./notification');
const smsNotifier = require('./sms-notification');

console.log('Using ' + config.KAFKA_BOOTSTRAP_SERVER)
const kafka = new Kafka({
  clientId: 'divoc-cert',
  brokers: [config.KAFKA_BOOTSTRAP_SERVER]
});

const consumer = kafka.consumer({ groupId: 'certify' });
const certified_consumer = kafka.consumer({ groupId: 'certified' });
const sms_notifier_consumer = kafka.consumer({ groupId: 'sms_notifier' });
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


// Second Consumer to handle notifications(email) on "certified" topic
(async function() {
  await certified_consumer.connect();
  await certified_consumer.subscribe({topic: config.CERTIFIED_TOPIC, fromBeginning: false});

  await certified_consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      console.log({
        certified: message.value.toString(),
      });
      try {
        jsonMessage = JSON.parse(message.value.toString());
        notifier.sendMail(jsonMessage);
      } catch (e) {
        console.error("ERROR: " + e.message)
      }
    },
  })
})();

// Consumer to handle sms notifications on "certified" topic
(async function() {
  if(config.ENABLE_SMS_NOTIFICATION) {
    await sms_notifier_consumer.connect();
    await sms_notifier_consumer.subscribe({topic: config.CERTIFIED_TOPIC, fromBeginning: false});

    await sms_notifier_consumer.run({
      eachMessage: async ({topic, partition, message}) => {
        console.log({
          certified: message.value.toString(),
        });
        try {
          jsonMessage = JSON.parse(message.value.toString());
          smsNotifier.sendSMS(jsonMessage);
        } catch (e) {
          console.error("ERROR: " + e.message)
        }
      },
    })
  }
})();
