const {Kafka} = require('kafkajs');
const R = require('ramda');
const signer_library = require('certificate-signer-library');
const Mustache = require('mustache');

const configurationService = require('./configuration_service');
const config = require('./config/config');
const {signCertificate, saveCertificate} = require('./signer');
const {initRedis} = require('./redis');
const {publicKeyPem, privateKeyPem, signingKeyType} = require('./config/keys');
const constants = require('./config/constants');

const REGISTRY_SUCCESS_STATUS = "SUCCESSFUL";
const REGISTRY_FAILED_STATUS = "UNSUCCESSFUL";

let template;

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

const transformW3 = (certificate, certificateId) => {
    const namespace = config.CERTIFICATE_NAMESPACE;
    const issuer = config.CERTIFICATE_ISSUER;
    const issuanceDate = new Date().toISOString();
    const data = {
        namespace, issuer, certificateId, ...certificate, issuanceDate
    };
    return JSON.parse(Mustache.render(template, data));
}

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
            try {
                const certificate = JSON.parse(message.value.toString());
                const preEnrollmentCode = R.pathOr("", ['preEnrollmentCode'], certificate);
                template = await (new configurationService.ConfigLayer().getConfigValue(config.ENTITY_TYPE + "/" + config.TEMPLATE));
                const signedCertificate = await signCertificate(certificate, transformW3);
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
                            `console.log`('Error occured while saving certificate');
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
                        sendCertifyAck(REGISTRY_FAILED_STATUS, uploadId, rowId, err.message);
                    });
                }
            } catch(err) {
                console.error(err);
                producer.send({
                    topic: config.ERROR_CERTIFICATE_TOPIC,
                    messages: [{key: null, value: JSON.stringify({message: message.value.toString(), error: err.message})}]
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