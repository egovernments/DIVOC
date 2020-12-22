const vaccinationContext = {
  "@context": {
    "@version": 1.1,
    "@protected": true,
    "id": "@id",
    "type": "@type",
    "schema": "https://schema.org/",
    "vac": "https://www.who.int/2020/credentials/vaccination/v1",
    "ProofOfVaccinationCredential":{
      "@id": "schema:ProofOfVaccinationCredential",
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
        "name": "schema:name",
        "age": "schema:Number",
        "gender": "schema:gender",
        "nationality": "schema:nationality"
      }
    },
    "Vaccination": {
      "@id": "vac:Vaccination",
      "@context": {
        "@version": 1.1,
        "@protected": true,
        "certificateId": "schema:id",
        "feedbackUrl": "schema:url",
        "infoUrl": "schema:url",
        "batch": "schema:id",
        "vaccine": "schema:id",
        "manufacturer": "schema:id",
        "date": "schema:date",
        "effectiveStart": "schema:date",
        "effectiveUntil": "schema:date",
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
}

module.exports = {
  vaccinationContext
}
