const {Etcd3} = require('etcd3');
const sanitizeHtml = require('sanitize-html');
const Handlebars = require('handlebars');
const config = require('../../configs/config');
const {TEMPLATES, EU_VACCINE_CONFIG_KEYS,HELPERS} = require('../../configs/constants');
let etcdClient;
let configuration;
let vaccineCertificateTemplate = null, testCertificateTemplate = null;
let EU_VACCINE_PROPH = null, EU_VACCINE_CODE = null, EU_VACCINE_MANUF = null;
let addHandlerHelper = null;
function init() {
  if(!config.ETCD_URL) {
    throw Error("ETCD_URL not set. Please set ETCD_URL")
  }
  let options = {hosts: config.ETCD_URL}
  if(config.ETCD_AUTH_ENABLED) {
    options = {
      ...options,
      auth: {
        username: config.ETCD_USERNAME,
        password: config.ETCD_PASSWORD
      }
    }
  }
  etcdClient = new Etcd3(options);
  setUpWatcher(TEMPLATES.VACCINATION_CERTIFICATE, );
  setUpWatcher(TEMPLATES.TEST_CERTIFICATE);
  setUpWatcher(HELPERS.CERTIFICATE_HELPER_FUNCTIONS);
  setUpWatcher(EU_VACCINE_CONFIG_KEYS.VACCINE_CODE);
  setUpWatcher(EU_VACCINE_CONFIG_KEYS.MANUFACTURER);
  setUpWatcher(EU_VACCINE_CONFIG_KEYS.PROPHYLAXIS_TYPE);
  configuration = config.CONFIGURATION_LAYER.toLowerCase() === 'etcd' ? new etcd(): null ;
}

function cleanHTML(html) {
  if(html === null) {
    return null;
  }
  const cleanedHtml = sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    allowedClasses: {
      "*": ["*"]
    },
    parser: {
      lowerCaseAttributeNames: false
    },
    allowedScriptDomains: [''],
    allowedScriptHostnames: [''],
    allowedIframeHostnames: [''],
    allowedIframeDomains: ['']
  });
  return cleanedHtml;
}

function updateConfigValues(key, value) {
  switch(key) {
    case TEMPLATES.VACCINATION_CERTIFICATE:
      vaccineCertificateTemplate = value;
      break;
    case TEMPLATES.TEST_CERTIFICATE:
      testCertificateTemplate = value;
      break;
    case HELPERS.CERTIFICATE_HELPER_FUNCTIONS:
      addHandlerHelper = value;
      break;
    case EU_VACCINE_CONFIG_KEYS.VACCINE_CODE:
      EU_VACCINE_CODE = value;
      break;
    case EU_VACCINE_CONFIG_KEYS.MANUFACTURER:
      EU_VACCINE_MANUF = value;
      break;
    case EU_VACCINE_CONFIG_KEYS.PROPHYLAXIS_TYPE:
      EU_VACCINE_PROPH = value;
      break;
  }
}

function setUpWatcher(templateKey) {
  etcdClient.watch()
    .key(templateKey)
    .create()
    .then(watcher => {
      watcher
      .on('end', (end) => {
        console.log('end')
      })
      .on('connected', (req) => {
        console.log('connected');
      })
      .on('put', res => {
        updateConfigValues(templateKey, res.value.toString());
      });
    })
    .catch(err => {
      console.log(err);
    });
}

async function loadConfigurationValues(key, fetchConfigCallbackFunc) {
  let value;
  switch(key) {
    case TEMPLATES.VACCINATION_CERTIFICATE:
      value = vaccineCertificateTemplate;
      break;
    case TEMPLATES.TEST_CERTIFICATE:
      value = testCertificateTemplate;
      break;
    case HELPERS.CERTIFICATE_HELPER_FUNCTIONS:
      value = addHandlerHelper;
      break;
    case EU_VACCINE_CONFIG_KEYS.MANUFACTURER:
      value = EU_VACCINE_MANUF;
      break;
    case EU_VACCINE_CONFIG_KEYS.VACCINE_CODE:
      value = EU_VACCINE_CODE;
      break;
    case EU_VACCINE_CONFIG_KEYS.PROPHYLAXIS_TYPE:
      value = EU_VACCINE_PROPH;
      break;
  }
  if(value === null || value === undefined) {
    if(configuration === null || configuration === undefined) {
      return null;
    }
    value = fetchConfigCallbackFunc();
  }
  return value;
}

class ConfigurationService {
  async getCertificateTemplate(key) {
    let certificateTemplate = await loadConfigurationValues(key, async() => await configuration.getCertificateTemplate(key));
    certificateTemplate = cleanHTML(certificateTemplate);
    updateConfigValues(key, certificateTemplate);
    return certificateTemplate;
  }
  async addHelpers(key){
    let helper = await loadConfigurationValues(key, async() => await configuration.addHelpers(key));
    updateConfigValues(key,helper);
    return helper;
  }
  async getEUVaccineDetails(key) {
    let details = await loadConfigurationValues(key, async() => await configuration.getEUVaccineDetails(key));
    updateConfigValues(key, details);
    return JSON.parse(details);
  }
}

const etcd = function() {
  this.getCertificateTemplate = async function(templateKey) {
    const template = (await etcdClient.get(templateKey).string());
    return template;
  }
  this.addHelpers = async function(key) {
    const value = (await etcdClient.get(key).string());
    return value;
  }

  this.getEUVaccineDetails = async function(key) {
    const value = (await etcdClient.get(key).string());
    return value;
  }
}

module.exports = {
  ConfigurationService, init
}