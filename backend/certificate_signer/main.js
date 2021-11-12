const config = require('./config/config');
const {initKafkaCertSigner} = require("kafka_cert_signer");
const {initRabbitmqCertSigner} = require("rabbitmq_cert_signer");

switch (config.COMMUNICATION_MODE) {
  case config.COMMUNICATION_MODE_RABBITMQ:
    console.log('Choosen mode is RabbitMQ');
    initRabbitmqCertSigner();
    break;
  case config.COMMUNICATION_MODE_KAFKA:
    console.log('Choosen mode is Kafka');
    initKafkaCertSigner();
    break;
  case config.COMMUNICATION_MODE_RESTAPI:
    console.log('Choosen mode is Rest-APIs');
    console.error('Rest-API communication mode isn\'t supported yet');
    break;
  default:
    console.error(`Invalid COMMUNICATION_MODE, ${config.COMMUNICATION_MODE}.`);
}
