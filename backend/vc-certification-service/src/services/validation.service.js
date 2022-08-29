const isoDatestringValidator = require('iso-datestring-validator')


function isURIFormat(param) {
  let optionalCertificateFieldsObj;
  let isURI;
  try {
    optionalCertificateFieldsObj = new URL(param);
    isURI = true;
  } catch (e) {
    isURI = false;
  }

  if (isURI && !optionalCertificateFieldsObj.protocol) {
    isURI = false;
  }
  return isURI;
}

function validateCertificateInput(req) {
  reqBody = req.body;
  let err = {
    response: {
      status: 400,
      data: "error"
    }
  }
  checkForNull(reqBody, err);
  if (!(isoDatestringValidator.isValidISODateString(reqBody.issuedOn))) {
    err.response.data = "Issued on date is not in valid format";
    throw err;
  }
  if (!(isoDatestringValidator.isValidISODateString(reqBody.validFrom))) {
    err.response.data = "Valid from date is not in valid format";
    throw err;
  }
  if (!(isoDatestringValidator.isValidISODateString(reqBody.validTill))) {
    err.response.data = "Valid till date is not in valid format";
    throw err;
  }
  if (!(isURIFormat(reqBody.issuer))) {
    err.response.data = "Invalid Issuer format";
    throw err;
  }
}

function checkForNull(reqBody, err) {
  if (!(reqBody.issuedOn)) {
    err.response.data = "Issued on date is missing";
    throw err;
  }
  if (!(reqBody.validFrom)) {
    err.response.data = "Valid from date is missing";
    throw err;
  }
  if (!(reqBody.validTill)) {
    err.response.data = "Valid till date is missing";
    throw err;
  }
  if (!(reqBody.issuer)) {
    err.response.data = "Issuer detail is missing";
    throw err;
  }
}

module.exports = {
  validateCertificateInput,
  isURIFormat
}

