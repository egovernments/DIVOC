const constants = require('../../configs/constants');
const dcc = require("@pathcheck/dcc-sdk");
const config = require('../../configs/config');

const getLatestCertificate = (certificates) => {
  if (certificates.length > 0) {
    certificates = certificates.sort(function (a, b) {
      if (a.osUpdatedAt < b.osUpdatedAt) {
        return 1;
      }
      if (a.osUpdatedAt > b.osUpdatedAt) {
        return -1;
      }
      return 0;
    }).reverse();
    return certificates[certificates.length - 1];
  }
};

const convertCertificateToDCCPayload = async (certificateRaw, publicKeyPem, privateKeyP8) => {
  let certificate = JSON.parse(certificateRaw.certificate);

  const {credentialSubject, evidence} = certificate;
  const manufacturerCode = Object.keys(constants.VACCINE_MANUF).filter(a => evidence[0].manufacturer.toLowerCase().includes(a)).length > 0 ?
    Object.entries(constants.VACCINE_MANUF).filter(([k, v]) => evidence[0].manufacturer.toLowerCase().includes(k))[0][1] : "";
  const prophylaxisCode = Object.keys(constants.EU_VACCINE_PROPH).filter(a => evidence[0].vaccine.toLowerCase().includes(a)).length > 0 ?
    Object.entries(constants.EU_VACCINE_PROPH).filter(([k, v]) => evidence[0].vaccine.toLowerCase().includes(k))[0][1] : "";
  const euPayload = {
    "ver": "1.0.0",
    "nam": {
      "fn": credentialSubject.name
    },
    "dob": dobOfRecipient(credentialSubject),
    "v": [
      {
        "tg": constants.EU_DISEASE[config.DISEASE_CODE.toLowerCase()],          // disease or agent targeted
        "vp": prophylaxisCode,                                          // vaccine or prophylaxis "1119349007"
        "mp": evidence[0].vaccine,                                              // vaccine medicinal product
        "ma": manufacturerCode,                                                 // Marketing Authorization Holder - if no MAH present, then manufacturer
        "dn": evidence[0].dose,                                                 // Dose Number
        "sd": evidence[0].totalDoses,                                           // Total Series of Doses
        "dt": evidence[0].date.split("T")[0],                                   // ISO8601 complete date: Date of Vaccination
        "co": evidence[0].facility.address.addressCountry,                      // Country of Vaccination
        "is": config.PUBLIC_HEALTH_AUTHORITY,                                   // Certificate Issuer
        "ci": evidence[0].certificateId                                         // Unique Certificate Identifier
      }
    ]
  };

  const qrUri = await dcc.signAndPack(await dcc.makeCWT(euPayload), publicKeyPem, privateKeyP8);

  return qrUri;

}

function dobOfRecipient(credentialSubject) {
  const dob = credentialSubject.dob;
  const age = credentialSubject.age;
  if (dob && new Date(dob).getFullYear() > 1900) return dob;
  // can specify only year as in EU tech documentation
  if (age && age > 0)
    return (new Date().getFullYear() - age).toString();
  return "";
}

module.exports = {
  getLatestCertificate,
  convertCertificateToDCCPayload
};