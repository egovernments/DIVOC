
const {certificateToFhirJson, validateSignedFhirJson, validateQRContent} = require("../fhir-convertor");
const rs = require("jsrsasign");
const config = require('../configs/config');
// const privateKeyPem = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAnXQalrgztecTpc+INjRQ8s73FSE1kU5QSlwBdICCVJBUKiuQUt7s+Z5epgCvLVAOCbP1mm5lV7bfgV/iYWDio7lzX4MlJwDedWLiufr3Ajq+79CQiqPaIbZTo0i13zijKtX7wgxQ78wT/HkJRLkFpmGeK3za21tEfttytkhmJYlwaDTEc+Kx3RJqVhVh/dfwJGeuV4Xc/e2NH++ht0ENGuTk44KpQ+pwQVqtW7lmbDZQJoOJ7HYmmoKGJ0qt2hrj15uwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZfv2AZZ9/7Y+igshzfB0reIFdUKw3cdVTzfv5FNrIqN5pwIDAQABAoIBAHPILMUoLt5UTd5f/YnebqgeCRNAmGOBcwk7HtbMqQoGF93qqvZFd30XOAJZ/ncTpz77Vl95ToxxrWk1WQLCe+ZpOK3Dgk5sFSm8zXx1T64UBNPUSnWoh37C1D39+b9rppCZScgnxlyPdSLy3h3q8Hyoy+auqUEkm/ms5W2lT3fJscyN1IAyHrhsOBWjl3Ilq5GxBo5tbYv/Fb1pQiP/p2SIHA1+2ASXNYQP100F5Vn0V6SFtBXTCQnwcvbP083NvlGxs9+xRs3MCUcxCkKepWuzYwOZDmu/2yCz1/EsP6wlsYEHmCZLdIb0tQt0caqzB/RoxfBpNRIlhOtqHvBzUgECgYEAzIRn5Y7lqO3N+V29wXXtVZjYWvBh7xUfOxAwVYv0rKI0y9kHJHhIrU+wOVOKGISxBKmzqBQRPvXtXW8E0/14Zz82g60rRwtNjvW0UoZAY3KPouwruUIjAe2UnKZcQ//MBTrvds8QGpL6nxvPsBqU0y2K+ySAOxBtNtGEjzv8nxUCgYEAxRbMWukIbgVOuQjangkfJEfA1UaRFQqQ8jUmT9aiq2nREnd4mYP8kNKzJa9L7zj6Un6yLH5DbGspZ2gGODeRw3uVFN8XSzRdLvllNEyiG/waiysUtXfG2DPOR6xD8tXXDMm/tl9gTa8cbkvqYy10XT9MpfOAsusEZVmc0/DBBMsCgYAYdAxoKjnThPuHwWma5BrIjUnxNaTADWp6iWj+EYnjylE9vmlYNvmZn1mWwSJV5Ce2QwQ0KJIXURhcf5W4MypeTfSase3mxLc1TLOO2naAbYY3GL3xnLLK3DlUsZ9+kes3BOD097UZOFG3DIA8sjDxPxTLCoY6ibBFSa/r4GRIMQKBgQCranDCgPu79RHLDVBXM0fKnj2xQXbd/hqjDmcL+Xnx7E7S6OYTXyBENX1qwVQh9ESDi34cBJVPrsSME4WVT3+PreS0CnSQDDMfr/m9ywkTnejYMdgJHOvtDuHSpJlUk3g+vxnm3H0+E5d+trhdGiOjFnLrwyWkd5OTMqWcEEFQkQKBgFfXObDz/7KqeSaAxI8RzXWbI3Fa492b4qQUhbKYVpGn98CCVEFJr11vuB/8AXYCa92OtbwgMw6Ah5JOGzRScJKdipoxo7oc2LJ9sSjjw3RB/aWl35ChvnCJhmfSL8Usbj0nWVTrPwRLjMC2bIxkLtnm9qYXPumW1EjEbusjVMpN\n-----END RSA PRIVATE KEY-----\n';
// const publicKeyPem = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnXQalrgztecTpc+INjRQ8s73FSE1kU5QSlwBdICCVJBUKiuQUt7s+Z5epgCvLVAOCbP1mm5lV7bfgV/iYWDio7lzX4MlJwDedWLiufr3Ajq+79CQiqPaIbZTo0i13zijKtX7wgxQ78wT/HkJRLkFpmGeK3za21tEfttytkhmJYlwaDTEc+Kx3RJqVhVh/dfwJGeuV4Xc/e2NH++ht0ENGuTk44KpQ+pwQVqtW7lmbDZQJoOJ7HYmmoKGJ0qt2hrj15uwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZfv2AZZ9/7Y+igshzfB0reIFdUKw3cdVTzfv5FNrIqN5pwIDAQAB\n-----END PUBLIC KEY-----\n';

// ECDSA key
//
// generate key
// ssh-keygen -t ecdsa -m pem
//
// get public key in pem format
// openssl ec -in /Users/USER_NAME/.ssh/id_ecdsa -pubout
var k1PubP8PEM = "-----BEGIN PUBLIC KEY-----\n" +
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEftkMDoidplcHjVwxbggb8/xdXJQX\n" +
  "2S1hib34pFzu1EyifUNAAhcQCQOEkbjaiLSps4GGF+pH4t1GD3rAf3F67g==" +
  "-----END PUBLIC KEY-----";

var k1PrvP8PPEM = "-----BEGIN EC PRIVATE KEY-----\n" +
  "MHcCAQEEIDMzz0wbs+8IB3EC7ymiwevUyeA0NQyWCaX2A6k3s/y5oAoGCCqGSM49\n" +
  "AwEHoUQDQgAEftkMDoidplcHjVwxbggb8/xdXJQX2S1hib34pFzu1EyifUNAAhcQ\n" +
  "CQOEkbjaiLSps4GGF+pH4t1GD3rAf3F67g==\n" +
  "-----END EC PRIVATE KEY-----";

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

const meta = {
    "diseaseCode":  "COVID-19",
    "publicHealthAuthority": "Govt Of India"
}

test('should convert W3C certificate json to fhir json', async () => {

    let fhirCert = await certificateToFhirJson(cert2, k1PrvP8PPEM, meta);
    console.log(JSON.stringify(fhirCert));

    expect(fhirCert.entry[0].fullUrl).toContain('urn:uuid:');
    expect(fhirCert.entry[0].resourceType).toBe('Composition');
    expect(fhirCert.entry[0].subject.reference).toBe(fhirCert.entry[2].fullUrl);
    expect(fhirCert.entry[0].attester[0].party.reference).toBe(fhirCert.entry[1].fullUrl);
    expect(fhirCert.entry[0].section[0].entry[0].reference).toBe(fhirCert.entry[3].fullUrl);

    expect(fhirCert.entry[1].fullUrl).toContain('urn:uuid:');
    expect(fhirCert.entry[1].resourceType).toBe('Organization');
    expect(fhirCert.entry[1].name).toBe(cert2.evidence[0].facility.name);

    expect(fhirCert.entry[2].fullUrl).toContain('urn:uuid:');
    expect(fhirCert.entry[2].resourceType).toBe('Patient');
    expect(fhirCert.entry[2].name[0].text).toBe(cert2.credentialSubject.name);
    expect(fhirCert.entry[2].gender).toBe(cert2.credentialSubject.gender.toLowerCase());

    expect(fhirCert.entry[3].fullUrl).toContain('urn:uuid:');
    expect(fhirCert.entry[3].resourceType).toBe('Immunization');
    expect(fhirCert.entry[3].occurrenceDateTime).toBe(cert2.evidence[0].date);
    expect(fhirCert.entry[3].lotNumber).toBe(cert2.evidence[0].batch);
    expect(fhirCert.entry[3].expirationDate).toBe(cert2.evidence[0].effectiveUntil);
    expect(fhirCert.entry[3].protocolApplied[0].doseNumberPositiveInt).toBe(parseInt(cert2.evidence[0].dose));
    expect(fhirCert.entry[3].protocolApplied[0].seriesDosesPositiveInt).toBe(parseInt(cert2.evidence[0].totalDoses));

    expect(fhirCert.entry[4].fullUrl).toContain('urn:uuid:');
    expect(fhirCert.entry[4].resource.resourceType).toBe('DocumentReference');

    expect(fhirCert.signature.sigFormat).toBe("application/jose");
    expect(fhirCert.signature.data.split(".").length).toBe(3);

});

test('should throw exception when unsupported vaccine name is passed', async () => {
    let cert = JSON.parse(JSON.stringify(cert2));
    cert.evidence[0].vaccine = 'vacc1';

    await expect(certificateToFhirJson(cert, k1PrvP8PPEM, meta))
      .rejects
      .toThrow('unsupported vaccine name vacc1');
});

test('should validate signed FHIR Json given public key', async () => {
    let fhirCert = await certificateToFhirJson(cert2, k1PrvP8PPEM, meta);

    expect(validateSignedFhirJson(fhirCert, k1PubP8PEM)).toBeTruthy();
    // validate QRContent
    expect(validateQRContent(fhirCert.entry[4].resource.content[1].attachment.id, k1PubP8PEM)).toBeTruthy()
});

test('should validate signed FHIR Json given ECDSA public key', async () => {
    let fhirCert = await certificateToFhirJson(cert2, k1PrvP8PPEM, meta);

    expect(validateSignedFhirJson(fhirCert, k1PubP8PEM)).toBeTruthy();
    // validate QRContent
    const qRPayload = fhirCert.entry[4].resource.content[1].attachment.id
    expect(validateQRContent(qRPayload, k1PubP8PEM)).toBeTruthy();
    console.log(rs.jws.JWS.readSafeJSONString(rs.b64utoutf8(qRPayload.split(".")[1])));

});

test('should invalidate signed FHIR Json with wrong public private key pair', async () => {
    const dummyPublicKeyPem = '-----BEGIN PUBLIC KEY-----\nuwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZf\n-----END PUBLIC KEY-----\n';
    let fhirCert = await certificateToFhirJson(cert2, k1PrvP8PPEM, meta);

    expect(validateSignedFhirJson(fhirCert, dummyPublicKeyPem)).toBeFalsy();
});
