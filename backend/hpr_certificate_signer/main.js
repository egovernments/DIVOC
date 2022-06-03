const {Kafka} = require('kafkajs');
const R = require('ramda');
const signer_library = require('certificate-signer-library');

const config = require('./config/config');
const {transformW3, signCertificate, saveCertificate} = require('./signer');
const {initRedis} = require('./redis');
const {publicKeyPem, privateKeyPem, signingKeyType} = require('./config/keys');
const constants = require('./config/constant');

const REGISTRY_SUCCESS_STATUS = "SUCCESSFUL";
const REGISTRY_FAILED_STATUS = "UNSUCCESSFUL";

const documentLoaderMapping = {}
const kafka = new Kafka({
    clientId: 'divoc-cert',
    brokers: config.KAFKA_BOOTSTRAP_SERVER.split(",")
});
const consumer = kafka.consumer({
    groupId: 'health_professional_signer',
    sessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT
});
const producer = kafka.producer({allowAutoTopicCreation: true});

const signerConfig = {
    keyType: signingKeyType, 
    publicKeyPem: publicKeyPem,
    privateKeyPem: privateKeyPem,
    publicKeyBase58: publicKeyPem,
    privateKeyBase58: privateKeyPem,
    ...config
};

(async function() {
    await consumer.connect();
    await producer.connect();
    await initRedis(config.REDIS_ENABLED, config.REDIS_URL, config.REDIS_KEY_EXPIRE);
    signer_library.init_signer(signerConfig, transformW3, documentLoaderMapping);
    await consumer.subscribe({
        topic: config.HEALTH_CERTIFY_TOPIC,
        fromBeginning: true
    });
    await consumer.run({
        eachMessage: async({message}) => {
            const uploadId = message.headers.uploadId;
            const rowId = message.headers.rowId;
            const certificate = JSON.parse(message.value.toString());
            const preEnrollmentCode = R.pathOr("", ['preEnrollmentCode'], certificate);
            const signedCertificate = await signCertificate(certificate, {uploadId, rowId});
            if(signedCertificate === null || signedCertificate === undefined) {
                producer.send({
                    topic: config.DUPLICATE_CERTIFICATE_TOPIC,
                    messages: [{
                    key: null,
                    value: JSON.stringify({message: JSON.stringify(certificate), error: "Duplicate pre-enrollment code"})
                    }]
                });
                producer.send({
                    topic: config.PROC_TOPIC,
                    messages: [
                      {key: null, value: JSON.stringify({preEnrollmentCode: preEnrollmentCode, date: new Date(), ProcType: 'sign_certificate', Status: 'error'})}
                    ]
                });
            } else {
                saveCertificate(signedCertificate, preEnrollmentCode)
                .then(res => {
                    if(res.status === constants.SUCCESS) {
                        producer.send({
                            topic: config.CERTIFIED_TOPIC,
                            messages: [{
                                key: null,
                                value: JSON.stringify(res.signedCertificate)
                            }]
                        });
                        producer.send({
                            topic: config.PROC_TOPIC,
                            messages: [
                              {key: null, value: JSON.stringify({preEnrollmentCode: preEnrollmentCode, date: new Date(), ProcType: 'sign_certificate', Status: 'success'})}
                            ]
                        });
                    } else {
                        console.log('Error occured while saving certificate');
                        sendCertifyAck(REGISTRY_FAILED_STATUS, uploadId, rowId, "REGISTRY_ERROR");
                        producer.send({
                            topic: config.PROC_TOPIC,
                            messages: [
                              {key: null, value: JSON.stringify({preEnrollmentCode: preEnrollmentCode, date: new Date(), ProcType: 'sign_certificate', Status: 'error'})}
                            ]
                        });
                    }
                }).catch(err => {
                    console.error(err);
                    producer.send({
                        topic: config.ERROR_CERTIFICATE_TOPIC,
                        messages: [{key: null, value: JSON.stringify({message: message.value.toString(), error: err.message})}]
                    });
                    sendCertifyAck(REGISTRY_FAILED_STATUS, uploadId, rowId, err.message);
                });
            }
        }
    })
})();

async function sendCertifyAck(status, uploadId, rowId, errMsg="") {
    if (config.ENABLE_CERTIFY_ACKNOWLEDGEMENT) {
        if (status === REGISTRY_SUCCESS_STATUS) {
            producer.send({
                topic: config.CERTIFICATE_ACK_TOPIC,
                messages: [{
                    key: null,
                    value:  JSON.stringify({
                            uploadId: uploadId,
                            rowId: rowId,
                            status: 'SUCCESS',
                            errorMsg: ''
                    })
                }]
            });
        } else if (status === REGISTRY_FAILED_STATUS) {
            producer.send({
                topic: config.CERTIFICATE_ACK_TOPIC,
                messages: [{
                    key: null,
                    value: JSON.stringify({
                    uploadId: uploadId,
                    rowId: rowId,
                    status: 'FAILED',
                    errorMsg: errMsg
                })}]
            });
        }
    }
}