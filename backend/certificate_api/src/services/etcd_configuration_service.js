const {Etcd3} = require('etcd3');
const sanitizeHtml = require('sanitize-html');

const config = require('../../configs/config');
const {storeKeyWithExpiry, getValueAsync, checkIfKeyExists, initRedis, deleteKey} = require('./redis_service');

let etcdClient;
const vaccineCertificateKey = 'vaccineCertificateTemplate';
const testCertificateKey = 'testCertificateTemplate';
let configuration;
(async() => {
  etcdClient = new Etcd3({hosts: config.ETCD_URL});
  setUpWatcher(vaccineCertificateKey);
  setUpWatcher(testCertificateKey);
  await initRedis(config);
  configuration = config.CONFIGURATION_LAYER.toLowerCase() === 'etcd' ? new etcd(): null ;
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

class CertificateTemplate {
  async getCertificateTemplate(key) {
    let certificateTemplate = await getTemplateFromCache(key);
    if(certificateTemplate === null || certificateTemplate === undefined) {
      if(configuration === null) {
        return null;
      }
      certificateTemplate = await configuration.getCertificateTemplate(key);
      certificateTemplate = cleanHTML(certificateTemplate);
      storeKeyWithExpiry(key, certificateTemplate);
    }
    return certificateTemplate;
  }
}

const etcd = function() {
  this.getCertificateTemplate = async function(templateKey) {
    const template = (await etcdClient.get(templateKey).string());
    return template;
  }
}

module.exports = {
  CertificateTemplate
}