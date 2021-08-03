const {
  CERTIFICATE_NAMESPACE,
  CERTIFICATE_ISSUER,
  CERTIFICATE_BASE_URL,
  CERTIFICATE_FEEDBACK_BASE_URL,
  CERTIFICATE_INFO_BASE_URL
} = require ("./config/config");
const {Kafka} = require('kafkajs');
const config = require('./config/config');
const R = require('ramda');
const {testCertificateContext} = require("test-certificate-context");
const signer = require('certificate-signer-library');
const {publicKeyPem, privateKeyPem} = require('./config/keys');

console.log('Using ' + config.KAFKA_BOOTSTRAP_SERVER);
console.log('Using ' + publicKeyPem);

const kafka = new Kafka({
  clientId: 'divoc-cert',
  brokers: config.KAFKA_BOOTSTRAP_SERVER.split(",")
});

const consumer = kafka.consumer({ groupId: 'test_certificate_signer', sessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT });
const producer = kafka.producer({allowAutoTopicCreation: true});

let signingConfig = {
  publicKeyPem: publicKeyPem,
  privateKeyPem: privateKeyPem,

  KAFKA_BOOTSTRAP_SERVER: config.KAFKA_BOOTSTRAP_SERVER,
  KAFKA_CONSUMER_SESSION_TIMEOUT: config.KAFKA_CONSUMER_SESSION_TIMEOUT,
  REGISTRY_URL: config.REGISTRY_URL,
  REGISTRY_CERTIFICATE_SCHEMA: config.REGISTRY_CERTIFICATE_SCHEMA,
  REDIS_URL: config.REDIS_URL,
  REDIS_KEY_EXPIRE: config.REDIS_KEY_EXPIRE,

  CERTIFICATE_NAMESPACE: config.CERTIFICATE_NAMESPACE,
  CERTIFICATE_CONTROLLER_ID: config.CERTIFICATE_CONTROLLER_ID,
  CERTIFICATE_DID: config.CERTIFICATE_DID,
  CERTIFICATE_PUBKEY_ID: config.CERTIFICATE_PUBKEY_ID,
  CERTIFICATE_ISSUER: config.CERTIFICATE_ISSUER,
  CERTIFICATE_BASE_URL: config.CERTIFICATE_BASE_URL,
  CERTIFICATE_FEEDBACK_BASE_URL: config.CERTIFICATE_FEEDBACK_BASE_URL,
  CERTIFICATE_INFO_BASE_URL: config.CERTIFICATE_INFO_BASE_URL,

  CERTIFY_TOPIC: config.CERTIFY_TOPIC,
  CERTIFIED_TOPIC: config.CERTIFIED_TOPIC,
  ENABLE_CERTIFY_ACKNOWLEDGEMENT: config.ENABLE_CERTIFY_ACKNOWLEDGEMENT,
  ERROR_CERTIFICATE_TOPIC: config.ERROR_CERTIFICATE_TOPIC,
  CERTIFICATE_RETRY_COUNT: config.CERTIFICATE_RETRY_COUNT,
  DUPLICATE_CERTIFICATE_TOPIC: config.DUPLICATE_CERTIFICATE_TOPIC,
  CERTIFICATE_ACK_TOPIC: config.CERTIFICATE_ACK_TOPIC

};

const documentLoader = {};
documentLoader[CERTIFICATE_NAMESPACE] = testCertificateContext;

(async function() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({topic: config.CERTIFY_TOPIC, fromBeginning: true});

  await signer.init_signer(signingConfig, transformW3, documentLoader);

  await consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      console.time("certify");
      console.log({
        value: message.value.toString(),
        uploadId: message.headers.uploadId ? message.headers.uploadId.toString():'',
        rowId: message.headers.rowId ? message.headers.rowId.toString():'',
      });
      let jsonMessage = {};
      try {
        jsonMessage = JSON.parse(message.value.toString());
        const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], jsonMessage);
        const sampleCollectionTimestamp = R.pathOr("", ['testDetails', 'sampleCollectionTimestamp'], jsonMessage);
        if (preEnrollmentCode === "" || sampleCollectionTimestamp === "") {
          throw Error("Required parameters not available")
        }
        const key = `${preEnrollmentCode}-${sampleCollectionTimestamp}`;
        await signer.signCertificate(jsonMessage, message.headers, key);
      } catch (e) {
        // const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], jsonMessage);
        // const currentDose = R.pathOr("", ["vaccination", "dose"], jsonMessage);
        // if (preEnrollmentCode !== "" && currentDose !== "") {
        //   redis.deleteKey(`${preEnrollmentCode}-${currentDose}`) //if retry fails it clears the key -
        // }
        console.error("ERROR: " + e.message)
        await producer.send({
          topic: config.ERROR_CERTIFICATE_TOPIC,
          messages: [{key: null, value: JSON.stringify({message: message.value.toString(), error: e.message})}]
        });
      }
      console.timeEnd("certify");
    },
  })
})();

function transformW3(cert, certificateId) {
  const certificateFromTemplate = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      CERTIFICATE_NAMESPACE,
    ],
    type: ['VerifiableCredential', 'ProofOfTestCertificateCredential'],
    credentialSubject: {
      type: "Person",
      id: R.pathOr('', ['recipient', 'identity'], cert),
      refId: R.pathOr('', ['preEnrollmentCode'], cert),
      name: R.pathOr('', ['recipient', 'name'], cert),
      gender: R.pathOr('', ['recipient', 'gender'], cert),
      dob: R.pathOr('', ['recipient', 'dob'], cert),
      nationality: R.pathOr('', ['recipient', 'nationality'], cert),
      address: {
        "streetAddress": R.pathOr('', ['recipient', 'address', 'addressLine1'], cert),
        "streetAddress2": R.pathOr('', ['recipient', 'address', 'addressLine2'], cert),
        "district": R.pathOr('', ['recipient', 'address', 'district'], cert),
        "city": R.pathOr('', ['recipient', 'address', 'city'], cert),
        "addressRegion": R.pathOr('', ['recipient', 'address', 'state'], cert),
        "addressCountry": R.pathOr('IN', ['recipient', 'address', 'country'], cert),
        "postalCode": R.pathOr('', ['recipient', 'address', 'pincode'], cert),
      }
    },
    issuer: CERTIFICATE_ISSUER,
    issuanceDate: new Date().toISOString(),
    evidence: [{
      "id": CERTIFICATE_BASE_URL + certificateId,
      "feedbackUrl": CERTIFICATE_FEEDBACK_BASE_URL + certificateId,
      "infoUrl": CERTIFICATE_INFO_BASE_URL + certificateId,
      "certificateId": certificateId,
      "type": ["TestDetails"],
      "batch": R.pathOr('', ['testDetails', 'batch'], cert),
      "testName": R.pathOr('', ['testDetails', 'testName'], cert),
      "testType": R.pathOr('', ['testDetails', 'testType'], cert),
      "manufacturer": R.pathOr('', ['testDetails', 'manufacturer'], cert),
      "disease": R.pathOr('', ['testDetails', 'disease'], cert),
      "sampleOrigin": R.pathOr('', ['testDetails', 'sampleOrigin'], cert),
      "sampleCollectionTimestamp": R.pathOr('', ['testDetails', 'sampleCollectionTimestamp'], cert),
      "resultTimestamp": R.pathOr('', ['testDetails', 'resultTimestamp'], cert),
      "result": R.pathOr('', ['testDetails', 'result'], cert),
      "verifier": {
        "name": R.pathOr('', ['verifier', 'name'], cert),
      },
      "facility": {
        // "id": CERTIFICATE_BASE_URL + cert.facility.id,
        "name": R.pathOr('', ['facility', 'name'], cert),
        "address": {
          "streetAddress": R.pathOr('', ['facility', 'address', 'addressLine1'], cert),
          "streetAddress2": R.pathOr('', ['facility', 'address', 'addressLine2'], cert),
          "district": R.pathOr('', ['facility', 'address', 'district'], cert),
          "city": R.pathOr('', ['facility', 'address', 'city'], cert),
          "addressRegion": R.pathOr('', ['facility', 'address', 'state'], cert),
          "addressCountry": R.pathOr('IND', ['facility', 'address', 'country'], cert),
          "postalCode": R.pathOr('', ['facility', 'address', 'pincode'], cert)
        },
      }
    }],
    "nonTransferable": "true"
  };
  return certificateFromTemplate;
}
