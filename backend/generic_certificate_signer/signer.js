const signer_library = require('certificate-signer-library');
const R = require('ramda');

const registry = require('./registry');
const redis = require('./redis');
const config = require('./config/config');

const INPROGRESS_KEY_EXPIRY_SECS = 5 * 60;
const CERTIFICATE_INPROGRESS = "P";
const UNSUCCESSFUL = "UNSUCCESSFUL";
const SUCCESSFUL = "SUCCESSFUL";
const DUPLICATE_MSG = "duplicate key value violates unique constraint";

async function signCertificate(certificateJson, transformW3) {
    const preEnrollmentCode = R.pathOr("", ["preEnrollmentCode"], certificateJson);
    const isSigned = await redis.checkIfKeyExists(preEnrollmentCode);
    const isUpdateRequest = R.pathOr(false, ["meta", "previousCertificateId"], certificateJson);
    if (!isSigned || isUpdateRequest) {
        redis.storeKeyWithExpiry(preEnrollmentCode, CERTIFICATE_INPROGRESS, INPROGRESS_KEY_EXPIRY_SECS);
        const name = certificateJson.recipient.name;
        const contact = certificateJson.recipient.contact;
        const mobile = '';
        const programId = certificateJson["programId"] || "";
        const certificateId = "" + Math.floor(1e8 + (Math.random() * 9e8));
        const signedCertificate = await signer_library.signCertificateWithoutPersisting(certificateJson, transformW3, certificateId)
        return {
            name: name,
            contact: contact,
            mobile: mobile,
            preEnrollmentCode: preEnrollmentCode,
            certificateId: certificateId,
            certificate: JSON.stringify(signedCertificate),
            programId: programId,
            meta: certificateJson["meta"]
        }
    }
    console.error("Duplicate pre-enrollment code received for certification :" + preEnrollmentCode);
}

async function saveCertificate(signedCertificate, redisUniqueKey, retryCount = 0) {
    return registry.save(signedCertificate, config.REGISTRY_URL, config.REGISTRY_CERTIFICATE_SCHEMA).then(
        async(res) => {
            if (retryCount < config.CERTIFICATE_RETRY_COUNT) {
                if(R.pathOr("", ["data", "params", "status"], res) === SUCCESSFUL ) {
                    redis.storeKeyWithExpiry(redisUniqueKey,  signedCertificate.certificateId);
                    return {...res, signedCertificate: signedCertificate};
                }
                else if (R.pathOr("", ["data", "params", "status"], res) === UNSUCCESSFUL && R.pathOr("", ["data", "params", "errmsg"], res).includes(DUPLICATE_MSG)) {
                    return await saveCertificate(signedCertificate, redisUniqueKey, retryCount + 1);
                }
            }
            else {
                console.error("Max retry reached");
                throw new Error(res.data.params.errmsg);
            }
        }
    );
}


module.exports = {
    signCertificate,
    saveCertificate
}