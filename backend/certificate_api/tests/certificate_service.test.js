const certificate_service = require('../src/services/certificate_service');
const dcc = require('@pathcheck/dcc-sdk');

test('should convert certificate in eu specified payload if all fields are provided in correct format', () => {
    const certificateRaw = {
        name: 'D V Chanaka Dinushan',
        contact: [ 'tel:0779039495' ],
        mobile: '0779039495',
        preEnrollmentCode: '987456126',
        certificateId: '788954392',
        certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456126","name":"D V Chanaka Dinushan","gender":"Male","age":"35", "dob": "1986-10-12","nationality":"Sri Lankan","address":{"streetAddress":"Tharaka, Kudawella South, Nakulugala, Tangalle","streetAddress2":"","district":"Hambanthota","city":"","addressRegion":" ","addressCountry":"LKA","postalCode":"r"}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-10-25T05:19:03.399Z","evidence":[{"id":"https://cowin.gov.in/vaccine/788954392","infoUrl":"https://cowin.gov.in/?788954392","certificateId":"788954392","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","date":"2021-02-17T05:30:28.187Z","effectiveStart":"2021-05-21","effectiveUntil":"2022-05-21","dose":1,"totalDoses":2,"verifier":{"name":"ss"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"df","streetAddress2":"","district":"wew","city":"","addressRegion":"w","addressCountry":"LKA","postalCode":"w"}},"feedbackUrl":"https://cowin.gov.in/?788954392"}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-10-25T05:19:03Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..UO2nMyTy0wY3CIXBz4agd2KJU9sTlKPB_M0CmPEOkCFgeZUGVuYyjiF3HOwDnk-FwzPsI_Syn42pLE18o5iO9PA3Fred4afj_bq-3Fy8zPW0tfOydIJpfayv1ANjBbgXTD_2i8aOrHmDv1ivVdIMs8nZGegEgP_3R3Km5VH4QkNdtadKNxoHI6KKJdL51ib5OphS7dGHlICseM79dINt9DEXWpIDYH4qAUq8TPa2uinJkLYEk3lKS8DxvW3g2BamQkzCF7p4EiI_r5QqSdGN9Jnv0mXFgZ9d3XU8U-Hchw64OMZHOiV3ImF5qWH6lel3SH0DeipO_o1w2LHoHnhywQ"}}',
        programId: 'VCC001',
        meta: {
          batch: '41212009',
          certificateType: 'certifyV2',
          cit: '00000074',
          date: '2021-05-07T05:30:28.187Z',
          manufacturer: 'india',
          name: 'Covishield',
          totalDoses: 2,
          osCreatedAt: '2021-10-25T05:19:03.624Z',
          osUpdatedAt: '2021-10-25T05:19:03.624Z',
          osid: 'f3ca00e0-38cb-4a94-bce6-ec4a8ea11bb5'
        },
        osCreatedAt: '2021-10-25T05:19:03.624Z',
        osUpdatedAt: '2021-10-25T05:19:03.624Z',
        osid: '4cf9228f-5802-4a51-aae2-2acacadef1ae'
    };
    const expectedDccPayload = {
        "ver": "1.0.0",
        "nam": {
        "fn": "Dinushan",
        "gn": "D V Chanaka"
        },
        "dob": "1986-10-12",
        "v": [
            {
                "tg": "840539006",
                "vp": "1119349007",
                "mp": "Covishield",
                "ma": "ORG-100001699",
                "dn": 1,
                "sd": 2,
                "dt": "2021-02-17",
                "co": "LK",
                "is": 'Govt Of India',
                "ci": "URN:UVCI:01:LK:788954392"
            }
        ]
    };
    const actualDccPayload = certificate_service.convertCertificateToDCCPayload(certificateRaw);
    expect(actualDccPayload).toEqual(expectedDccPayload);
});

test('should convert certificate in eu specified payload if country field is full name of country', () => {
    const certificateRaw = {
        name: 'D V Chanaka Dinushan',
        contact: [ 'tel:0779039495' ],
        mobile: '0779039495',
        preEnrollmentCode: '987456126',
        certificateId: '788954392',
        certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456126","name":"D V Chanaka Dinushan","gender":"Male","age":"35", "dob": "1986-10-12","nationality":"Sri Lankan","address":{"streetAddress":"Tharaka, Kudawella South, Nakulugala, Tangalle","streetAddress2":"","district":"Hambanthota","city":"","addressRegion":" ","addressCountry":"Australia","postalCode":"r"}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-10-25T05:19:03.399Z","evidence":[{"id":"https://cowin.gov.in/vaccine/788954392","infoUrl":"https://cowin.gov.in/?788954392","certificateId":"788954392","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","date":"2021-02-17T05:30:28.187Z","effectiveStart":"2021-05-21","effectiveUntil":"2022-05-21","dose":1,"totalDoses":2,"verifier":{"name":"ss"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"df","streetAddress2":"","district":"wew","city":"","addressRegion":"w","addressCountry":"Australia","postalCode":"w"}},"feedbackUrl":"https://cowin.gov.in/?788954392"}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-10-25T05:19:03Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..UO2nMyTy0wY3CIXBz4agd2KJU9sTlKPB_M0CmPEOkCFgeZUGVuYyjiF3HOwDnk-FwzPsI_Syn42pLE18o5iO9PA3Fred4afj_bq-3Fy8zPW0tfOydIJpfayv1ANjBbgXTD_2i8aOrHmDv1ivVdIMs8nZGegEgP_3R3Km5VH4QkNdtadKNxoHI6KKJdL51ib5OphS7dGHlICseM79dINt9DEXWpIDYH4qAUq8TPa2uinJkLYEk3lKS8DxvW3g2BamQkzCF7p4EiI_r5QqSdGN9Jnv0mXFgZ9d3XU8U-Hchw64OMZHOiV3ImF5qWH6lel3SH0DeipO_o1w2LHoHnhywQ"}}',
        programId: 'VCC001',
        meta: {
          batch: '41212009',
          certificateType: 'certifyV2',
          cit: '00000074',
          date: '2021-05-07T05:30:28.187Z',
          manufacturer: 'india',
          name: 'Covishield',
          totalDoses: 2,
          osCreatedAt: '2021-10-25T05:19:03.624Z',
          osUpdatedAt: '2021-10-25T05:19:03.624Z',
          osid: 'f3ca00e0-38cb-4a94-bce6-ec4a8ea11bb5'
        },
        osCreatedAt: '2021-10-25T05:19:03.624Z',
        osUpdatedAt: '2021-10-25T05:19:03.624Z',
        osid: '4cf9228f-5802-4a51-aae2-2acacadef1ae'
    };
    const expectedDccPayload = {
        "ver": "1.0.0",
        "nam": {
            "fn": "Dinushan",
            "gn": "D V Chanaka"
        },
        "dob": "1986-10-12",
        "v": [
            {
                "tg": "840539006",
                "vp": "1119349007",
                "mp": "Covishield",
                "ma": "ORG-100001699",
                "dn": 1,
                "sd": 2,
                "dt": "2021-02-17",
                "co": "AU",
                "is": 'Govt Of India',
                "ci": "URN:UVCI:01:AU:788954392"
            }
        ]
    };
    const actualDccPayload = certificate_service.convertCertificateToDCCPayload(certificateRaw);
    expect(actualDccPayload).toEqual(expectedDccPayload);
});

test('should convert certificate in eu specified payload if country field is 2 letter code', () => {
    const certificateRaw = {
        name: 'D V Chanaka Dinushan',
        contact: [ 'tel:0779039495' ],
        mobile: '0779039495',
        preEnrollmentCode: '987456126',
        certificateId: '788954392',
        certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456126","name":"D V Chanaka Dinushan","gender":"Male","age":"35", "dob": "1986-10-12","nationality":"Sri Lankan","address":{"streetAddress":"Tharaka, Kudawella South, Nakulugala, Tangalle","streetAddress2":"","district":"Hambanthota","city":"","addressRegion":" ","addressCountry":"LK","postalCode":"r"}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-10-25T05:19:03.399Z","evidence":[{"id":"https://cowin.gov.in/vaccine/788954392","infoUrl":"https://cowin.gov.in/?788954392","certificateId":"788954392","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","date":"2021-02-17T05:30:28.187Z","effectiveStart":"2021-05-21","effectiveUntil":"2022-05-21","dose":1,"totalDoses":2,"verifier":{"name":"ss"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"df","streetAddress2":"","district":"wew","city":"","addressRegion":"w","addressCountry":"LK","postalCode":"w"}},"feedbackUrl":"https://cowin.gov.in/?788954392"}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-10-25T05:19:03Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..UO2nMyTy0wY3CIXBz4agd2KJU9sTlKPB_M0CmPEOkCFgeZUGVuYyjiF3HOwDnk-FwzPsI_Syn42pLE18o5iO9PA3Fred4afj_bq-3Fy8zPW0tfOydIJpfayv1ANjBbgXTD_2i8aOrHmDv1ivVdIMs8nZGegEgP_3R3Km5VH4QkNdtadKNxoHI6KKJdL51ib5OphS7dGHlICseM79dINt9DEXWpIDYH4qAUq8TPa2uinJkLYEk3lKS8DxvW3g2BamQkzCF7p4EiI_r5QqSdGN9Jnv0mXFgZ9d3XU8U-Hchw64OMZHOiV3ImF5qWH6lel3SH0DeipO_o1w2LHoHnhywQ"}}',
        programId: 'VCC001',
        meta: {
          batch: '41212009',
          certificateType: 'certifyV2',
          cit: '00000074',
          date: '2021-05-07T05:30:28.187Z',
          manufacturer: 'india',
          name: 'Covishield',
          totalDoses: 2,
          osCreatedAt: '2021-10-25T05:19:03.624Z',
          osUpdatedAt: '2021-10-25T05:19:03.624Z',
          osid: 'f3ca00e0-38cb-4a94-bce6-ec4a8ea11bb5'
        },
        osCreatedAt: '2021-10-25T05:19:03.624Z',
        osUpdatedAt: '2021-10-25T05:19:03.624Z',
        osid: '4cf9228f-5802-4a51-aae2-2acacadef1ae'
    };
    const expectedDccPayload = {
        "ver": "1.0.0",
        "nam": {
            "fn": "Dinushan",
            "gn": "D V Chanaka"
        },
        "dob": "1986-10-12",
        "v": [
            {
                "tg": "840539006",
                "vp": "1119349007",
                "mp": "Covishield",
                "ma": "ORG-100001699",
                "dn": 1,
                "sd": 2,
                "dt": "2021-02-17",
                "co": "LK",
                "is": 'Govt Of India',
                "ci": "URN:UVCI:01:LK:788954392"
            }
        ]
    };
    const actualDccPayload = certificate_service.convertCertificateToDCCPayload(certificateRaw);
    expect(actualDccPayload).toEqual(expectedDccPayload);
});

test('should convert certificate in eu specified payload if country field is invalid country code', () => {
    const certificateRaw = {
        name: 'D V Chanaka Dinushan',
        contact: [ 'tel:0779039495' ],
        mobile: '0779039495',
        preEnrollmentCode: '987456126',
        certificateId: '788954392',
        certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v1"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456126","name":"D V Chanaka Dinushan","gender":"Male","age":"35", "dob": "1986-10-12","nationality":"Sri Lankan","address":{"streetAddress":"Tharaka, Kudawella South, Nakulugala, Tangalle","streetAddress2":"","district":"Hambanthota","city":"","addressRegion":" ","addressCountry":"ABC","postalCode":"r"}},"issuer":"https://cowin.gov.in/","issuanceDate":"2021-10-25T05:19:03.399Z","evidence":[{"id":"https://cowin.gov.in/vaccine/788954392","infoUrl":"https://cowin.gov.in/?788954392","certificateId":"788954392","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","date":"2021-02-17T05:30:28.187Z","effectiveStart":"2021-05-21","effectiveUntil":"2022-05-21","dose":1,"totalDoses":2,"verifier":{"name":"ss"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"df","streetAddress2":"","district":"wew","city":"","addressRegion":"w","addressCountry":"ABC","postalCode":"w"}},"feedbackUrl":"https://cowin.gov.in/?788954392"}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2021-10-25T05:19:03Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..UO2nMyTy0wY3CIXBz4agd2KJU9sTlKPB_M0CmPEOkCFgeZUGVuYyjiF3HOwDnk-FwzPsI_Syn42pLE18o5iO9PA3Fred4afj_bq-3Fy8zPW0tfOydIJpfayv1ANjBbgXTD_2i8aOrHmDv1ivVdIMs8nZGegEgP_3R3Km5VH4QkNdtadKNxoHI6KKJdL51ib5OphS7dGHlICseM79dINt9DEXWpIDYH4qAUq8TPa2uinJkLYEk3lKS8DxvW3g2BamQkzCF7p4EiI_r5QqSdGN9Jnv0mXFgZ9d3XU8U-Hchw64OMZHOiV3ImF5qWH6lel3SH0DeipO_o1w2LHoHnhywQ"}}',
        programId: 'VCC001',
        meta: {
          batch: '41212009',
          certificateType: 'certifyV2',
          cit: '00000074',
          date: '2021-05-07T05:30:28.187Z',
          manufacturer: 'india',
          name: 'Covishield',
          totalDoses: 2,
          osCreatedAt: '2021-10-25T05:19:03.624Z',
          osUpdatedAt: '2021-10-25T05:19:03.624Z',
          osid: 'f3ca00e0-38cb-4a94-bce6-ec4a8ea11bb5'
        },
        osCreatedAt: '2021-10-25T05:19:03.624Z',
        osUpdatedAt: '2021-10-25T05:19:03.624Z',
        osid: '4cf9228f-5802-4a51-aae2-2acacadef1ae'
    };
    const expectedDccPayload = {
        "ver": "1.0.0",
        "nam": {
            "fn": "Dinushan",
            "gn": "D V Chanaka"
        },
        "dob": "1986-10-12",
        "v": [
            {
                "tg": "840539006",
                "vp": "1119349007",
                "mp": "Covishield",
                "ma": "ORG-100001699",
                "dn": 1,
                "sd": 2,
                "dt": "2021-02-17",
                "co": "IN",
                "is": 'Govt Of India',
                "ci": "URN:UVCI:01:IN:788954392"
            }
        ]
    };
    const actualDccPayload = certificate_service.convertCertificateToDCCPayload(certificateRaw);
    expect(actualDccPayload).toEqual(expectedDccPayload);
});