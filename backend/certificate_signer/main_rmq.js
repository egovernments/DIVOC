# Access the callback-based API
const amqp = require('amqplib/callback_api');
const config = require('./config/config');
const signer = require('./signer');
const {publicKeyPem, privateKeyPem} = require('./config/keys');
const redis = require('./redis');
const R = require('ramda');
const {RABBITMQ_SERVER} = require('../../configs/config');
const CERTIFY_TOPIC = config.CERTIFY_TOPIC;
const CERTIFIED_TOPIC = config.CERTIFIED_TOPIC;
const DUPLICATE_CERTIFICATE_TOPIC = config.DUPLICATE_CERTIFICATE_TOPIC
const ERROR_CERTIFICATE_TOPIC = config.ERROR_CERTIFICATE_TOPIC;
const CERTIFICATE_ACK_TOPIC = 'certify_ack';
const INPROGRESS_KEY_EXPIRY_SECS = 5 * 60;
const CERTIFICATE_INPROGRESS = "P";
const REGISTRY_SUCCESS_STATUS = "SUCCESSFUL";
const REGISTRY_FAILED_STATUS = "UNSUCCESSFUL";
const PREFETCH_MSGS_VALUE = 1;
const DEFAULT_ROUTING_KEY = "";

var isConnecting = false;
var amqpConn = null;
var pubChannel = null;

console.log('Using ' + RABBITMQ_SERVER);
console.log('Using ' + publicKeyPem);

function initRabbitmqCertSigner() {
  if (isConnecting)
    return;
  isConnecting = true;
  amqp.connect(RABBITMQ_SERVER + "?heartbeat=60", function(err, conn) {
    isConnecting = false;
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(initRabbitmq, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(initRabbitmq, 1000);
    });
    console.log("[AMQP] connected");
    amqpConn = conn;
    whenConnected();
  });
}

function whenConnected() {
  startPublisher();
  startConsumer();
}

function startPublisher() {
  amqpConn.createConfirmChannel(function(err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function(err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });
    pubChannel = ch;
  });
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content) {
  try {
    pubChannel.publish(exchange, routingKey, content,
      { persistent: true },
         function(err, ok) {
           if (err) {
             console.error("[AMQP] publish", err);
             pubChannel.connection.close();
           }
         });
  } catch (e) {
    console.error("[AMQP] publish", e.message);
  }
}

function sendCertAckEvents(exchange, routingKey, uploadId, rowId, status, errMsg="") {
  var msg = [{key: null, value: JSON.stringify({
    uploadId: uploadId,
    rowId: rowId,
    status: status,
    errorMsg: errMsg})}];
  publish(exchange, routingKey, Buffer.from(msg));
}

async function sendCertifyAck(status, uploadId, rowId, errMsg="") {
  if (config.ENABLE_CERTIFY_ACKNOWLEDGEMENT) {
    if (status === REGISTRY_SUCCESS_STATUS) {
      sendCertAckEvents(CERTIFICATE_ACK_TOPIC, DEFAULT_ROUTING_KEY, uploadId, rowId, 'SUCCESS', '');
    } else if (status === REGISTRY_FAILED_STATUS) {
      sendCertAckEvents(CERTIFICATE_ACK_TOPIC, DEFAULT_ROUTING_KEY, uploadId, rowId, 'FAILED', errMsg);
    }
  }
}

// A worker that acks messages only if processed succesfully
function startConsumer() {
  amqpConn.createChannel(function(err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function(err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });
    ch.prefetch(PREFETCH_MSGS_VALUE);
    ch.assertQueue(CERTIFY_TOPIC, { durable: true }, function(err, _ok) {
      if (closeOnErr(err)) return;
      ch.consume(CERTIFY_TOPIC, processMsg, { noAck: false });
    });

    function processMsg(msg) {
      signCert(msg, function(ok) {
        try {
          if (ok)
            ch.ack(msg);
          else
            ch.reject(msg, true);
        } catch (e) {
          closeOnErr(e);
        }
      });
    }
  });
}

async function signCert(message, cb) {
  console.time("certify");
  let uploadId = message.headers.uploadId ? message.headers.uploadId.toString() : '';
  let rowId = message.headers.rowId ? message.headers.rowId.toString() : '';
  let msg = message.value.toString();

  console.log({
    value: msg,
    uploadId: uploadId,
    rowId: rowId,
  });
  let jsonMessage = {};
  try {
    jsonMessage = JSON.parse(msg);
    const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], jsonMessage);
    const currentDose = R.pathOr("", ["vaccination", "dose"], jsonMessage);
    const programId = R.pathOr("", ["programId"], jsonMessage);
    if (preEnrollmentCode === "" || currentDose === "" || programId === "") {
      throw Error("Required parameters not available")
    }
    const key = `${preEnrollmentCode}-${programId}-${currentDose}`;
    const isSigned = await redis.checkIfKeyExists(key);
    const isUpdateRequest = R.pathOr(false, ["meta", "previousCertificateId"], jsonMessage);
    if (!isSigned || isUpdateRequest) {
      redis.storeKeyWithExpiry(key, CERTIFICATE_INPROGRESS, INPROGRESS_KEY_EXPIRY_SECS);
      await signer.signAndSave(jsonMessage)
        .then(res => {
          console.log(`${preEnrollmentCode} | statusCode: ${res.status} `);
          if (process.env.DEBUG) {
             console.log(res);
          }
          let errMsg;
          if (res.status === 200) {
            sendCertifyAck(res.data.params.status, uploadId, rowId, res.data.params.errmsg);
            var msg = {key: null, value: JSON.stringify(res.signedCertificate)};
            publish(CERTIFIED_TOPIC, DEFAULT_ROUTING_KEY, Buffer.from(msg));
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
      var msg = {key: null, value: JSON.stringify({message: message.value.toString(), error: "Duplicate pre-enrollment code"})};
      await publish(DUPLICATE_CERTIFICATE_TOPIC, DEFAULT_ROUTING_KEY, Buffer.from(msg));
    }
  } catch (e) {
    // const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], jsonMessage);
    // const currentDose = R.pathOr("", ["vaccination", "dose"], jsonMessage);
    // if (preEnrollmentCode !== "" && currentDose !== "") {
    //   redis.deleteKey(`${preEnrollmentCode}-${currentDose}`) //if retry fails it clears the key -
    // }
    console.error("ERROR: " + e.message)
    var msg = {key: null, value: JSON.stringify({message: message.value.toString(), error: e.message})};
    await publish(ERROR_CERTIFICATE_TOPIC, DEFAULT_ROUTING_KEY, Buffer.from(msg));
  }
  console.timeEnd("certify");
  cb(true);
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}

module.exports = {
    initRabbitmqCertSigner
};
