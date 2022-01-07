# Certificate FHIR Converter

This module is used to convert certificates issued by DIVOC to signed FHIR compliant json

## Quickstart

###To convert a DIVOC issued W3C certificate to FHIR R4 Json.

**1. Install**

```shell
npm install certificate-fhir-convertor
```

**2. Calling certificateToFhirJson with W3C certificate payload**

```javascript
const {certificateToFhirJson} = require("certificate-fhir-convertor");
const privateKeyPem = '-----BEGIN RSA PRIVATE KEY-----\nPRIVATE_KEY\n-----END RSA PRIVATE KEY-----\n';

try {
    const fhirJson = certificateToFhirJson(certificate, privateKeyPem);
    console.log(fhirJson);
} catch (err) {
    console.error(err);
    // handle the error case
}
```

**3. Verify certificateToFhirJson**

```javascript
const {validateSignedFhirJson} = require("certificate-fhir-convertor");
const publicKeyPem = '-----BEGIN PUBLIC KEY-----\nPUBLIC_KEY\n-----END PUBLIC KEY-----';

const valid = validateSignedFhirJson(certificate, publicKeyPem);
console.log(valid);

```

###To convert a DIVOC issued W3C certificate to Smart Health Card Json.

```javascript
const {certificateToSmartHealthJson} = require("certificate-fhir-convertor");

try {
    const shcJson = certificateToSmartHealthJson(certificate);
    console.log(shcJson);
} catch (err) {
    console.error(err);
    // handle the error case
}
```
