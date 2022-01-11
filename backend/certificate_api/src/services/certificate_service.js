const constants = require('../../configs/constants');
const config = require('../../configs/config');
const countries = require('i18n-iso-countries')

const sortCertificatesInDoseAndUpdateTimeAscOrder = (certificates) => {
  if (certificates.length > 0) {
    certificates = certificates.sort(function (a, b) {
      const parsedEvidenceOfA = JSON.parse(a.certificate);
      const parsedEvidenceOfB = JSON.parse(b.certificate);
      if (parsedEvidenceOfA.evidence[0].dose === parsedEvidenceOfB.evidence[0].dose) {
        if (a.osUpdatedAt < b.osUpdatedAt) {
          return 1;
        }
        if (a.osUpdatedAt > b.osUpdatedAt) {
          return -1;
        }
      }
      return parsedEvidenceOfB.evidence[0].dose - parsedEvidenceOfA.evidence[0].dose;
    }).reverse();
    return certificates;
  }
};
const getLatestCertificate = (certificates) => {
  if(certificates.length > 0) {
    let sortedCerts = sortCertificatesInDoseAndUpdateTimeAscOrder(certificates);
    return sortedCerts[sortedCerts.length - 1];
  }
};

const convertCertificateToDCCPayload = (certificateRaw) => {
  let certificate = JSON.parse(certificateRaw.certificate);

  const {credentialSubject, evidence} = certificate;
  const manufacturerCode = Object.keys(constants.VACCINE_MANUF).filter(a => evidence[0].manufacturer.toLowerCase().includes(a)).length > 0 ?
    Object.entries(constants.VACCINE_MANUF).filter(([k, v]) => evidence[0].manufacturer.toLowerCase().includes(k))[0][1] : "";
  const prophylaxisCode = Object.keys(constants.EU_VACCINE_PROPH).filter(a => evidence[0].vaccine.toLowerCase().includes(a)).length > 0 ?
    Object.entries(constants.EU_VACCINE_PROPH).filter(([k, v]) => evidence[0].vaccine.toLowerCase().includes(k))[0][1] : "";
  const addressCountry = getAlpha2CodeForCountry(evidence[0].facility.address.addressCountry)
  const certificateId = "URN:UVCI:01:" + addressCountry + ":" + evidence[0].certificateId;
  const fullNameSplitArr = credentialSubject.name.split(' ');
  return {
    "ver": "1.0.0",
    "nam": {
      "fn": fullNameSplitArr[fullNameSplitArr.length - 1],
      "gn": firstNameOfRecipient(fullNameSplitArr)
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
        "co": addressCountry,                                                   // Country of Vaccination
        "is": config.PUBLIC_HEALTH_AUTHORITY,                                   // Certificate Issuer
        "ci": certificateId                                                     // Unique Certificate Identifier
      }
    ]
  };
}

function firstNameOfRecipient(nameArr) {
  let firstName = '';
  for(let i=0; i<nameArr.length - 1; i++) {
    firstName += nameArr[i] + " ";
  }
  return firstName.trim();
}

function getAlpha2CodeForCountry(addressCountry) {
  return getAlpha2CodeFromAlpha3(addressCountry) || getAlpha2CodeFromName(addressCountry) || getAlpha2CodeIfValid(addressCountry) || 'IN';
}

function getAlpha2CodeFromAlpha3(addressCountry) {
  return addressCountry.length === 3 && countries.isValid(addressCountry) ? countries.alpha3ToAlpha2(addressCountry) : undefined;
}

function getAlpha2CodeFromName(addressCountry) {
  return countries.getAlpha2Code(addressCountry, 'en');
}

function getAlpha2CodeIfValid(addressCountry) {
  return countries.isValid(addressCountry) ? addressCountry: undefined;
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
  sortCertificatesInDoseAndUpdateTimeAscOrder,
  getLatestCertificate,
  convertCertificateToDCCPayload
};