const testCertificateContext = {
  "@context": {
    "@version": 1.1,
    "@protected": true,
    "id": "@id",
    "type": "@type",
    "schema": "https://schema.org/",
    "vac": "https://cowin.gov.in/credentials/testCertificate/v1",
    "ProofOfTestCertificateCredential":{
      "@id": "schema:ProofOfTestCredential",
      "@context": {
        "@version": 1.1,
        "@protected": true,
        "nonTransferable": "vac:nonTransferable"
      }
    },
    "Person": {
      "@id": "schema:Person",
      "@context": {
        "@version": 1.1,
        "@protected": true,
        "refId": "schema:id",
        "uhid": "schema:id",
        "name": "schema:name",
        "dob": "schema:date",
        "gender": "schema:gender",
        "nationality": "schema:nationality",
        "address": {
          "@id": "schema:PostalAddress",
          "@context": {
            "@version": 1.1,
            "@protected": true,
            "streetAddress": "schema:streetAddress",
            "streetAddress2": "vac:addressLine2",
            "city": "vac:city",
            "district": "vac:district",
            "addressRegion": "schema:addressRegion",
            "postalCode": "schema:postalCode",
            "addressCountry": "schema:addressCountry"
          }
        }
      }
    },
    "TestDetails": {
      "@id": "vac:TestDetails",
      "@context": {
        "@version": 1.1,
        "@protected": true,
        "certificateId": "schema:id",
        "feedbackUrl": "schema:url",
        "infoUrl": "schema:url",
        "batch": "schema:id",
        "testType": "schema:id",
        "testName": "schema:name",
        "manufacturer": "schema:id",
        "disease": "schema:id",
        "sampleOrigin": "schema:id",
        "sampleCollectionTimestamp": "schema:dateTime",
        "resultTimestamp": "schema:dateTime",
        "result": "schema:id",
        "verifier": {
          "@id": "vac:verifier",
          "@context": {
            "@version": 1.1,
            "@protected": true,
            "id": "schema:id",
            "name": "schema:name",
            "sign-image": "schema:image"
          }
        },
        "facility": {
          "@id": "vac:Facility",
          "@context": {
            "@version": 1.1,
            "@protected": true,
            "name": "schema:name",
            "address": {
              "@id": "schema:PostalAddress",
              "@context": {
                "@version": 1.1,
                "@protected": true,
                "streetAddress": "schema:streetAddress",
                "streetAddress2": "vac:addressLine2",
                "city": "vac:city",
                "district": "vac:district",
                "addressRegion": "schema:addressRegion",
                "postalCode": "schema:postalCode",
                "addressCountry": "schema:addressCountry"
              }
            },
            "seal-image": "schema:image"
          }
        }
      }
    }
  }
};

module.exports = {
  testCertificateContext
};
