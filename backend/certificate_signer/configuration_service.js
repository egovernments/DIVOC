const {Etcd3} = require('etcd3');
const config = require('./config/config');
const {CONFIG_KEYS} = require('./config/constants');

let ICD11_MAPPINGS = null, VACCINE_ICD11_MAPPINGS = null, DDCC_TEMPLATE = null, W3C_TEMPLATE = null, CERTIFICATES_OPTIONAL_FIELDS_KEY_PATH = null;
let etcdClient;
let configuration;

function init() {
    if(!config.ETCD_URL) {
        throw Error('ETCD_URL not set. Please set ETCD_URL')
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
    setUpWatcher(CONFIG_KEYS.ICD);
    setUpWatcher(CONFIG_KEYS.VACCINE_ICD);
    setUpWatcher(CONFIG_KEYS.DDCC_TEMPLATE);
    setUpWatcher(CONFIG_KEYS.W3C_TEMPLATE);
    setUpWatcher(CONFIG_KEYS.CERTIFICATES_OPTIONAL_FIELDS_KEY_PATH);
    configuration = config.CONFIGURATION_LAYER.toLowerCase() === 'etcd' ? new etcd() : null
}

function setUpWatcher(key) {
    etcdClient.watch()
        .key(key)
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
                updateConfigValues(key, res.value.toString())
            });
        })
        .catch(err => {
            console.log(err);
    });
}

function loadConfigValues(key) {
    let mapping;
    switch(key) {
        case CONFIG_KEYS.ICD:
            mapping = ICD11_MAPPINGS;
            break;
        case CONFIG_KEYS.VACCINE_ICD:
            mapping = VACCINE_ICD11_MAPPINGS;
            break;
        case CONFIG_KEYS.DDCC_TEMPLATE:
            mapping = DDCC_TEMPLATE;
            break;
        case CONFIG_KEYS.CERTIFICATES_OPTIONAL_FIELDS_KEY_PATH:
            mapping = CERTIFICATES_OPTIONAL_FIELDS_KEY_PATH;
            break;
        case CONFIG_KEYS.W3C_TEMPLATE:
            mapping = W3C_TEMPLATE;
            break;
    }
    return mapping;
}

class ConfigLayer{
    async getConfigValue(key) {
        let mapping = loadConfigValues(key)
        if(mapping === null || mapping === undefined) {
            if(configuration === null || configuration === null) {
                return null;
            }
            mapping = configuration.getConfigValue(key);
            updateConfigValues(key, mapping);
        }
        return mapping;
    }
}

const etcd = function() {
    this.getConfigValue = async function(key) {
        let mappingValue = (await etcdClient.get(key).string());
        return mappingValue;
    }
}

function updateConfigValues(key, value) {
    switch(key) {
        case CONFIG_KEYS.ICD:
            ICD11_MAPPINGS = value;
            break;
        case CONFIG_KEYS.VACCINE_ICD:
            VACCINE_ICD11_MAPPINGS = value;
            break;
        case CONFIG_KEYS.DDCC_TEMPLATE:
            DDCC_TEMPLATE = value;
            break;
        case CONFIG_KEYS.W3C_TEMPLATE:
            W3C_TEMPLATE = value;
            break;
        case CONFIG_KEYS.CERTIFICATES_OPTIONAL_FIELDS_KEY_PATH:
            CERTIFICATES_OPTIONAL_FIELDS_KEY_PATH = value;
            break;
    }
}

module.exports = {
    ConfigLayer,
    init
}