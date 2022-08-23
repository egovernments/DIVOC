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
   isValid = checkForNull(reqBody);
   if(isValid!= "valid"){
    return isValid;
   } 

   if(!(isoDatestringValidator.isValidISODateString(reqBody.IssuedOn))) 
   {
    return "Issued on date is not in valid format";
   }
   else if(!(isoDatestringValidator.isValidISODateString(reqBody.ValidFrom))) 
   {
    return "Valid from date is not in valid format";
   }
   else if(!(isoDatestringValidator.isValidISODateString(reqBody.ValidTill))) 
   {
    return "Valid till date is not in valid format";
   }
   else if(isURIFormat(reqBody.Issuer)){
    return "Invalid Issuer format"
   }
   else {
    return "valid";
   }

  }

  function checkForNull(reqBody){
    isValid = "valid";

    if(!(reqBody.IssuedOn)){
      isValid = "Issued on date is missing"
   
    }
    if(!(reqBody.ValidFrom)){
      isValid = "Valid from date is missing"
   
    }
    if(!(reqBody.ValidTill)){
      isValid = "Valid till date is missing"
   
    }
    if(!(reqBody.Issuer)){
      isValid = "Issuer detail is missing"
   
    }
    return isValid ;
  }

  module.exports = {
    validateCertificateInput

  }
        
          