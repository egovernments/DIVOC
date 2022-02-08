const EU_DISEASE = {"covid-19": "840539006"};
const TEMPLATES = {
  VACCINATION_CERTIFICATE: "vaccineCertificateTemplate",
  TEST_CERTIFICATE: "testCertificateTemplate"
};
Object.freeze(TEMPLATES);

const EU_VACCINE = {
  PROPH: "euVaccineProph",
  CODE: "euVaccineCode",
  MANUF: "euVaccineManuf"
}

module.exports = {
  EU_DISEASE,
  TEMPLATES,
  EU_VACCINE
}