const etcd3 = require('etcd3');
const sanitizeHtml = require('sanitize-html');
jest.mock('sanitize-html');
const redisService = require('../src/services/redis_service');
jest.mock('../src/services/redis_service');
console.log = jest.fn();
const Templates = {
    VACCINE: "vaccineCertificateTemplate",
    TEST: "testCertificateTemplate"
}
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
const etcd_configuration = require('../src/services/etcd_configuration_service');

test('should instantiate Etcd3', () => {
    expect(etcd3.Etcd3).toHaveBeenCalled();
});

test('should call sanitizeHtml method 2 times each for getCertificateTemplate method of VaccineCertificateTemplate and TestCertificateTemplate for valid configuration passed', async() => {
    (await (new etcd_configuration.CertificateTemplate()).getCertificateTemplate(Templates.VACCINE));
    (await (new etcd_configuration.CertificateTemplate()).getCertificateTemplate(Templates.TEST));
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
        allowedIframeDomains: ['']
    });
});

test('should call watch method to watch for changes in etcd', () => {
    expect(mockEtcd3Constructor.watch).toHaveBeenCalledTimes(2);
});

test('should get template from redis when present', async() => {
    jest.spyOn(redisService, 'checkIfKeyExists').mockImplementation(() => true)
    jest.spyOn(redisService, 'getValueAsync').mockReturnValueOnce('abc').mockReturnValueOnce('def');
    const vaccineTemplate = (await (new etcd_configuration.CertificateTemplate()).getCertificateTemplate(Templates.VACCINE));
    const testTemplate = (await (new etcd_configuration.CertificateTemplate()).getCertificateTemplate(Templates.TEST));
    expect(vaccineTemplate).toEqual('abc');
    expect(testTemplate).toEqual('def');
});

describe('environment variables', () => {
    const OLD_ENV = process.env;
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
        let configuration = require('../src/services/etcd_configuration_service');
        const vaccineTemplate = (await (new configuration.CertificateTemplate()).getCertificateTemplate(Templates.VACCINE));
        const testTemplate = (await (new configuration.CertificateTemplate()).getCertificateTemplate(Templates.TEST));
        expect(vaccineTemplate).toEqual(null);
        expect(testTemplate).toEqual(null);
    });
});