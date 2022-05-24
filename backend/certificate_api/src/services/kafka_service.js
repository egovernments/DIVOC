const {Kafka} = require('kafkajs');
const {KAFKA_BOOTSTRAP_SERVER,KAFKA_SSL_CA_LOCATION,KAFKA_ENABLE_SSL,KAFKA_SASL_MECHANISM,KAFKA_SASL_USERNAME,KAFKA_SASL_PASSWORD} = require('../../configs/config');
const fs = require('fs');

const kafka = new Kafka({
    clientId: 'certificate_api',
    brokers: KAFKA_BOOTSTRAP_SERVER.split(","),
    ssl: (KAFKA_ENABLE_SSL == "true" ? { rejectUnauthorized: false, ca: [fs.readFileSync(KAFKA_SSL_CA_LOCATION, 'utf-8')]} : false),
    sasl: {
        mechanism: KAFKA_SASL_MECHANISM,
        username: KAFKA_SASL_USERNAME,
        password: KAFKA_SASL_PASSWORD
    },
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
            topic: "events",
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