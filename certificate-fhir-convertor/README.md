# Certificate FHIR Converter

This module is used to convert certificates issued by DIVOC to FHIR compliant json

## Quickstart

To convert a DIVOC issued certificate to FHIR R4 Json.

**1. Install**

```shell
npm install certificate-fhir-convertor
```

**2. Calling certificateToFhirJson with W3C certificate payload**

```javascript
const {certificateToFhirJson} = require("certificate-fhir-convertor");
try {
    const fhirJson = certificateToFhirJson(certificate);
    console.log(fhirJson);
} catch (err) {
    console.error(err);
    // handle the error case
}
```

