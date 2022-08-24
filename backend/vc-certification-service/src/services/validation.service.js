//import * as isoDatestringValidator from 'iso-datestring-validator';
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
  isValid = checkForNull(reqBody);
  if (isValid !== "valid") {
    err.response.data = isValid;
    throw err;
  }
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
  return "valid";
}

function checkForNull(reqBody) {
  isValid = "valid";

  if (!(reqBody.IssuedOn)) {
    isValid = "Issued on date is missing"
  }
  if (!(reqBody.ValidFrom)) {
    isValid = "Valid from date is missing"
  }
  if (!(reqBody.ValidTill)) {
    isValid = "Valid till date is missing"
  }
  if (!(reqBody.Issuer)) {
    isValid = "Issuer detail is missing"
  }
  return isValid;
}

module.exports = {
  validateCertificateInput

}

