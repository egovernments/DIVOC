const config = require('./config/config');
const {initKafkaCertSigner} = require("./kafka_cert_signer");
const {initRabbitmqCertSigner} = require("./rabbitmq_cert_signer");

if (config.COMMUNICATION_MODE === config.COMMUNICATION_MODE_RABBITMQ) {
  console.log('Chosen mode is RabbitMQ');
  initRabbitmqCertSigner();
} else if (config.COMMUNICATION_MODE === config.COMMUNICATION_MODE_KAFKA) {
  console.log('Chosen mode is Kafka');
  initKafkaCertSigner();
} else {
  console.error(`Invalid COMMUNICATION_MODE, ${config.COMMUNICATION_MODE}.`);
  return null;
}
