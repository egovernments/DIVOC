const isoDatestringValidator = require('iso-datestring-validator')
const {CustomError} = require("../models/errors");


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

function validateCertificateInput(req,reqType) {
  let reqBody = req.body;
  if(reqType === "update"){
    if (!(reqBody.certificateId)) {
      throw new CustomError("certificateId is missing", 400);
    }
  }
  try {
    checkForNull(reqBody);
  } catch (err) {
    throw err;
  }
  if (!(isoDatestringValidator.isValidISODateString(reqBody.issuanceDate))) {
    throw new CustomError("IssuanceDate is not in valid format", 400);
  }
  if (reqBody.validFrom && !(isoDatestringValidator.isValidISODateString(reqBody.validFrom))) {
    throw new CustomError("Valid from date is not in valid format", 400);
  }
  if (reqBody.validTill && !(isoDatestringValidator.isValidISODateString(reqBody.validTill))) {
    throw new CustomError("Valid till date is not in valid format", 400);
  }
  if (!(isURIFormat(reqBody.issuer))) {
    throw new CustomError("Invalid Issuer format", 400);
  }
}

function checkForNull(reqBody) {
  if (!(reqBody.issuanceDate)) {
    throw new CustomError("IssuanceDate is missing", 400);
  }
  if (!(reqBody.issuer)) {
    throw new CustomError("Issuer detail is missing", 400);
  }
}

function validPresentDate(param){
  if (!(isoDatestringValidator.isValidISODateString(param))) {
    throw new CustomError("Valid End date is not in valid format", 400);
  }
  
  if(new Date(param) < new Date()){
    console.log("Valid End date can't be past date");
    throw new CustomError("Valid End date can't be past date", 400);
  }
}

module.exports = {
  validateCertificateInput,
  isURIFormat,
  validPresentDate
}

