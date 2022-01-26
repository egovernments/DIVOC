const {Etcd3} = require('etcd3');
const sanitizeHtml = require('sanitize-html');

const config = require('../../configs/config');
const {storeKeyWithExpiry, getValueAsync, checkIfKeyExists, initRedis, deleteKey} = require('./redis_service');

let etcdClient;
let allowedVaccineCertificateTags = '', allowedVaccineCertificateAttributes='', allowedVaccineCertificateClasses= '';
let allowedTestCertificateTags = '', allowedTestCertificateAttributes='', allowedTestCertificateClasses= '';
const vaccineTagsKey = 'vaccineTags', vaccineAttributesKey='vaccineAttributes', vaccineClassesKey='vaccineClasses';
const testTagsKey = 'testTags', testAttributesKey='testAttributes',testClassesKey='testClasses';
const vaccineCertificateKey = 'vaccineCertificateTemplate';
const testCertificateKey = 'testCertificateTemplate';

(async() => {
  etcdClient = new Etcd3({hosts: config.ETCD_URL})
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
    allowedAttributes: allowedAttributes,
    allowedClasses: allowedClasses,
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
    });
}

class VaccineCertificateTemplate {
  async getCertificateTemplate(strategy) {
    let vaccineCertificateTemplate =  await getTemplateFromCache(vaccineCertificateKey);
    if(vaccineCertificateTemplate === null || vaccineCertificateTemplate === undefined) {
      let client = null;
      if(strategy.toLowerCase() === 'etcd') {
          client = new etcd();
      }
      const certificateTemplatePromise = client !== null ? client.getCertificateTemplate(vaccineCertificateKey) : null;
      await this.getAllowedHtmlOptions(client);
      vaccineCertificateTemplate = certificateTemplatePromise;
      await certificateTemplatePromise.then(value => {
        value = cleanHTML(value, allowedVaccineCertificateTags, allowedVaccineCertificateAttributes, allowedVaccineCertificateClasses);
        vaccineCertificateTemplate = value;
        storeKeyWithExpiry(vaccineCertificateKey, value);
      });
    }
    return vaccineCertificateTemplate;
  }

  getAllowedTags() {}

  getAllowedAttributes() {}

  getAllowedClasses() {}

  async getAllowedHtmlOptions(client) {
    if(client === null) {
      return;
    }
    const allowedTagsPromise = client !== null ? client.getAllowedTags(vaccineTagsKey) : null;
    const allowedAttributesPromise = client !== null ? client.getAllowedAttributes(vaccineAttributesKey) : null;
    const allowedClassesPromise = client !== null ? client.getAllowedClasses(vaccineClassesKey) : null;
    await allowedTagsPromise.then(value => {
      allowedVaccineCertificateTags = value;
    });
    await allowedClassesPromise.then(value => {
      allowedVaccineCertificateClasses = value;
    });
    await allowedAttributesPromise.then(value => {
      allowedVaccineCertificateAttributes = value;
    })
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
      const testCertificateTemplatePromise = client !== null ? client.getCertificateTemplate(testCertificateKey) : null;
      await this.getAllowedHtmlOptions(client);
      testCertificateTemplate = testCertificateTemplatePromise;
      await testCertificateTemplatePromise.then(value => {
        value = cleanHTML(value, allowedTestCertificateTags, allowedTestCertificateAttributes, allowedTestCertificateClasses);
        testCertificateTemplate = value;
        storeKeyWithExpiry(testCertificateKey, value);
      });
    }
    return testCertificateTemplate;
  }

  getAllowedTags() {}

  getAllowedAttributes() {}

  getAllowedClasses() {}

  async getAllowedHtmlOptions(client) {
    if(client === null) {
      return;
    }
    const allowedTagsPromise = client !== null ? client.getAllowedTags(testTagsKey) : null;
    const allowedAttributesPromise = client !== null ? client.getAllowedAttributes(testAttributesKey) : null;
    const allowedClassesPromise = client !== null ? client.getAllowedClasses(testClassesKey) : null;
    await allowedTagsPromise.then(value => {
      allowedTestCertificateTags = value;
    });
    await allowedClassesPromise.then(value => {
      allowedTestCertificateClasses = value;
    });
    await allowedAttributesPromise.then(value => {
      allowedTestCertificateAttributes = value;
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

    this.getAllowedAttributes = async function(attributesKey) {
      const allowedAttributes = (await etcdClient.get(attributesKey).string());
      return JSON.parse(allowedAttributes);
    }

    this.getAllowedClasses = async function(classesKey) {
      const allowedClasses = (await etcdClient.get(classesKey).string());
      return JSON.parse(allowedClasses);
    }
}

module.exports = {
    VaccineCertificateTemplate, TestCertificateTemplate
}