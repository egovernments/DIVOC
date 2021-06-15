
const {certificateToFhirJson} = require("../fhir-convertor");
const config = require('../configs/config');
const privateKeyPem = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAnXQalrgztecTpc+INjRQ8s73FSE1kU5QSlwBdICCVJBUKiuQUt7s+Z5epgCvLVAOCbP1mm5lV7bfgV/iYWDio7lzX4MlJwDedWLiufr3Ajq+79CQiqPaIbZTo0i13zijKtX7wgxQ78wT/HkJRLkFpmGeK3za21tEfttytkhmJYlwaDTEc+Kx3RJqVhVh/dfwJGeuV4Xc/e2NH++ht0ENGuTk44KpQ+pwQVqtW7lmbDZQJoOJ7HYmmoKGJ0qt2hrj15uwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZfv2AZZ9/7Y+igshzfB0reIFdUKw3cdVTzfv5FNrIqN5pwIDAQABAoIBAHPILMUoLt5UTd5f/YnebqgeCRNAmGOBcwk7HtbMqQoGF93qqvZFd30XOAJZ/ncTpz77Vl95ToxxrWk1WQLCe+ZpOK3Dgk5sFSm8zXx1T64UBNPUSnWoh37C1D39+b9rppCZScgnxlyPdSLy3h3q8Hyoy+auqUEkm/ms5W2lT3fJscyN1IAyHrhsOBWjl3Ilq5GxBo5tbYv/Fb1pQiP/p2SIHA1+2ASXNYQP100F5Vn0V6SFtBXTCQnwcvbP083NvlGxs9+xRs3MCUcxCkKepWuzYwOZDmu/2yCz1/EsP6wlsYEHmCZLdIb0tQt0caqzB/RoxfBpNRIlhOtqHvBzUgECgYEAzIRn5Y7lqO3N+V29wXXtVZjYWvBh7xUfOxAwVYv0rKI0y9kHJHhIrU+wOVOKGISxBKmzqBQRPvXtXW8E0/14Zz82g60rRwtNjvW0UoZAY3KPouwruUIjAe2UnKZcQ//MBTrvds8QGpL6nxvPsBqU0y2K+ySAOxBtNtGEjzv8nxUCgYEAxRbMWukIbgVOuQjangkfJEfA1UaRFQqQ8jUmT9aiq2nREnd4mYP8kNKzJa9L7zj6Un6yLH5DbGspZ2gGODeRw3uVFN8XSzRdLvllNEyiG/waiysUtXfG2DPOR6xD8tXXDMm/tl9gTa8cbkvqYy10XT9MpfOAsusEZVmc0/DBBMsCgYAYdAxoKjnThPuHwWma5BrIjUnxNaTADWp6iWj+EYnjylE9vmlYNvmZn1mWwSJV5Ce2QwQ0KJIXURhcf5W4MypeTfSase3mxLc1TLOO2naAbYY3GL3xnLLK3DlUsZ9+kes3BOD097UZOFG3DIA8sjDxPxTLCoY6ibBFSa/r4GRIMQKBgQCranDCgPu79RHLDVBXM0fKnj2xQXbd/hqjDmcL+Xnx7E7S6OYTXyBENX1qwVQh9ESDi34cBJVPrsSME4WVT3+PreS0CnSQDDMfr/m9ywkTnejYMdgJHOvtDuHSpJlUk3g+vxnm3H0+E5d+trhdGiOjFnLrwyWkd5OTMqWcEEFQkQKBgFfXObDz/7KqeSaAxI8RzXWbI3Fa492b4qQUhbKYVpGn98CCVEFJr11vuB/8AXYCa92OtbwgMw6Ah5JOGzRScJKdipoxo7oc2LJ9sSjjw3RB/aWl35ChvnCJhmfSL8Usbj0nWVTrPwRLjMC2bIxkLtnm9qYXPumW1EjEbusjVMpN\n-----END RSA PRIVATE KEY-----\n';

const cert2 = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://cowin.gov.in/credentials/vaccination/v1"
    ],
    "type": [
        "VerifiableCredential",
        "ProofOfVaccinationCredential"
    ],
    "credentialSubject": {
        "type": "Person",
        "id": "did:in.gov.uidai.aadhaar:123456",
        "refId": "12346",
        "name": "Ved Prakash",
        "gender": "Male",
        "age": "34",
        "nationality": "Indian",
        "address": {
            "streetAddress": "",
            "streetAddress2": "",
            "district": "",
            "city": "",
            "addressRegion": "",
            "addressCountry": "IN",
            "postalCode": ""
        }
    },
    "issuer": "https://cowin.gov.in/",
    "issuanceDate": "2021-01-15T17:21:13.117Z",
    "evidence": [
        {
            "id": "https://cowin.gov.in/vaccine/undefined",
            "feedbackUrl": "https://cowin.gov.in/?undefined",
            "infoUrl": "https://cowin.gov.in/?undefined",
            "type": [
                "Vaccination"
            ],
            "batch": "MB3428BX",
            "vaccine": "Covaxin",
            "manufacturer": "COVPharma",
            "date": "2020-12-02T19:21:18.646Z",
            "effectiveStart": "2020-12-02",
            "effectiveUntil": "2025-12-02",
            "dose": 1,
            "totalDoses": 2,
            "verifier": {
                "name": "Sooraj Singh"
            },
            "facility": {
                "name": "ABC Medical Center",
                "address": {
                    "streetAddress": "ABC",
                    "streetAddress2": "",
                    "district": "XYZ",
                    "city": "PQR",
                    "addressRegion": "DEF",
                    "addressCountry": "IN",
                    "postalCode": ""
                }
            }
        }
    ],
    "nonTransferable": "true",
    "proof": {
        "type": "RsaSignature2018",
        "created": "2021-01-15T17:21:13Z",
        "verificationMethod": "did:india",
        "proofPurpose": "assertionMethod",
        "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mJlHZZRD7VQwVJchfI21ZavjxNKglbf3LSaF1SAjELOWn9MARALkugsmOzG0mBon9R7zXSVPkPM8EDbUZxR4FsRlAFFszFv-0BjyAeIqRv-9MRnlm4cScQi8aCBgBnvsWfNIE175cGNbPUluVv5n6G66tVinioL5IL6uCZNQnSGp4jJrEAZa0t5s3jXfq7soHz1LTfQbLs7cH5-fDi3JW1-WeF4_ELy_9l_OxAc2CoACqYLOLJB-NnPsnz2bwAvH8yXHsjZJphzaBNqpn8DmJvcRHzhz7OjpGfhyouiOyGo_XncadFmftqwfilJkC1EISkSb6QVsyhHLOudY4PTTaA"
    }
};

test('Convert certificate json to fhir json', () => {

    let fhirCert = certificateToFhirJson(cert2, privateKeyPem);
    console.log(fhirCert);

    expect(fhirCert.entry[0].fullUrl).toContain('urn:uuid:');

    expect(fhirCert.entry[1].resource.resourceType).toBe('Composition');
    expect(fhirCert.entry[1].resource.subject.reference).toBe(fhirCert.entry[6].fullUrl);
    expect(fhirCert.entry[1].resource.author[0].reference).toBe(fhirCert.entry[2].fullUrl);
    expect(fhirCert.entry[1].resource.custodian.reference).toBe(fhirCert.entry[4].fullUrl);

    expect(fhirCert.entry[2].fullUrl).toContain('urn:uuid:');

    expect(fhirCert.entry[3].resource.resourceType).toBe('Practitioner');
    expect(fhirCert.entry[3].resource.name[0].text).toBe(cert2.evidence[0].verifier.name);

    expect(fhirCert.entry[4].fullUrl).toContain('urn:uuid:');

    expect(fhirCert.entry[5].resource.resourceType).toBe('Organization');
    expect(fhirCert.entry[5].resource.name).toBe(cert2.evidence[0].facility.name);
    expect(fhirCert.entry[5].resource.address[0].city).toBe(cert2.evidence[0].facility.address.city);
    expect(fhirCert.entry[5].resource.address[1].district).toBe(cert2.evidence[0].facility.address.district);
    expect(fhirCert.entry[5].resource.address[2].country).toBe(cert2.evidence[0].facility.address.addressCountry);
    expect(fhirCert.entry[5].resource.identifier[0].value).toBe(cert2.evidence[0].facility.name.split(' ').join('-'));

    expect(fhirCert.entry[6].fullUrl).toContain('urn:uuid:');

    expect(fhirCert.entry[7].resource.resourceType).toBe('Patient');
    expect(fhirCert.entry[7].resource.extension[0].valueString).toBe(cert2.credentialSubject.nationality);
    expect(fhirCert.entry[7].resource.name[0].text).toBe(cert2.credentialSubject.name);
    expect(fhirCert.entry[7].resource.gender).toBe(cert2.credentialSubject.gender.toLowerCase());
    expect(fhirCert.entry[7].resource.identifier[0].value).toBe(cert2.credentialSubject.id);

    expect(fhirCert.entry[8].fullUrl).toContain('urn:uuid:');

    expect(fhirCert.entry[9].resource.resourceType).toBe('Immunization');
    expect(fhirCert.entry[9].resource.vaccineCode.coding[0].display).toBe(cert2.evidence[0].vaccine);
    expect(fhirCert.entry[9].resource.vaccineCode.coding[0].code).toBe(config.VACCINE_MAPPINGS[cert2.evidence[0].vaccine].code);
    expect(fhirCert.entry[9].resource.occurrenceDateTime).toBe(cert2.evidence[0].date);
    expect(fhirCert.entry[9].resource.manufacturer.reference).toBe(cert2.evidence[0].manufacturer);
    expect(fhirCert.entry[9].resource.lotNumber).toBe(cert2.evidence[0].batch);
    expect(fhirCert.entry[9].resource.expirationDate).toBe(cert2.evidence[0].effectiveUntil);
    expect(fhirCert.entry[9].resource.doseQuantity.value).toBe(parseInt(cert2.evidence[0].dose));

    expect(fhirCert.entry[10].fullUrl).toContain('urn:uuid:');

    expect(fhirCert.entry[11].resource.resourceType).toBe('Provenance');
    expect(fhirCert.entry[11].resource.signature[0].sigFormat).toBe("application/jose");
    expect(fhirCert.entry[11].resource.signature[0].data.split(".").length).toBe(3);

});

test('should throw exception when unsupported vaccine name is passed', () => {
    let cert = cert2;
    cert.evidence[0].vaccine = 'vacc1';
    expect(() => certificateToFhirJson(cert)).toThrow("unsupported vaccine name vacc1");
});
