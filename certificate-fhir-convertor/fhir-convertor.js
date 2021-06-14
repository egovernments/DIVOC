const { v4: uuidv4 } = require('uuid');
const R = require('ramda');
const Mustache = require("mustache");
const fs = require('fs');
const config = require('./configs/config');

const TEMPLATES_FOLDER = __dirname +'/configs/templates/';
const r4TemplateFile = 'fhir-r4.template';

function render(template, data) {
    return Mustache.render(JSON.stringify(template), data);
}

function certificateToFhirJson(certificate) {
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
    return Mustache.render(template, data);
}

module.exports = {
    certificateToFhirJson
};
