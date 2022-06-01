describe('should retrieve all mappings if correct configuration layer passed', () => {
    const etcd3 = require('etcd3');
    const config = require('../config/config');
    const { CONFIG_KEYS } = require('../config/constants');
    var mockConfig = {
        CONFIGURATION_LAYER: 'etcd',
        ETCD_URL: 'etcd:2379',
        ETCD_AUTH_ENABLED: true,
        ETCD_USERNAME: 'etcd',
        ETCD_PASSWORD: 'etcd'
    }
    jest.mock('../config/config', () => {
        return mockConfig;
    });
    console.log = jest.fn();
    const {ConfigLayer, init} = require('../configuration_service');
    var getFn = {
        string: jest.fn()
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve({})
                }))
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve([])
                }))
    }
    var mockWatcher = {
        on: jest.fn((event, callback) => {
            callback('some')
        })
    }
    var mockEtcd3Constructor = {
        get: jest.fn().mockImplementation(() => getFn),
        watch: jest.fn().mockImplementation(() => {
            return {
                key: jest.fn().mockImplementation(() => {
                    return {
                        create: jest.fn()
                            .mockReturnValueOnce(new Promise((resolve, reject) => {
                                resolve(mockWatcher);
                            }))
                            .mockReturnValueOnce(new Promise((resolve, reject) => {
                                resolve(mockWatcher);
                            }))
                    }
                })
            }
        })
    };
    jest.mock('etcd3', () => {
        return {
            Etcd3: jest.fn().mockImplementation(() => mockEtcd3Constructor)
        }
    });

    beforeEach(() => {
        init();
    });
    
    test('should initialise five times watchers each for ICD, VACCINE_ICD, DDCC_TEMPLATE, W3C_TEMPLATE and FIELDS_KEY_PATH ', () => {
        expect(etcd3.Etcd3).toHaveBeenCalledWith({hosts: 'etcd:2379', auth:{username: 'etcd', password: 'etcd'}});
        expect(mockEtcd3Constructor.watch).toHaveBeenCalledTimes(6);
    });
    
    test('should fetch values of ICD Mapping and VACCINE_ICD mapping from etcd', async() => {
        const ICD = await (new ConfigLayer()).getConfigValue(CONFIG_KEYS.ICD);
        const VACCINE_ICD = await (new ConfigLayer()).getConfigValue(CONFIG_KEYS.VACCINE_ICD);
        expect(ICD).toEqual({})
        expect(VACCINE_ICD).toEqual([])
        expect(mockEtcd3Constructor.get).toHaveBeenCalledTimes(2);
        expect(mockEtcd3Constructor.get).toHaveBeenCalledWith(CONFIG_KEYS.ICD);
        expect(mockEtcd3Constructor.get).toHaveBeenCalledWith(CONFIG_KEYS.VACCINE_ICD);
    });
});

describe('wrong environment variable for configuration layer', () => {
    const { CONFIG_KEYS } = require('../config/constants');
    const OLD_ENV = process.env;
    jest.resetModules();
    var mockConfig = {
        CONFIGURATION_LAYER: 'etc',
        ETCD_URL: 'etcd:2379'
    }
    jest.mock('../config/config', () => {
        return mockConfig;
    });
    const services = require('../configuration_service');
    beforeEach(() => {
        services.init();
    });
    afterEach(() => {
        process.env = OLD_ENV;
    });

    test('should return null if wrong configuration passed', async() => {
        const mapping = await (new services.ConfigLayer()).getConfigValue(CONFIG_KEYS.ICD);
        expect(mapping).toEqual(null);
    })
});

describe('should connect if auth is disabled', () => {
    const etcd3 = require('etcd3');
    const config = require('../config/config');

    var mockConfig = {
        CONFIGURATION_LAYER: 'etcd',
        ETCD_URL: 'etcd:2379',
        ETCD_AUTH_ENABLED: false,
    }
    const services = require('../configuration_service');
    beforeEach(() => {
        services.init();
    });
    jest.mock('../config/config', () => {
        return mockConfig;
    });
    console.log = jest.fn();
    var mockEtcd3Constructor = {
    };
    jest.mock('etcd3', () => {
        return {
            Etcd3: jest.fn().mockImplementation(() => mockEtcd3Constructor)
        }
    });
    
    test('should call etcd constructor without auth parameter', () => {
        expect(etcd3.Etcd3).toHaveBeenCalledWith({hosts: 'etcd:2379'})
    });
});