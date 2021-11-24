const {Kafka} = require('kafkajs');
const amqp = require('amqplib/callback_api');
const signer = require('./signer');
const redis = require('./redis');
const R = require('ramda');
const {initRegistry} = require('./registry')

let producer;

const INPROGRESS_KEY_EXPIRY_SECS = 5 * 60;
const CERTIFICATE_INPROGRESS = "P";
const REGISTRY_SUCCESS_STATUS = "SUCCESSFUL";
const REGISTRY_FAILED_STATUS = "UNSUCCESSFUL";
const PREFETCH_MSGS_VALUE = 1;
const DEFAULT_ROUTING_KEY = "";

let config = {
  // publicKeyPem: publicKeyPem,
  // privateKeyPem: privateKeyPem,

  // kafkaBootstrapServer: config.KAFKA_BOOTSTRAP_SERVER,
  // kafkaConsumerSessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT,
  // registryUrl: config.REGISTRY_URL,
  // registryCertificateSchema: config.REGISTRY_CERTIFICATE_SCHEMA,
  // redisUrl: config.REDIS_URL,
  // redisKeyExpire: config.REDIS_KEY_EXPIRE,
  //
  // certificateNamespace: config.CERTIFICATE_NAMESPACE,
  // certificateController: config.CERTIFICATE_CONTROLLER_ID,
  // certificateDid: config.CERTIFICATE_DID,
  // certificatePubkeyId: config.CERTIFICATE_PUBKEY_ID,
  // certificateIssuer: config.CERTIFICATE_ISSUER,
  // certificateBaseUrl: config.CERTIFICATE_BASE_URL,
  // certificateFeedbackBaseUrl: config.CERTIFICATE_FEEDBACK_BASE_URL,
  // certificateInfoBaseUrl: config.CERTIFICATE_INFO_BASE_URL,
  //
  // certifyTopic: config.CERTIFY_TOPIC,
  // certifiedTopic: config.CERTIFIED_TOPIC,
  // enableCertifyAck: config.ENABLE_CERTIFY_ACKNOWLEDGEMENT,
  // errorCertificateTopic: config.ERROR_CERTIFICATE_TOPIC,
  // certificateRetryCount: config.CERTIFICATE_RETRY_COUNT,
  // duplicateCertificateTopic: config.DUPLICATE_CERTIFICATE_TOPIC
};

let isConnecting = false;
let amqpConn;
let pubChannel;
let publish;
let signingPayloadTransformerFunc;

async function init_signer(conf, signingPayloadTransformer, documentLoader) {
  config = conf;
  signingPayloadTransformerFunc = signingPayloadTransformer;
  signer.setDocumentLoader(documentLoader, conf);
  await redis.initRedis(conf);
  initRegistry(conf.REGISTRY_URL, conf.REGISTRY_CERTIFICATE_SCHEMA)

  if (config.COMMUNICATION_MODE === config.COMMUNICATION_MODE_RABBITMQ) {
    console.log('Chosen mode is RabbitMQ');
    await initRabbitmqProducer();
    publish = publishToRabbitmq;
  } else if (config.COMMUNICATION_MODE === config.COMMUNICATION_MODE_KAFKA) {
    console.log('Chosen mode is Kafka');
    await initKafkaProducer();
    publish = publishToKafka;
  } else {
    console.error(`Invalid COMMUNICATION_MODE, ${config.COMMUNICATION_MODE}.`);
    return null;
  }
}

async function initRabbitmqProducer() {
  if (isConnecting)
    return;
  isConnecting = true;
  amqp.connect(config.RABBITMQ_SERVER + "?heartbeat=60", function(err, conn) {
    isConnecting = false;
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(initRabbitmqProducer, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(initRabbitmqProducer, 1000);
    });
    console.log("[AMQP] connected");
    amqpConn = conn;
    startRabbitmqPublisher();
  });
}

function startRabbitmqPublisher() {
  amqpConn.createConfirmChannel(function(err, ch) {
    if (closeOnErr(err)) return;
    pubChannel = ch;
  });
}

async function initKafkaProducer() {
  const kafka = new Kafka({
    clientId: 'divoc-cert',
    brokers: conf.KAFKA_BOOTSTRAP_SERVER.split(",")
  });
  producer = kafka.producer({allowAutoTopicCreation: true});
  await producer.connect();
}

async function signCertificate(certificateJson, headers, redisUniqueKey) {
  let uploadId = headers.uploadId ? headers.uploadId.toString() : '';
  let rowId = headers.rowId ? headers.rowId.toString() : '';
  const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], certificateJson);
  const isSigned = await redis.checkIfKeyExists(redisUniqueKey);
  const isUpdateRequest = R.pathOr(false, ["meta", "previousCertificateId"], certificateJson);
  if (!isSigned || isUpdateRequest) {
    redis.storeKeyWithExpiry(redisUniqueKey, CERTIFICATE_INPROGRESS, INPROGRESS_KEY_EXPIRY_SECS);
    await signer.signAndSave(certificateJson, signingPayloadTransformerFunc, redisUniqueKey)
        .then(res => {
          console.log(`${preEnrollmentCode} | statusCode: ${res.status} `);
          if (process.env.DEBUG) {
            console.log(res);
          }
          let errMsg;
          if (res.status === 200) {
            sendCertifyAck(res.data.params.status, uploadId, rowId, res.data.params.errmsg);
            publish(config.CERTIFIED_TOPIC, null,
                [{key: null, value: JSON.stringify(res.signedCertificate)}])
          } else {
            errMsg = "error occurred while signing/saving of certificate - " + res.status;
            sendCertifyAck(REGISTRY_FAILED_STATUS, uploadId, rowId, errMsg)
          }
        })
        .catch(error => {
          console.error(error)
          sendCertifyAck(REGISTRY_FAILED_STATUS, uploadId, rowId, error.message)
          throw error
        });
  } else {
    console.error("Duplicate pre-enrollment code received for certification :" + preEnrollmentCode)
    await publish(config.DUPLICATE_CERTIFICATE_TOPIC, null, [{
      key: null,
      value: JSON.stringify({message: certificateJson.toString(), error: "Duplicate pre-enrollment code"})
    }])
  }
}

async function signJSON(certificate) {
  return signer.signJSON(certificate)
}

async function sendCertifyAck(status, uploadId, rowId, errMsg="") {
  if (config.ENABLE_CERTIFY_ACKNOWLEDGEMENT) {
    if (status === REGISTRY_SUCCESS_STATUS) {
      await sendCertAckEvents(config.CERTIFICATE_ACK_TOPIC, DEFAULT_ROUTING_KEY, uploadId, rowId, 'SUCCESS', '');
    } else if (status === REGISTRY_FAILED_STATUS) {
      await sendCertAckEvents(config.CERTIFICATE_ACK_TOPIC, DEFAULT_ROUTING_KEY, uploadId, rowId, 'FAILED', errMsg);
    }
  }
}

async function sendCertAckEvents(exchange, routingKey, uploadId, rowId, status, errMsg = "") {
  let msg = [{
    key: null, value: JSON.stringify({
      uploadId: uploadId,
      rowId: rowId,
      status: status,
      errorMsg: errMsg
    })
  }];

  await publish(exchange, routingKey, msg);
}

// method to publish a message, will queue messages internally if the connection is down and resend later
async function publishToRabbitmq(exchange, routingKey, content) {
  try {
    pubChannel.publish(exchange, routingKey, Buffer.from(JSON.stringify(content)),
        { persistent: true },
        function(err, ok) {
          if (closeOnErr(err)) return;
        });
  } catch (e) {
    console.error("[AMQP] publish", e.message);
  }
}

async function publishToKafka(topic, routingKey, content) {
  try {
    producer.send({
      topic: topic,
      messages: content})
  } catch (e) {
    console.error("Kafka publish", e.message);
  }
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}

module.exports = {
  signCertificate,
  init_signer,
  signJSON
};
