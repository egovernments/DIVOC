const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092';
const CERTIFY_TOPIC = 'certify';
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:8081';
const CERTIFIED_TOPIC = 'certified';
const SMS_GATEWAY_URL = 'https://api.msg91.com/api/v2/sendsms';
const ENABLE_SMS_NOTIFICATION = false;
module.exports = {
  KAFKA_BOOTSTRAP_SERVER,
  CERTIFY_TOPIC,
  REGISTRY_URL,
  CERTIFIED_TOPIC,
  SMS_GATEWAY_URL,
  ENABLE_SMS_NOTIFICATION
};
