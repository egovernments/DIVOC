import {CONSTANT} from "../utils/constants";
const {Etcd3} = require('etcd3');
const config = require('../config');
let etcdClient;
let configuration;
let countrySpecificFeatures = null, programComorbidities = null;

function etcdInit() {
    if (!config.ETCD_URL) {
        throw Error("ETCD_URL not set. Please set ETCD_URL")
    }
    let options = {hosts: config.ETCD_URL}
    if (config.ETCD_AUTH_ENABLED) {
        options = {
            ...options,
            auth: {
                username: config.ETCD_USERNAME,
                password: config.ETCD_PASSWORD
            }
        }
    }
    etcdClient = new Etcd3(options);

    setUpWatcher(CONSTANT.COUNTRY_SPECIFIC_FEATURES_KEY);
    setUpWatcher(CONSTANT.PROGRAM_COMORBIDITIES_KEY);

    configuration = config.CONFIGURATION_LAYER.toLowerCase() === 'etcd' ? new etcd(): null ;
}

function updateConfigValues(key, value) {
    switch(key) {
        case CONSTANT.COUNTRY_SPECIFIC_FEATURES_KEY:
            countrySpecificFeatures = value;
            break;
        case CONSTANT.PROGRAM_COMORBIDITIES_KEY:
            programComorbidities = value;
            break;
    }
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
                    updateConfigValues(key, res.value.toString());
                });
        })
        .catch(err => {
            console.log(err);
        });
}

async function loadConfigurationValues(key, fetchConfigCallbackFunc) {
    let value;
    switch(key) {
        case CONSTANT.COUNTRY_SPECIFIC_FEATURES_KEY:
            value = countrySpecificFeatures;
            break;
        case CONSTANT.PROGRAM_COMORBIDITIES_KEY:
            value = programComorbidities;
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

class EtcdConfigService {
    async getCountrySpecificFeatures(key) {
        let details = await loadConfigurationValues(key, async() => await configuration.getCountrySpecificFeatures(key));
        updateConfigValues(key, details);
        return JSON.parse(details);
    }
    async getProgramComorbidities(key) {
        let details = await loadConfigurationValues(key, async() => await configuration.getProgramComorbidities(key));
        updateConfigValues(key, details);
        return JSON.parse(details);
    }
}

const etcd = function() {
    this.getCountrySpecificFeatures = async function(key) {
        return (await etcdClient.get(key).string());
    }
    this.getProgramComorbidities = async function(key) {
        return (await etcdClient.get(key).string());
    }
}

module.exports = {
    EtcdConfigService, etcdInit
}