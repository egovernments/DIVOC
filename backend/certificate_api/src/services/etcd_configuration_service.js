const {Etcd3} = require('etcd3');
const sanitizeHtml = require('sanitize-html');

const config = require('../../configs/config');
const {storeKeyWithExpiry, getValueAsync, checkIfKeyExists, initRedis, deleteKey} = require('./redis_service');

let etcdClient;
const vaccineCertificateKey = 'vaccineCertificateTemplate';
const testCertificateKey = 'testCertificateTemplate';

(async() => {
  etcdClient = new Etcd3({hosts: config.ETCD_URL});
  setUpWatcher(vaccineCertificateKey);
  setUpWatcher(testCertificateKey);
  await initRedis(config);
})();

async function getTemplateFromCache(key) {
  const isKeyPresent = await checkIfKeyExists(key);
  let template;
  if(isKeyPresent) {
    template = await getValueAsync(key);
  }
  return template;
}


function cleanHTML(html) {
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
        deleteKey(templateKey);
      });
    })
    .catch(err => {
      console.log(err);
    });
}

class VaccineCertificateTemplate {
  async getCertificateTemplate(strategy) {
    let vaccineCertificateTemplate = await getTemplateFromCache(vaccineCertificateKey);
    if(vaccineCertificateTemplate === null || vaccineCertificateTemplate === undefined) {
      let client = null;
      if(strategy.toLowerCase() === 'etcd') {
          client = new etcd();
      }
      if(client === null) {
        return null;
      }
      const certificateTemplatePromise = client.getCertificateTemplate(vaccineCertificateKey);
      vaccineCertificateTemplate = certificateTemplatePromise;
      await certificateTemplatePromise.then(value => {
        value = cleanHTML(value);
        vaccineCertificateTemplate = value;
        storeKeyWithExpiry(vaccineCertificateKey, value);
      });
    }
    return vaccineCertificateTemplate;
  }
}
class TestCertificateTemplate {
  async getCertificateTemplate(strategy) {
    let testCertificateTemplate =  await getTemplateFromCache(testCertificateKey);
    if(testCertificateTemplate === null || testCertificateTemplate === undefined) {
      let client = null;
      if(strategy.toLowerCase() === 'etcd') {
          client = new etcd();
      }
      if(client === null) {
        return null;
      }
      const testCertificateTemplatePromise = client !== null ? client.getCertificateTemplate(testCertificateKey) : null;
      testCertificateTemplate = testCertificateTemplatePromise;
      await testCertificateTemplatePromise.then(value => {
        value = cleanHTML(value);
        testCertificateTemplate = value;
        storeKeyWithExpiry(testCertificateKey, value);
      });
    }
    return testCertificateTemplate;
  }
}

const etcd = function() {
  this.getCertificateTemplate = async function(templateKey) {
    const template = (await etcdClient.get(templateKey).string());
    return template;
  }
}

module.exports = {
  VaccineCertificateTemplate,
  TestCertificateTemplate
}