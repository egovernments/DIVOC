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

const QR_TYPE = "qrcode";

module.exports = {
  EU_DISEASE,
  TEMPLATES,
  EU_VACCINE_CONFIG_KEYS,
  QR_TYPE,
  HELPERS
}