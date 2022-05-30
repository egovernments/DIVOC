const EU_DISEASE = {"covid-19": "840539006"};
const TEMPLATES = {
  EU_VACCINATION_CERTIFICATE: "euVaccineCertificateTemplate",
  VACCINATION_CERTIFICATE: "vaccineCertificateTemplate",
  TEST_CERTIFICATE: "testCertificateTemplate",
  HEALTH_PROFESSIONAL_CERTIFICATE: "healthProfessionalCertificateTemplate"
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
  TEST_CERTIFICATE: "TestCertificate",
  HEALTH_PROFESSIONAL_CERTIFICATE: "HealthProfessionalCertificate"
}

const QR_TYPE = "qrcode";

module.exports = {
  EU_DISEASE,
  TEMPLATES,
  EU_VACCINE_CONFIG_KEYS,
  QR_TYPE,
  HELPERS,
  ENTITY_TYPES
}