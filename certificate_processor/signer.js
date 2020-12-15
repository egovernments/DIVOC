const config = require('./config/config');
const registry = require('./registry');

function signJSON(certificate) {

  return {
    name : certificate.recipient.name,
    contact: certificate["recipient"]["contact"],
    certificateId: "" + Math.floor(1e8 + (Math.random() * 9e8)),
    certificate: JSON.stringify(certificate)
  };
}

function signAndSave(certificate) {
  const signendCertificate = signJSON(certificate);
  registry.saveCertificate(signendCertificate)
}

module.exports = {
  signAndSave,
};