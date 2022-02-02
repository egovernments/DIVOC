const {Etcd3} = require('etcd3');
const config = require('./config/config');
const {MAPPINGS_KEYS} = require('./config/constants');

let ICD11_MAPPINGS = null, VACCINE_ICD11_MAPPINGS = null;
let etcdClient;
let configuration;

function init() {
    etcdClient = new Etcd3({hosts: config.ETCD_URL});
    setUpWatcher(MAPPINGS_KEYS.ICD);
    setUpWatcher(MAPPINGS_KEYS.VACCINE_ICD);
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
                updateMappingValues(key, res.value.toString())
            });
        })
        .catch(err => {
            console.log(err);
    });
}

function loadMappings(key) {
    let mapping;
    switch(key) {
        case MAPPINGS_KEYS.ICD:
            mapping = ICD11_MAPPINGS;
            break;
        case MAPPINGS_KEYS.VACCINE_ICD:
            mapping = VACCINE_ICD11_MAPPINGS;
            break;
    }
    return mapping;
}

class ConfigLayer{
    async getICDMappings(key) {
        let mapping = loadMappings(key)
        if(mapping === null || mapping === undefined) {
            if(configuration === null || configuration === null) {
                return null;
            }
            mapping = configuration.getICDMappings(key);
            updateMappingValues(key, mapping);
        }
        return mapping;
    }
}

const etcd = function() {
    this.getICDMappings = async function(key) {
        let mappingValue = (await etcdClient.get(key).string());
        return mappingValue;
    }
}

function updateMappingValues(key, value) {
    switch(key) {
        case MAPPINGS_KEYS.ICD:
            ICD11_MAPPINGS = value
            break;
        case MAPPINGS_KEYS.VACCINE_ICD:
            VACCINE_ICD11_MAPPINGS = value
            break;
    }
}

module.exports = {
    ConfigLayer,
    init
}