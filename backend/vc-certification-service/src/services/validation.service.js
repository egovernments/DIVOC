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
  if (!(isoDatestringValidator.isValidISODateString(reqBody.IssuedOn))) {
    err.response.data = "Issued on date is not in valid format";
    throw err;
  }
  if (!(isoDatestringValidator.isValidISODateString(reqBody.ValidFrom))) {
    err.response.data = "Valid from date is not in valid format";
    throw err;
  }
  if (!(isoDatestringValidator.isValidISODateString(reqBody.ValidTill))) {
    err.response.data = "Valid till date is not in valid format";
    throw err;
  }
  if (!(isURIFormat(reqBody.Issuer))) {
    err.response.data = "Invalid Issuer format";
    throw err;
  }
}

function checkForNull(reqBody, err) {
  if (!(reqBody.IssuedOn)) {
    err.response.data = "Issued on date is missing";
    throw err;
  }
  if (!(reqBody.ValidFrom)) {
    err.response.data = "Valid from date is missing";
    throw err;
  }
  if (!(reqBody.ValidTill)) {
    err.response.data = "Valid till date is missing";
    throw err;
  }
  if (!(reqBody.Issuer)) {
    err.response.data = "Issuer detail is missing";
    throw err;
  }
}

module.exports = {
  validateCertificateInput,
  isURIFormat
}

