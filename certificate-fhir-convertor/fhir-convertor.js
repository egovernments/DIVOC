const { v4: uuidv4 } = require('uuid');
const R = require('ramda');
const Mustache = require("mustache");
const fs = require('fs');
const config = require('./configs/config');
const jwt = require('jsonwebtoken');
const base64url = require('base64url');

const TEMPLATES_FOLDER = __dirname +'/configs/templates/';
const r4TemplateFile = 'fhir-r4.template';

function render(template, data) {
    return Mustache.render(JSON.stringify(template), data);
}

function certificateToFhirJson(certificate, privateSigningKeyPem) {
    const dateString = new Date().toJSON();

    const patientId = uuidv4();
    const organisationId = uuidv4();
    const practitionerId =  uuidv4();
    const bundleId = uuidv4();
    const compositionId = uuidv4();
    const immunizationId = uuidv4();

    const practitionerName = R.pathOr('', ['evidence', 0, 'verifier', 'name'], certificate);
    const vaccineName = R.pathOr('', ['evidence', 0, 'vaccine'], certificate);
    if (!Object.keys(config.VACCINE_MAPPINGS).includes(vaccineName)) {
        throw new Error("unsupported vaccine name "+ vaccineName)
    }
    const vaccineCode = config.VACCINE_MAPPINGS[vaccineName].code;

    const facilityName = R.pathOr('', ['evidence', 0, 'facility', 'name'], certificate);
    const facilityCity = R.pathOr('', ['evidence', 0, 'facility', 'address', 'city'], certificate);
    const facilityDistrict = R.pathOr('', ['evidence', 0, 'facility', 'address', 'district'], certificate);
    const facilityCountry = R.pathOr('', ['evidence', 0, 'facility', 'address', 'addressCountry'], certificate);
    const facilityId = facilityName.split(' ').join('-');

    const patientNationality = R.pathOr('', ['credentialSubject', 'nationality'], certificate);
    const patientGovtId = R.pathOr('', ['credentialSubject', 'id'], certificate);
    const patientName = R.pathOr('', ['credentialSubject', 'name'], certificate);
    const patientGender = R.pathOr('', ['credentialSubject', 'gender'], certificate).toLowerCase();
    const vaccinationDate = R.pathOr('', ['evidence', 0, 'date'], certificate);
    const manufacturer = R.pathOr('', ['evidence', 0, 'manufacturer'], certificate);
    const batchNumber = R.pathOr('', ['evidence', 0, 'batch'], certificate);
    const effectiveUntilDate = R.pathOr('', ['evidence', 0, 'effectiveUntil'], certificate);
    const dose = parseInt(R.pathOr('', ['evidence', 0, 'dose'], certificate));

    const data = {
        dateString, patientId, organisationId, practitionerId, bundleId, compositionId, immunizationId,
        practitionerName, vaccineName, vaccineCode,
        facilityName, facilityCity, facilityDistrict, facilityCountry, facilityId,
        patientNationality, patientGovtId, patientName, patientGender, vaccinationDate,
        manufacturer, batchNumber, effectiveUntilDate, dose
    };

    const template = fs.readFileSync(TEMPLATES_FOLDER+r4TemplateFile, 'utf8');
    let fhirCert = JSON.parse(Mustache.render(template, data));

    return signFhirCert(fhirCert, vaccinationDate, privateSigningKeyPem)
}

function signFhirCert(fhirJson, vaccinationDate, privateKeyPem) {
    const token = jwt.sign(JSON.stringify(fhirJson), privateKeyPem, { algorithm: 'RS256'});
    const splittedToken = token.split(".");
    splittedToken[1] = "";
    const detachedPayloadJWS = splittedToken.join(".");

    const bundleId = fhirJson.id;
    const organisationId = fhirJson.entry.filter(r => r["resource"]?.resourceType === "Organization").map(r => r["resource"].id)[0];
    const provenanceId = uuidv4();

    let provenance = {
        "resource": {
            "resourceType": "Provenance",
            "id": provenanceId,
            "target": [
                {
                    "reference": "Bundle/"+bundleId
                }
            ],
            "recorded": vaccinationDate,
            "who": {
                "identifier": {
                    "system": "urn:ietf:rfc:3986",
                    "value": "xxxxxx"
                }
            },
            "signature": [
                {
                    "type": [
                        {
                            "system": "urn:iso-astm:E1762-95:2013",
                            "code": "1.2.840.10065.1.12.1.5",
                            "display": "Verification Signature"
                        }
                    ],
                    "when": new Date().toJSON(),
                    "who": {
                        "reference": "Organization/"+organisationId
                    },
                    "targetFormat": "application/fhir+json",
                    "sigFormat": "application/jose",
                    "data": detachedPayloadJWS
                }
            ]
        }
    };

    fhirJson.entry.push({"fullUrl": "urn:uuid:"+provenanceId});
    fhirJson.entry.push(provenance);

    return fhirJson;
}

function validateSignedFhirJson(fhirJson, publicSigningKeyPem){
    const data = fhirJson.entry
        .filter(r => r["resource"]?.resourceType === "Provenance")
        .map(r => r["resource"].signature[0].data)[0];
    const provenanceId = fhirJson.entry
        .filter(r => r["resource"]?.resourceType === "Provenance")
        .map(r => r["resource"].id)[0];

    if (!data || data === "") {
        console.error("signature data is not present in provenance resource");
        return false
    }

    // removing the provenance resource
    let payload = fhirJson;
    payload.entry = fhirJson.entry.filter(r => r["resource"]?.resourceType !== "Provenance").filter(r => r["fullUrl"] !== "urn:uuid:" + provenanceId);

    let splittedJWS = data.split(".");
    splittedJWS[1] = base64url(JSON.stringify(payload), "utf8");

    try {
        const decoded = jwt.verify(splittedJWS.join("."), publicSigningKeyPem);
        return decoded.resourceType === "Bundle"
    } catch(err) {
        console.error(err);
        return false
    }
}

module.exports = {
    certificateToFhirJson,
    validateSignedFhirJson
};
