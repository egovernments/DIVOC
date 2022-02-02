const EU_DISEASE = {"covid-19": "840539006"};
const EU_VACCINE_PROPH = {
  "covaxin": "J07BX03",
  "covishield": "J07BX03",
  "sputnik": "J07BX03",
  "pfizer-biontech": "J07BX03",
  "comirnaty": "J07BX03",
  "janssen": "J07BX03",
  "moderna": "J07BX03",
  "spikevax": "J07BX03",
  "astrazeneca": "J07BX03",
  "vaxzevria": "J07BX03",
  "sinovac": "J07BX03",
  "coronavac": "J07BX03",
  "bbibp-corv": "J07BX03",
  "sinopharm": "J07BX03",
  "convidecia": "J07BX03",
  "novavax": "J07BX03",
  "covovax": "J07BX03"
};
const EU_VACCINE_CODE = {
  "covaxin": "Covaxin",
  "covishield": "Covishield",
  "sputnik": "Sputnik-V",
  "pfizer-biontech": "EU/1/20/1528",
  "comirnaty": "EU/1/20/1528",
  "janssen": "EU/1/20/1525",
  "moderna": "EU/1/20/1507",
  "spikevax": "EU/1/20/1507",
  "astrazeneca": "EU/1/21/1529",
  "vaxzevria": "EU/1/21/1529",
  "sinovac": "CoronaVac",
  "coronavac": "CoronaVac",
  "bbibp-corv": "BBIBP- CorV",
  "sinopharm": "BBIBP- CorV",
  "convidecia": "Convidecia",
  "novavax": "NVX - CoV2373",
  "covovax": "NVX - CoV2373"
}
const VACCINE_MANUF = {
  "bharat": "Bharat-Biotech",
  "serum": "ORG-100001981",
  "gamaleya": "Gamaleya-Research-Institute",
  "biontech": "ORG-100030215",
  "janssen": "ORG-100001417",
  "moderna": "ORG-100031184",
  "astrazeneca": "ORG-100001699",
  "sinovac": "Sinovac- Biontech",
  "sinopharm": "ORG-100020693",
  "canSino": "ORG-100013793",
  "novavax": "ORG-100032020"
};

const TEMPLATES = {
  VACCINE: "vaccineCertificateTemplate",
  TEST: "testCertificateTemplate"
};
Object.freeze(TEMPLATES);

module.exports = {
  EU_DISEASE,
  EU_VACCINE_PROPH,
  EU_VACCINE_CODE,
  VACCINE_MANUF,
  TEMPLATES
}