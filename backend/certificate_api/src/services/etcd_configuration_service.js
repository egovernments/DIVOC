const {Etcd3} = require('etcd3');
const sanitizeHtml = require('sanitize-html');

const config = require('../../configs/config');
const {storeKeyWithExpiry, getValueAsync, checkIfKeyExists, initRedis, deleteKey} = require('./redis_service');

let etcdClient;
let allowedVaccineCertificateTags = '';
let allowedTestCertificateTags = '';
const vaccineTagsKey = 'vaccineTags';
const testTagsKey = 'testTags';
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


function cleanHTML(html, allowedTags, allowedAttributes, allowedClasses) {
  const arr = allowedTags.split(',').map(item => item.trim());
  const cleanedHtml = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(arr),
    allowedAttributes: false,
    allowedClasses: {
      "*": ["*"]
    },
    parser: {
      lowerCaseAttributeNames: false
    }
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
      await this.getAllowedHtmlOptions(client);
      vaccineCertificateTemplate = certificateTemplatePromise;
      await certificateTemplatePromise.then(value => {
        value = cleanHTML(value, allowedVaccineCertificateTags);
        vaccineCertificateTemplate = value;
        storeKeyWithExpiry(vaccineCertificateKey, value);
      });
    }
    return vaccineCertificateTemplate;
  }

  getAllowedTags() {}

  async getAllowedHtmlOptions(client) {
    const allowedTagsPromise = client !== null ? client.getAllowedTags(vaccineTagsKey) : null;
    await allowedTagsPromise.then(value => {
      allowedVaccineCertificateTags = value;
    });
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
      await this.getAllowedHtmlOptions(client);
      testCertificateTemplate = testCertificateTemplatePromise;
      await testCertificateTemplatePromise.then(value => {
        value = cleanHTML(value, allowedTestCertificateTags);
        testCertificateTemplate = value;
        storeKeyWithExpiry(testCertificateKey, value);
      });
    }
    return testCertificateTemplate;
  }

  getAllowedTags() {}

  async getAllowedHtmlOptions(client) {
    const allowedTagsPromise = client !== null ? client.getAllowedTags(testTagsKey) : null;
    await allowedTagsPromise.then(value => {
      allowedTestCertificateTags = value;
    });
  }
}

const etcd = function() {
  this.getCertificateTemplate = async function(templateKey) {
    const template = (await etcdClient.get(templateKey).string());
    return template;
  }

  this.getAllowedTags = async function(tagsKey) {
    const allowedTags = (await etcdClient.get(tagsKey).string());
    return allowedTags;
  }
}

module.exports = {
  VaccineCertificateTemplate,
  TestCertificateTemplate
}