const CONFIG_KEYS = {
  ICD: "ICD",
  VACCINE_ICD: "VACCINE_ICD",
  CERTIFICATES_OPTIONAL_FIELDS_KEY_PATH: "certificateOptionalFieldsKeyPaths",
  DDCC_TEMPLATE: "DDCC_TEMPLATE",
  W3C_TEMPLATE: "W3C_TEMPLATE"
};
const PROC_TOPIC = 'proc_status'
Object.freeze(CONFIG_KEYS);

module.exports = {
  CONFIG_KEYS,
  PROC_TOPIC
}