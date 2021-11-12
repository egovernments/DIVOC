const {Kafka} = require('kafkajs');
const config = require('./config/config');
const {KAFKA_BOOTSTRAP_SERVER} = require('../../configs/config');
const EVENTS_TOPIC = config.EVENTS_TOPIC;

const kafka = new Kafka({
    clientId: 'certificate_api',
    brokers: KAFKA_BOOTSTRAP_SERVER.split(",")
});

let producer = undefined;

async function initKafa() {
    producer = kafka.producer({allowAutoTopicCreation: true});
    await producer.connect();
    console.log("Kafka connected to: " + KAFKA_BOOTSTRAP_SERVER)
};

function sendEvents(event) {
    if (producer) {
        console.log("Sending event to kafka")
        producer.send({
            topic: EVENTS_TOPIC,
            messages: [{key: null, value: JSON.stringify(event)}]
        });
    } else {
        console.error("producer is not connected")
    }
}

module.exports = {
    initKafa,
    sendEvents
};
