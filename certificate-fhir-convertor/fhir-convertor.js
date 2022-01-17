const { v4: uuidv4 } = require('uuid');
const R = require('ramda');
const Mustache = require("mustache");
const fs = require('fs');
const config = require('./configs/config');
const base64url = require('base64url');
const QRCode = require('qrcode');
const JSZip = require("jszip");
const rs = require("jsrsasign");
const JWS = rs.jws.JWS;

const TEMPLATES_FOLDER = __dirname +'/configs/templates/';
const r4TemplateFile = 'fhir-r4.template';
const questionnairResponseTemplateFile = 'questionnaireResponse.template';
const smartHealthTemplateFile = 'smartHealthCard.template';
const CERTIFICATE_FILE = "certificate.json";

function render(template, data) {
    return JSON.parse(Mustache.render(template, data))
}

function dobOfRecipient(certificate) {
    const dob = R.pathOr('', ['credentialSubject', 'dob'], certificate);
    const age = R.pathOr('', ['credentialSubject', 'age'], certificate);
    if (dob && new Date(dob).getFullYear() > 1900) return dob;
    // administrative dob
    if (age && age > 0)
        return (new Date().getFullYear() - age) + "-01-01";
    return "";
}

function getDataFromCertificate(certificate, meta) {
    const dateString = new Date().toJSON();

    const patientId = uuidv4();
    const organisationId = uuidv4();
    const qrId =  uuidv4();
    const bundleId = uuidv4();
    const compositionId = uuidv4();
    const immunizationId = uuidv4();
    const questionnaireResponseId = uuidv4();

    const practitionerName = R.pathOr('', ['evidence', 0, 'verifier', 'name'], certificate);
    const vaccineName = R.pathOr('', ['evidence', 0, 'vaccine'], certificate);
    const icd11Code = R.pathOr('', ['evidence', 0, 'icd11Code'], certificate);
    if (!icd11Code && !config.VACCINE_MAPPINGS.filter(a => vaccineName.toLowerCase().includes(a.vaccineName)).map(a => a.icd11Code)[0]) {
        throw new Error("unsupported vaccine name "+ vaccineName)
    }
    const vaccineCode = !icd11Code ? config.VACCINE_MAPPINGS.filter(a => vaccineName.toLowerCase().includes(a.vaccineName)).map(a => a.icd11Code)[0]: icd11Code;

    const facilityName = R.pathOr('', ['evidence', 0, 'facility', 'name'], certificate);
    const facilityCity = R.pathOr('', ['evidence', 0, 'facility', 'address', 'city'], certificate);
    const facilityDistrict = R.pathOr('', ['evidence', 0, 'facility', 'address', 'district'], certificate);
    const facilityCountry = R.pathOr('', ['evidence', 0, 'facility', 'address', 'addressCountry'], certificate);
    const facilityId = facilityName.split(' ').join('-');

    const patientNationality = R.pathOr('', ['credentialSubject', 'nationality'], certificate);
    const patientGovtId = R.pathOr('', ['credentialSubject', 'id'], certificate);
    const patientName = R.pathOr('', ['credentialSubject', 'name'], certificate);
    const refId = R.pathOr('', ['credentialSubject', 'refId'], certificate);
    const dob = dobOfRecipient(certificate);
    const patientGender = R.pathOr('', ['credentialSubject', 'gender'], certificate).toLowerCase();
    const vaccinationDate = R.pathOr('', ['evidence', 0, 'date'], certificate);
    const manufacturer = R.pathOr('', ['evidence', 0, 'manufacturer'], certificate);
    const batchNumber = R.pathOr('', ['evidence', 0, 'batch'], certificate);
    const effectiveUntilDate = R.pathOr('', ['evidence', 0, 'effectiveUntil'], certificate);
    const effectiveStartDate = R.pathOr('', ['evidence', 0, 'effectiveStart'], certificate);
    const dose = parseInt(R.pathOr('', ['evidence', 0, 'dose'], certificate));
    const totalDoses = parseInt(R.pathOr('', ['evidence', 0, 'totalDoses'], certificate));
    const certificateId = R.pathOr('', ['evidence', 0, 'certificateId'], certificate);

    const diseaseCode = R.pathOr('', ['diseaseCode'], meta);
    const publicHealthAuthority = R.pathOr('', ['publicHealthAuthority'], meta);

    return {
        dateString, patientId, organisationId, qrId, bundleId, compositionId, immunizationId,
        practitionerName, vaccineName, vaccineCode,
        facilityName, facilityCity, facilityDistrict, facilityCountry, facilityId,
        patientNationality, patientGovtId, patientName, dob, patientGender, vaccinationDate,
        manufacturer, batchNumber, effectiveUntilDate, effectiveStartDate, dose, totalDoses,
        diseaseCode, refId, publicHealthAuthority, certificateId, questionnaireResponseId
    };
}

async function certificateToFhirJson(certificate, privateSigningKeyPem, meta) {
    let data = getDataFromCertificate(certificate, meta);

    // build QR data and img
    const QR_template = fs.readFileSync(TEMPLATES_FOLDER+questionnairResponseTemplateFile, 'utf8');
    const qrPayload = JSON.stringify(render(QR_template, data));
    const qrContent = sign(qrPayload, privateSigningKeyPem);

    const zip = new JSZip();
    zip.file(CERTIFICATE_FILE, qrContent, {
        compression: "DEFLATE"
    });
    const zippedData = await zip.generateAsync({type: "string", compression: "DEFLATE"})
      .then(function (content) {
          // console.log(content)
          return content;
      });
    const qrImage = await QRCode.toDataURL(zippedData, {scale: 2});
    data = {...data, qrContent, qrImage};

    const template = fs.readFileSync(TEMPLATES_FOLDER+r4TemplateFile, 'utf8');
    let fhirCert = render(template, data);

    return signFhirCert(fhirCert, data.vaccinationDate, privateSigningKeyPem)
}

function certificateToSmartHealthJson(certificate, meta) {
    let data = getDataFromCertificate(certificate, meta);

    // build Smart Health Payload
    const QR_template = fs.readFileSync(TEMPLATES_FOLDER+smartHealthTemplateFile, 'utf8');
    return render(QR_template, data)
}

function signFhirCert(fhirJson, vaccinationDate, privateKeyPem) {
    const token = sign(JSON.stringify(fhirJson), privateKeyPem);
    const splittedToken = token.split(".");
    splittedToken[1] = "";
    const detachedPayloadJWS = splittedToken.join(".");

    const organisationId = fhirJson.entry.filter(r => r.resourceType === "Organization").map(r => r.id)[0];

    let signature = {
        "type": [
            {
                "system": "urn:iso-astm:E1762-95:2013",
                "code": "1.2.840.10065.1.12.1.5",
                "display": "Verification Signature"
            }
        ],
        "when": new Date().toJSON(),
        "who": {
            "reference": "urn:uuid:"+organisationId
        },
        "targetFormat": "application/fhir+json",
        "sigFormat": "application/jose",
        "data": detachedPayloadJWS
    }

    fhirJson["signature"] = signature;

    return fhirJson;
}

function validateSignedFhirJson(fhirJson, publicSigningKeyPem) {

    const signature = fhirJson.signature;

    if (!signature || signature === "") {
        console.error("signature data is not present in bundle resource");
        return false
    }

    // removing the signature
    let payload = fhirJson;
    delete payload.signature;

    let splittedJWS = signature.data.split(".");
    splittedJWS[1] = base64url(JSON.stringify(payload), "utf8");

    try {
        return verify(splittedJWS.join("."), publicSigningKeyPem)
    } catch(err) {
        console.error(err);
        return false
    }
}

function validateQRContent(content, publicSigningKeyPem) {
    try {
        return verify(content, publicSigningKeyPem)
    } catch(err) {
        console.error(err);
        return false
    }
}

function sign(payload, privateKeyPem) {
    // const keypair = crypto.generateKeyPairSync(
    //   'ed25519',
    //   {
    //       privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
    //       publicKeyEncoding: { format: 'pem', type: 'spki' }
    //   }
    // )
    //
    // console.log(keypair.privateKey)
    // console.log(keypair.publicKey)
    // var ecprv = new rs.crypto.ECDSA({'prv': privateKeyPem, 'curve': 'secp256r1'});
    // return JWS.sign("ES256", {}, payload, ecprv)

    const prvKeyObj = rs.KEYUTIL.getKey(privateKeyPem);
    let alg = '';
    if (prvKeyObj instanceof rs.RSAKey)
        alg = 'RS256';
    else if (prvKeyObj instanceof rs.crypto.ECDSA)
        alg = 'ES256';
    else
        throw "unsupported signature type";
    return JWS.sign(alg, {}, payload, prvKeyObj)
}

function verify(content, publicKeyPem) {
    const pubKeyObj = rs.KEYUTIL.getKey(publicKeyPem);
    let acceptField = {};
    acceptField.alg = ['RS256', 'RS384', 'RS512',
        'PS256', 'PS384', 'PS512',
        'ES256', 'ES384', 'ES512'];

    return rs.jws.JWS.verifyJWT(content, pubKeyObj, acceptField);
}

module.exports = {
    certificateToFhirJson,
    certificateToSmartHealthJson,
    validateSignedFhirJson,
    validateQRContent
};
