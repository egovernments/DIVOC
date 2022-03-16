describe('should retrieve all mappings if correct configuration layer passed', () => {
    jest.resetModules();
    const etcd3 = require('etcd3');
    const sanitizeHtml = require('sanitize-html');
    const config = require('../configs/config');
    jest.mock('sanitize-html');
    const {TEMPLATES, EU_VACCINE_CONFIG_KEYS} = require('../configs/constants');
    jest.mock('../src/services/redis_service');
    console.log = jest.fn();
    config.ETCD_URL = 'etcd:2379';
    config.ETCD_AUTH_ENABLED = true;
    config.ETCD_USERNAME = 'etcd';
    config.ETCD_PASSWORD = 'etcd';
    const html = `<html>
            <head>
                <title>Dummy</title>
                <script>
                    alert(1)
                </script>
                <style></style>
            </head>
            <body>
                <iframe></iframe>
                <div class="d-flex"></div>
                <img src="" alt="dummy">
            </body>
        </html>`;

    var getFn = {
        string: jest.fn()
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve(html)
                }))
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve(html)
                }))
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve("{\"covaxin\": \"J07BX03\"}")
                }))
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve("{\"covaxin\": \"Covaxin\"}")
                }))
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve("{\"bharat\": \"Bharat-Biotech\"}")
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
    const configuration = require('../src/services/configuration_service');
    configuration.init();
    test('should instantiate Etcd3', () => {
        expect(etcd3.Etcd3).toHaveBeenCalledWith({hosts: 'etcd:2379', auth: {username: 'etcd', password: 'etcd'}});
    });

    test('should call sanitizeHtml method 2 times each for getCertificateTemplate method of VaccineCertificateTemplate and TestCertificateTemplate for valid configuration passed', async() => {
        (await (new configuration.ConfigurationService()).getCertificateTemplate(TEMPLATES.VACCINATION_CERTIFICATE));
        (await (new configuration.ConfigurationService()).getCertificateTemplate(TEMPLATES.TEST_CERTIFICATE));
        expect(sanitizeHtml).toHaveBeenCalledTimes(2);
        expect(sanitizeHtml).toHaveBeenCalledWith(html, {
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
            allowedIframeDomains: [''],
            allowedSchemes: ['data']
        });
    });

    test('should call watch method to watch for changes in etcd', () => {
        expect(mockEtcd3Constructor.watch).toHaveBeenCalledTimes(6);
    });

    test('should retrieve EU_VACCINE_PROPH details from etcd', async() => {
        jest.spyOn(mockEtcd3Constructor, 'get')
        const proph = (await (new configuration.ConfigurationService()).getEUVaccineDetails(EU_VACCINE_CONFIG_KEYS.PROPHYLAXIS_TYPE));
        expect(proph).toEqual({"covaxin": "J07BX03"});
        expect(mockEtcd3Constructor.get).toHaveBeenCalledWith(EU_VACCINE_CONFIG_KEYS.PROPHYLAXIS_TYPE);
    });

    test('should retrieve EU_VACCINE_CODE details from etcd', async() => {
        jest.spyOn(mockEtcd3Constructor, 'get')
        const proph = (await (new configuration.ConfigurationService()).getEUVaccineDetails(EU_VACCINE_CONFIG_KEYS.VACCINE_CODE));
        expect(proph).toEqual({"covaxin": "Covaxin"});
        expect(mockEtcd3Constructor.get).toHaveBeenCalledWith(EU_VACCINE_CONFIG_KEYS.VACCINE_CODE);
    });

    test('should retrieve EU_VACCINE_MANUF details from etcd', async() => {
        jest.spyOn(mockEtcd3Constructor, 'get')
        const proph = (await (new configuration.ConfigurationService()).getEUVaccineDetails(EU_VACCINE_CONFIG_KEYS.MANUFACTURER));
        expect(proph).toEqual({"bharat": "Bharat-Biotech"});
        expect(mockEtcd3Constructor.get).toHaveBeenCalledWith(EU_VACCINE_CONFIG_KEYS.MANUFACTURER);
    });
});

describe('environment variables', () => {
    const OLD_ENV = process.env;
    const {TEMPLATES} = require('../configs/constants');
    beforeEach(() => {
        jest.resetModules();
        process.env = {
            ...OLD_ENV,
            CONFIGURATION_LAYER: 'etc'
        };
    });
    afterEach(() => {
        process.env = OLD_ENV;
    });
    test('should return null when invalid configuration passed to VaccineCertificateTemplate and TestCertificateTemplate', async() => {
        let configuration = require('../src/services/configuration_service');
        const vaccineTemplate = (await (new configuration.ConfigurationService()).getCertificateTemplate(TEMPLATES.VACCINATION_CERTIFICATE));
        const testTemplate = (await (new configuration.ConfigurationService()).getCertificateTemplate(TEMPLATES.TEST_CERTIFICATE));
        expect(vaccineTemplate).toEqual(null);
        expect(testTemplate).toEqual(null);
    });
});

describe('should connect to etcd if authentication is disabled', () => {
    jest.resetModules();
    const etcd3 = require('etcd3');
    const sanitizeHtml = require('sanitize-html');
    const config = require('../configs/config');
    jest.mock('sanitize-html');
    const {TEMPLATES, EU_VACCINE_CONFIG_KEYS} = require('../configs/constants');
    jest.mock('../src/services/redis_service');
    console.log = jest.fn();
    config.ETCD_URL = 'etcd:2379';
    config.ETCD_AUTH_ENABLED = false;
    config.ETCD_USERNAME = 'etcd';
    config.ETCD_PASSWORD = 'etcd';
    const html = `<html>
            <head>
                <title>Dummy</title>
                <script>
                    alert(1)
                </script>
                <style></style>
            </head>
            <body>
                <iframe></iframe>
                <div class="d-flex"></div>
                <img src="" alt="dummy">
            </body>
        </html>`;

    var getFn = {
        string: jest.fn()
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve(html)
                }))
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve(html)
                }))
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve("{\"covaxin\": \"J07BX03\"}")
                }))
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve("{\"covaxin\": \"Covaxin\"}")
                }))
                .mockReturnValueOnce(new Promise((resolve, reject) => {
                    resolve("{\"bharat\": \"Bharat-Biotech\"}")
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
    const configuration = require('../src/services/configuration_service');
    configuration.init();
    test('should instantiate Etcd3', () => {
        expect(etcd3.Etcd3).toHaveBeenCalledWith({hosts: 'etcd:2379'});
    });

})