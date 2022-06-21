const constants = require('../../configs/constants');
const config = require('../../configs/config');
const countries = require('i18n-iso-countries');
const configService = require('./configuration_service');
const {formatDate, formatId, getNumberWithOrdinal, concatenateReadableString} = require('./utils');

const mapCertificatesByPreEnrollmentCode = (certificates) => {
  const map = new Map();
  for(let certificate of certificates) {
    const preEnrollmentCode = certificate.preEnrollmentCode;
    let arr;
    if(map.get(preEnrollmentCode) === undefined) {
      arr = new Array();
    }
    else {
      arr = map.get(preEnrollmentCode)
    }
    arr.push(certificate);
    map.set(preEnrollmentCode, arr);
  }
  return map;
}

function filterByDob(certificates, dob) {
  let certificateData = getBasicBeneficiaryDataFromCert(certificates);
  return certificateData.filter(certificate => isEqualsDOB(certificate.dob, dob));
}

function isEqualsDOB(certificateDob, dob) {
  const dateCertificateDob = new Date(certificateDob);
  const dateRequestDob = new Date(dob);
  return dateRequestDob.getTime() === dateCertificateDob.getTime();
}

const sortCertificatesForEachBeneficiary = (certificates) => {
  const certificatesMapByPreEnrollmentCode = mapCertificatesByPreEnrollmentCode(certificates);
  for([preEnrollmentCode, certificates] of certificatesMapByPreEnrollmentCode) {
    certificatesMapByPreEnrollmentCode.set(preEnrollmentCode, ((sortCertificatesInDoseAndUpdateTimeAscOrder(certificates))[certificates.length - 1]));
  }
  return certificatesMapByPreEnrollmentCode;
}

const getBasicBeneficiaryDataFromCert = (certificates) => {
  const certificatesMapByPreEnrollmentCode = sortCertificatesForEachBeneficiary(certificates);
  const certificateData = new Array();
  for(let certificate of certificatesMapByPreEnrollmentCode.values()) {
    const credentialSubject = JSON.parse(certificate.certificate).credentialSubject;
    certificateData.push({
      preEnrollmentCode: certificate.preEnrollmentCode,
      name: credentialSubject.name,
      gender: credentialSubject.gender,
      dob: credentialSubject.dob
    });
  }
  return certificateData;
}

const sortCertificates = (certificates, groupingParam) => {
  if (certificates.length > 0) {
    if(!groupingParam){
      certificates = certificates.sort(function (a, b) {
        if (a.osUpdatedAt < b.osUpdatedAt) {
          return 1;
        }
        if (a.osUpdatedAt > b.osUpdatedAt) {
          return -1;
        }
        return 0;
      }).reverse();
      return certificates;
    }
    certificates = certificates.sort(function (a, b) {
      let parsedCertificate = JSON.parse(a.certificate);
      let groupingParamValueA = getParamValue(parsedCertificate, groupingParam);
      parsedCertificate = JSON.parse(b.certificate);
      let groupingParamValueB = getParamValue(parsedCertificate, groupingParam);
      if (groupingParamValueA === groupingParamValueB) {
        if (a.osUpdatedAt < b.osUpdatedAt) {
          return 1;
        }
        if (a.osUpdatedAt > b.osUpdatedAt) {
          return -1;
        }
      }
      return groupingParamValueB - groupingParamValueA;
    }).reverse();
    return certificates;
  }
};

function getParamValue(obj, param, result){
  for (const prop in obj) {
    const value = obj[prop];
    if (typeof value === 'object') {
      result = getParamValue(value, param,result);
    }
    else if(prop == param){
      result = value;
      return result;
    }
  }
  return result;
}

const getLatestCertificateV2 = (certificates, groupingParam) => {
  if(certificates.length > 0) {
    let sortedCerts = sortCertificates(certificates, groupingParam);
    return sortedCerts[sortedCerts.length - 1];
  }
};

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

const getVaccineDetailsOfPreviousDoses = (certificates) => {
  let doseToVaccinationDetailsMap = new Map();
  if (certificates.length > 0) {
    for (let i = 0; i < certificates.length; i++) {
      const certificateTmp = JSON.parse(certificates[i].certificate);
      let evidence = certificateTmp.evidence[0];
      doseToVaccinationDetailsMap.set(evidence.dose, fetchVaccinationDetailsFromCert(evidence));
    }
  }
  return new Map([...doseToVaccinationDetailsMap].reverse());
}

const getPreviousEventsInfo = (certificates, groupingParam) => {
  let previousEventInfo = new Map();
  if (certificates.length > 0) {
    let sortedCerts = sortCertificates(certificates, groupingParam);
    if (!groupingParam) {
      return new Map([...sortedCerts]);
    }
    for (let i = 0; i < sortedCerts.length; i++) {
      let certificateTmp = JSON.parse(sortedCerts[i].certificate);
      previousEventInfo.set(getParamValue(certificateTmp, groupingParam), certificateTmp);
    }
  }
  return new Map([...previousEventInfo].reverse());
}

const prepareDataForVaccineCertificateTemplate = (certificateRaw, dataURL, doseToVaccinationDetailsMap) => {
  certificateRaw.certificate = JSON.parse(certificateRaw.certificate);
  const {certificate: {credentialSubject, evidence}} = certificateRaw;
  const certificateData = {
    name: credentialSubject.name,
    age: credentialSubject.age,
    gender: credentialSubject.gender,
    identity: formatId(credentialSubject.id),
    nationality: credentialSubject.nationality,
    beneficiaryId: credentialSubject.refId,
    recipientAddress: credentialSubject.address ? formatRecipientAddress(credentialSubject.address) : "",
    vaccine: evidence[0].vaccine,
    vaccinationDate: formatDate(evidence[0].date),
    vaccineBatch: evidence[0].batch,
    vaccineICD11Code: evidence[0].icd11Code || "",
    vaccineProphylaxis: evidence[0].prophylaxis || "",
    vaccineType: getVaxType(evidence[0].icd11Code, evidence[0].prophylaxis),
    vaccineManufacturer: evidence[0].manufacturer,
    vaccineValidDays: `after ${getVaccineValidDays(evidence[0].effectiveStart, evidence[0].effectiveUntil)} days`,
    vaccinatedBy: evidence[0].verifier.name,
    vaccinatedAt:  evidence[0].facility.name ? evidence[0].facility.address.district ? formatFacilityAddress(evidence[0]) : evidence[0].facility.name : "" ,
    qrCode: dataURL,
    dose: evidence[0].dose,
    totalDoses: evidence[0].totalDoses,
    isFinalDose: evidence[0].dose === evidence[0].totalDoses,
    isBoosterDose: evidence[0].dose > evidence[0].totalDoses,
    isBoosterOrFinalDose: evidence[0].dose >= evidence[0].totalDoses,
    currentDoseText: `(${getNumberWithOrdinal(evidence[0].dose)} Dose)`,
    certificateId: certificateRaw.certificateId,
    meta: certificateRaw.meta,
    raw: certificateRaw
  };
  certificateData["vaxEvents"] = getVaccineDetails(doseToVaccinationDetailsMap);
  return certificateData;
}

function getVaccineDetails(doseToVaccinationDetailsMap) {
  let vaxEvents = [];
  for (let [key, value] of doseToVaccinationDetailsMap) {
    let vaxEventMap = {
      dose: value.dose || "",
      doseType: (value.dose <= value.totalDoses) ?
        ("Primary Dose " + value.dose) :
        ("Booster Dose " + (value.dose - value.totalDoses)),
      vaxName: value.name || "",
      vaxBatch: value.batch || "",
      vaxManufacturer : value.manufacturer || "",
      dateOfVax: formatDate(value.date || ""),
      countryOfVax: value.vaccinatedCountry || "",
      validity: value.validity || "",
      vaxType: value.vaxType || "",
      vaxEvent: value || "" ,
    };
    vaxEvents.push(vaxEventMap);
  }
  return vaxEvents
}

function fetchVaccinationDetailsFromCert(evidence) {
  let vaccineDetails = {
    dose: evidence.dose,
    totalDoses: evidence.totalDoses,
    date: evidence.date,
    name: evidence.vaccine,
    vaxType: getVaxType(evidence.icd11Code, evidence.prophylaxis),
    batch: evidence.batch,
    manufacturer: evidence.manufacturer,
    vaccinatedCountry: evidence.facility.address.addressCountry,
    evidence: evidence,
  };
  return vaccineDetails;
}

function getVaxType(icd11Code, prophylaxis) {
  if(icd11Code && prophylaxis) {
    return icd11Code+', '+prophylaxis;
  } else {
    return 'Not Available';
  }
}

function formatRecipientAddress(address) {
  return concatenateReadableString(address.streetAddress, address.district)
}

function formatFacilityAddress(evidence) {
  return concatenateReadableString(evidence.facility.name, evidence.facility.address.district)
}

function getVaccineValidDays(start, end) {
  const a = new Date(start);
  const b = new Date(end);
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

const convertCertificateToDCCPayload = async(certificateRaw, nameDetails) => {
  let certificate = JSON.parse(certificateRaw.certificate);
  const configurationService = new configService.ConfigurationService();
  const VACCINE_MANUF = await configurationService.getObject(constants.EU_VACCINE_CONFIG_KEYS.MANUFACTURER);
  const EU_VACCINE_PROPH = await configurationService.getObject(constants.EU_VACCINE_CONFIG_KEYS.PROPHYLAXIS_TYPE);
  const EU_VACCINE_CODE = await configurationService.getObject(constants.EU_VACCINE_CONFIG_KEYS.VACCINE_CODE);
  if(VACCINE_MANUF === null || EU_VACCINE_PROPH === null || EU_VACCINE_CODE === null || EU_VACCINE_CODE === undefined || EU_VACCINE_PROPH === undefined || VACCINE_MANUF === undefined) {
    throw new Error("EU Vaccine Details are missing from Configuration");
  }
  const {credentialSubject, evidence} = certificate;
  const manufacturerCode = Object.keys(VACCINE_MANUF).filter(a => evidence[0].manufacturer?.toLowerCase().includes(a)).length > 0 ?
    Object.entries(VACCINE_MANUF).filter(([k, v]) => evidence[0].manufacturer?.toLowerCase().includes(k))[0][1] : "";
  const prophylaxisCode = Object.keys(EU_VACCINE_PROPH).filter(a => evidence[0].vaccine.toLowerCase().includes(a)).length > 0 ?
    Object.entries(EU_VACCINE_PROPH).filter(([k, v]) => evidence[0].vaccine.toLowerCase().includes(k))[0][1] : "";
  const vaccineCode = Object.keys(EU_VACCINE_CODE).filter(a => evidence[0].vaccine.toLowerCase().includes(a)).length > 0 ?
    Object.entries(EU_VACCINE_CODE).filter(([k, v]) => evidence[0].vaccine.toLowerCase().includes(k))[0][1] : "";
  const addressCountry = getAlpha2CodeForCountry(evidence[0].facility.address.addressCountry)
  const certificateId = "URN:UVCI:01:" + addressCountry + ":" + evidence[0].certificateId;
  
  const fullName = credentialSubject.name.trim();
  const lastName = fullName.substring(fullName.lastIndexOf(" ")+1)
  const firstName = fullName.substring(0,(fullName.length - lastName.length)).trim();
  let euPayload = {
    "ver": "1.3.0",
    "nam": {
      "fn": nameDetails.fn,
      "fnt": nameDetails.fnt,
    },
    "dob": dobOfRecipient(credentialSubject),
    "v": [
      {
        "tg": constants.EU_DISEASE[config.DISEASE_CODE.toLowerCase()],          // disease or agent targeted
        "vp": prophylaxisCode,                                          // vaccine or prophylaxis "1119349007"
        "mp": vaccineCode,                                              // vaccine medicinal product
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
  if (nameDetails.gn && nameDetails.gnt) {
    euPayload.nam.gn = nameDetails.gn;
    euPayload.nam.gnt = nameDetails.gnt
  }
  return euPayload
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
  getLatestCertificateV2,
  convertCertificateToDCCPayload,
  getVaccineDetailsOfPreviousDoses,
  getPreviousEventsInfo,
  prepareDataForVaccineCertificateTemplate,
  filterByDob
};