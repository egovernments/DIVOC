const {Etcd3} = require('etcd3');
const config = require('./config/config');

let etcdClient, configuration;
let valueMap = {};
function init() {
    let options = {
       hosts: config.ETCD_URL,
    }
    if(config.ETCD_AUTH_ENABLED) {
        options = {
            ...options,
            auth: {
                username: config.ETCD_USERNAME,
                password: config.ETCD_PASSWORD
            }
        }
    }
    etcdClient = new Etcd3({hosts: config.ETCD_URL});
    configuration = config.CONFIGURATION_LAYER.toLowerCase() === 'etcd' ? new etcd() : null
    keys = config.CONFIG_KEYS.split(',');
    keys.forEach(key => {
        setUpWatcher(key);
    });
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
                valueMap[key] = res.value.toString();
            });
        })
        .catch(err => {
            console.error(err);
    });
}

class ConfigLayer{
    async getConfigValue(key) {
        let mapping = valueMap[key];
        if(mapping === null || mapping === undefined) {
            if(configuration === null || configuration === undefined) {
                return null;
            }
            mapping = configuration.getConfigValue(key);
            valueMap[key] = mapping;
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

init();

module.exports = {
    ConfigLayer,
    init
}