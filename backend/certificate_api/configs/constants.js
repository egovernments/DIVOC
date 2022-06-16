const EU_DISEASE = {"covid-19": "840539006"};
const TEMPLATES = {
  EU_VACCINATION_CERTIFICATE: "euVaccineCertificateTemplate",
  VACCINATION_CERTIFICATE: "vaccineCertificateTemplate",
  TEST_CERTIFICATE: "testCertificateTemplate"
};
Object.freeze(TEMPLATES);

const EU_VACCINE_CONFIG_KEYS = {
  PROPHYLAXIS_TYPE: "euVaccineProph",
  VACCINE_CODE: "euVaccineCode",
  MANUFACTURER: "euVaccineManuf"
}

const HELPERS = {
  CERTIFICATE_HELPER_FUNCTIONS: "certificateHelperFunctions"
}

const ENTITY_TYPES = {
  VACCINATION_CERTIFICATE: "VaccinationCertificate",
  TEST_CERTIFICATE: "TestCertificate"
}

const QR_TYPE = "qrcode";

const TEMPLATE_KEY = "certificateTemplate";
const PARAMS_KEY = "programParams";
const HELPER_FUNCTIONS_KEY = "programHelperFunctions";

module.exports = {
  EU_DISEASE,
  TEMPLATES,
  EU_VACCINE_CONFIG_KEYS,
  QR_TYPE,
  HELPERS,
  ENTITY_TYPES,
  TEMPLATE_KEY,
  PARAMS_KEY,
  HELPER_FUNCTIONS_KEY
}