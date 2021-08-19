const vc = require('vc-js');
const {signJSON, transformW3, customLoader} = require('../signer');
const jsigs = require('jsonld-signatures');
const {RSAKeyPair} = require('crypto-ld');
const {RsaSignature2018} = jsigs.suites;
const {Ed25519Signature2018} = jsigs.suites;
const cert2 = {
    "preEnrollmentCode": "12346",
    "recipient": {
        "name": "Bhaya Mitra",
        "dob": "1994-11-30",
        "gender": "Male",
        "nationality": "Indian",
        "identity": "did:in.gov.uidai.aadhaar:2342343334",
        "contact": ["tel:9880414888"]
    },
    "vaccination": {
        "name": "CoVax",
        "batch": "MB3428BX",
        "manufacturer": "COVPharma",
        "date": "2020-12-02T19:21:18.646Z",
        "effectiveStart": "2020-12-02",
        "effectiveUntil": "2025-12-02"
    },
    "vaccinator": {
        "name": "Sooraj Singh"
    },
    "facility": {
        "name": "ABC Medical Center",
        "address": {
            "addressLine1": "123, Koramangala",
            "addressLine2": "",
            "district": "Bengaluru South",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin": 560034
        }
    }
};

const {AssertionProofPurpose} = jsigs.purposes;
const {publicKeyBase58, privateKeyBase58} = require('../config/keys');
const {Ed25519KeyPair} = require('crypto-ld');
const authorityId = 'did:india:moh#id';
const key = new Ed25519KeyPair(
    {
        publicKeyBase58: publicKeyBase58,
        id: authorityId
    }
);
test('Sign the json', async () => {
    sign = await signJSON(transformW3(cert2, "123321"));
    console.log(JSON.stringify(sign))
    expect(sign).not.toBe(null);
});

test('Verify the signed json', async () => {
    const signed = "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://cowin.mofw.gov.in/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:2342343334\",\"refId\":\"12346\",\"name\":\"Bhaya Mitra\",\"gender\":\"Male\",\"age\":27,\"nationality\":\"Indian\",\"address\":{\"streetAddress\":\"\",\"streetAddress2\":\"\",\"district\":\"\",\"city\":\"\",\"addressRegion\":\"\",\"addressCountry\":\"IN\",\"postalCode\":\"\"}},\"issuer\":\"https://nha.gov.in/\",\"issuanceDate\":\"2021-08-19T12:22:51.479Z\",\"evidence\":[{\"id\":\"https://nha.gov.in/evidence/vaccine/123321\",\"feedbackUrl\":\"https://divoc.xiv.in/feedback/123321\",\"infoUrl\":\"https://divoc.xiv.in/learn/123321\",\"certificateId\":\"123321\",\"type\":[\"Vaccination\"],\"batch\":\"MB3428BX\",\"vaccine\":\"CoVax\",\"manufacturer\":\"COVPharma\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"verifier\":{\"name\":\"Sooraj Singh\"},\"facility\":{\"name\":\"ABC Medical Center\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"streetAddress2\":\"\",\"district\":\"Bengaluru South\",\"city\":\"Bengaluru\",\"addressRegion\":\"Karnataka\",\"addressCountry\":\"IN\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"Ed25519Signature2018\",\"created\":\"2021-08-19T12:22:51Z\",\"verificationMethod\":\"did:india:moh#id\",\"proofPurpose\":\"assertionMethod\",\"jws\":\"eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..l6HxNHfLnanVLq_DbqxO4aFIq_sih9pKtkAQTlS0rf2PSZg_DWAADjFsiMXydiqEoGYCvW_mBbsgsJwO6nF8Cg\"}}";
  const publicKey = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: authorityId,
    type: 'Ed25519VerificationKey2018',
    controller: 'https://cowin.mohfw.gov.in/vaccine',
  };
    const controller = {
        '@context': jsigs.SECURITY_CONTEXT_URL,
        id: 'https://cowin.mohfw.gov.in/vaccine',
        publicKey: [publicKey],
        // this authorizes this key to be used for making assertions
        assertionMethod: [publicKey.id]
    };

    const purpose = new AssertionProofPurpose({
        controller: controller
    });
    const result = await vc.verifyCredential({
        credential: JSON.parse(signed), suite: new Ed25519Signature2018({key, verificationMethod:'did:example:123456#key1'}), purpose: purpose,
        documentLoader: customLoader,
        compactProof: false
    });
    expect(result.verified).toBe(true);
});

test('Signed json to include certificate id', async () => {
    const certificateId = "123";
    sign = await signJSON(transformW3(cert2, certificateId));
    expect(sign.credentialSubject.id).toBe(cert2.recipient.identity);
    expect(sign.evidence[0].id).toBe("https://nha.gov.in/evidence/vaccine/" + certificateId);
    expect(sign.evidence[0].certificateId).toBe(certificateId);
});