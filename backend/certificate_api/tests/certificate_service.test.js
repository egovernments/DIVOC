const certificate_service = require('../src/services/certificate_service');
const dcc = require('@pathcheck/dcc-sdk');
const configurationService = require('../src/services/configuration_service');
const config = require('../configs/config');
const constants = require('../configs/constants');
config.DISEASE_CODE = 'COVID-19';
config.PUBLIC_HEALTH_AUTHORITY = 'Govt Of India';
config.ETCD_URL = 'etcd:2379'
var mockConstructor = {
    getEUVaccineDetails: jest.fn().mockImplementation((args) => {
        let vaccineDetails;
        switch(args) {
            case constants.EU_VACCINE_CONFIG_KEYS.MANUFACTURER:
                vaccineDetails = {
                    "astrazeneca": "ORG-100001699"
                };
                break;
            case constants.EU_VACCINE_CONFIG_KEYS.PROPHYLAXIS_TYPE:
                vaccineDetails = {
                    "covishield": "J07BX03"
                };
                break;
            case constants.EU_VACCINE_CONFIG_KEYS.VACCINE_CODE:
                vaccineDetails = {
                    "covishield": "Covishield"
                };
                break;
        }
        return vaccineDetails;
    })
}
jest.mock('../src/services/configuration_service', () => {
    return {
        ConfigurationService: jest.fn().mockImplementation(() => mockConstructor)
    }
});

const nameConfig = {
    "fn": "Dinushan",
    "fnt": "DINUSHAN",
    "gn": "D V Chanaka",
    "gnt": "D>V>CHANAKA"
};

test('should convert certificate in eu specified payload if all fields are provided in correct format', async() => {
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
        "ver": "1.3.0",
        "nam": {
            "fn": "Dinushan",
            "fnt": "DINUSHAN",
            "gn": "D V Chanaka",
            "gnt": "D>V>CHANAKA"
        },
        "dob": "1986-10-12",
        "v": [
            {
                "tg": "840539006",
                "vp": "J07BX03",
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
    const actualDccPayload = await certificate_service.convertCertificateToDCCPayload(certificateRaw, nameConfig);
    expect(actualDccPayload).toEqual(expectedDccPayload);
});

test('should convert certificate in eu specified payload if country field is full name of country', async() => {
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
        "ver": "1.3.0",
        "nam": {
            "fn": "Dinushan",
            "fnt": "DINUSHAN",
            "gn": "D V Chanaka",
            "gnt": "D>V>CHANAKA"
        },
        "dob": "1986-10-12",
        "v": [
            {
                "tg": "840539006",
                "vp": "J07BX03",
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
    const actualDccPayload = await certificate_service.convertCertificateToDCCPayload(certificateRaw, nameConfig);
    expect(actualDccPayload).toEqual(expectedDccPayload);
});

test('should convert certificate in eu specified payload if country field is 2 letter code', async() => {
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
        "ver": "1.3.0",
        "nam": {
            "fn": "Dinushan",
            "fnt": "DINUSHAN",
            "gn": "D V Chanaka",
            "gnt": "D>V>CHANAKA"
        },
        "dob": "1986-10-12",
        "v": [
            {
                "tg": "840539006",
                "vp": "J07BX03",
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
    const actualDccPayload = await certificate_service.convertCertificateToDCCPayload(certificateRaw, nameConfig);
    expect(actualDccPayload).toEqual(expectedDccPayload);
});

test('should convert certificate in eu specified payload if country field is invalid country code', async() => {
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
        "ver": "1.3.0",
        "nam": {
            "fn": "Dinushan",
            "fnt": "DINUSHAN",
            "gn": "D V Chanaka",
            "gnt": "D>V>CHANAKA"
        },
        "dob": "1986-10-12",
        "v": [
            {
                "tg": "840539006",
                "vp": "J07BX03",
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
    const actualDccPayload = await certificate_service.convertCertificateToDCCPayload(certificateRaw, nameConfig);
    expect(actualDccPayload).toEqual(expectedDccPayload);
});

test('should return latest dose\'s latest certificate', () => {
    const certificates = [
        {
            name: 'John Doe',
            contact: [ 'tel:9691742639' ],
            mobile: '9691742639',
            preEnrollmentCode: '987456111',
            certificateId: '525128495',
            certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v2"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456111","name":"John Doe","gender":"Male","age":"35","nationality":"Dutch","address":{"streetAddress":"Zevenenderdrift 98","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"},"dob":"1987-04-21"},"issuer":"https://cowin.gov.in/","issuanceDate":"2022-01-05T17:43:33.711Z","evidence":[{"id":"https://cowin.gov.in/vaccine/525128495","infoUrl":"https://cowin.gov.in/?525128495","feedbackUrl":"https://cowin.gov.in/?525128495","certificateId":"525128495","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","icd11Code":"XM9QW8","prophylaxis":"COVID-19 vaccine, non-replicating viral vector","date":"2021-10-17T05:30:28.187Z","effectiveStart":"2021-10-25","effectiveUntil":"2022-10-24","dose":1,"totalDoses":2,"verifier":{"name":"Bartjan Verduijn"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"Oude Varsselseweg 7","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2022-01-05T17:43:33Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..OpXTzWnKHuU-rF_ZuWSzHNjk3sdkuKerDstQRC5BOUddp3iVcB_bQcag6Y5HXDYCFxzquPBqbhX6ikwnf2A_MXSxouMIAyMCcYO6U-f1to8BGjkA8lrMYoMi2RxOq9snVWbFIk3o1as0HBafvOW3b2uJMUJOvBYQArZFnE2JOpYhRC1wlptCRzvkq4-5OJf8DSG9AywenU6U0Qg_YoDvvyAqVoUTtkC7juA1Gr2eZW-znMZOdYQ47N3-NqK6NxY_pR8pBqV3mvOzfdJICa_J5EBnM7CpJz3iWjOQBTYeWsAZANMla_cpL6lCq9LlvekGs6lgwaRnWiOl7x3AS615sA"}}',
            programId: 'VCC001',
            meta: {
                certificateType: 'certifyV3',
                osCreatedAt: '2022-01-05T17:43:34.366Z',
                osUpdatedAt: '2022-01-05T17:43:34.366Z',
                osid: '257b9764-28ab-4a39-9033-8a4effc70ac1'
            },
            osCreatedAt: '2022-01-05T17:43:34.366Z',
            osUpdatedAt: '2022-01-05T17:43:34.366Z',
            osid: 'dbcca4d7-70f8-4235-81bc-382d38f5553f'
        },
        {
            name: 'John Doe',
            contact: [ 'tel:9691742639' ],
            mobile: '9691742639',
            preEnrollmentCode: '987456111',
            certificateId: '712988986',
            certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v2"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456111","name":"John Doe","gender":"Male","age":"35","nationality":"Dutch","address":{"streetAddress":"Zevenenderdrift 98","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"},"dob":"1987-04-21"},"issuer":"https://cowin.gov.in/","issuanceDate":"2022-01-05T17:43:40.699Z","evidence":[{"id":"https://cowin.gov.in/vaccine/712988986","infoUrl":"https://cowin.gov.in/?712988986","feedbackUrl":"https://cowin.gov.in/?712988986","certificateId":"712988986","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","icd11Code":"XM9QW8","prophylaxis":"COVID-19 vaccine, non-replicating viral vector","date":"2021-10-17T05:30:28.187Z","effectiveStart":"2021-10-25","effectiveUntil":"2022-10-24","dose":2,"totalDoses":2,"verifier":{"name":"Bartjan Verduijn"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"Oude Varsselseweg 7","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2022-01-05T17:43:40Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..ku3L1y_1oMFJ4Nd5Q3E3YXDCus1z_KmBxbxvNDVHQuqFeanf18j0_YPWNE1SNe-BHEk3cdHeGqqQHXqgFrAl3l5JV9pxL-qdG5tOre9WpP1iQiEtKPfOIx3XxWPs59VyOr_X_kGsc3KmUUjYzGkoaeV2w3Cf2g11v13oJES_x3tXxfWwkwMZ6okXkyAG4Q_kP4_m4XpWrV8LcK6DjuFscdj72-4Jre5NXtMcB4qPWjN4zj9QXb9oazxss14FaceaEUbqcz0uAVO5KIQtgmbM9HqLUbHwVkL8ojxUUrDn3go9kMcT21FNR7BDLUAoYZD9H3gcFKnomkOAry0ClrB8QA"}}',
            programId: 'VCC001',
            meta: {
                certificateType: 'certifyV3',
                osCreatedAt: '2022-01-05T17:43:40.771Z',
                osUpdatedAt: '2022-01-05T17:43:40.771Z',
                osid: 'c9536d67-51c6-4da4-8bd1-8d1147646858'
            },
            osCreatedAt: '2022-01-05T17:43:40.771Z',
            osUpdatedAt: '2022-01-05T17:43:40.771Z',
            osid: 'd5a71516-49dd-4b4f-b68e-f7ca1621dc0c'
        },
        {
            name: 'John Doe updated',
            contact: [ 'tel:9691742639' ],
            mobile: '9691742639',
            preEnrollmentCode: '987456111',
            certificateId: '576939268', 
            certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v2"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456111","name":"John Doe updated","gender":"Male","age":"35","nationality":"Dutch","address":{"streetAddress":"Zevenenderdrift 98","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"},"dob":"1987-04-21"},"issuer":"https://cowin.gov.in/","issuanceDate":"2022-01-05T17:44:11.212Z","evidence":[{"id":"https://cowin.gov.in/vaccine/576939268","infoUrl":"https://cowin.gov.in/?576939268","feedbackUrl":"https://cowin.gov.in/?576939268","certificateId":"576939268","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","icd11Code":"XM9QW8","prophylaxis":"COVID-19 vaccine, non-replicating viral vector","date":"2021-10-17T05:30:28.187Z","effectiveStart":"2021-10-25","effectiveUntil":"2022-10-24","dose":1,"totalDoses":2,"verifier":{"name":"Bartjan Verduijn"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"Oude Varsselseweg 7","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2022-01-05T17:44:11Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..KsTN7Dxud-ooF4eDOGWHV_6AApsKLABHpQM9A1J1jv9X2_dEtxZZxHBsJCl-N1tBeK170wub9pjBmbgY6mwEQEnaugROzS8ind-V1L124B45ij4vCp6aqNFMAg-Yu2BpDp-Rhgt9UhsLr7CQtHfqMn13oOLP1xeECVWmyCkXRpmsVNblY16wb9EFZF0J4Z9hezB_UifMw35Dr1PAjx4rbi2gL7PXXXF-P54WNHKdWc3r79XAbuDdBleoTJt002GdETccD7mKNTkok6-KkzNjyU6HHQTGwcS1yKLNbAnk8UZZbaCXG6MW-6Q5of04Puj-xkSPGgplX5sVJPZvsL9wWA"}}',
            programId: 'VCC001',
            meta: {
                certificateType: 'certifyV3',
                previousCertificateId: '525128495',
                osCreatedAt: '2022-01-05T17:44:11.245Z',
                osUpdatedAt: '2022-01-05T17:44:11.245Z',
                osid: 'ca08813c-c783-4d61-9049-1024ba4e2a68'
            },
            osCreatedAt: '2022-01-05T17:44:11.245Z',
            osUpdatedAt: '2022-01-05T17:44:11.245Z',
            osid: 'bb2691c5-be95-451b-96d4-e1f00244e14a'
        }
    ];
    const expectedLatestCertificate = {
        name: 'John Doe',
        contact: [ 'tel:9691742639' ],
        mobile: '9691742639',
        preEnrollmentCode: '987456111',
        certificateId: '712988986',
        certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v2"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456111","name":"John Doe","gender":"Male","age":"35","nationality":"Dutch","address":{"streetAddress":"Zevenenderdrift 98","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"},"dob":"1987-04-21"},"issuer":"https://cowin.gov.in/","issuanceDate":"2022-01-05T17:43:40.699Z","evidence":[{"id":"https://cowin.gov.in/vaccine/712988986","infoUrl":"https://cowin.gov.in/?712988986","feedbackUrl":"https://cowin.gov.in/?712988986","certificateId":"712988986","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","icd11Code":"XM9QW8","prophylaxis":"COVID-19 vaccine, non-replicating viral vector","date":"2021-10-17T05:30:28.187Z","effectiveStart":"2021-10-25","effectiveUntil":"2022-10-24","dose":2,"totalDoses":2,"verifier":{"name":"Bartjan Verduijn"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"Oude Varsselseweg 7","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2022-01-05T17:43:40Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..ku3L1y_1oMFJ4Nd5Q3E3YXDCus1z_KmBxbxvNDVHQuqFeanf18j0_YPWNE1SNe-BHEk3cdHeGqqQHXqgFrAl3l5JV9pxL-qdG5tOre9WpP1iQiEtKPfOIx3XxWPs59VyOr_X_kGsc3KmUUjYzGkoaeV2w3Cf2g11v13oJES_x3tXxfWwkwMZ6okXkyAG4Q_kP4_m4XpWrV8LcK6DjuFscdj72-4Jre5NXtMcB4qPWjN4zj9QXb9oazxss14FaceaEUbqcz0uAVO5KIQtgmbM9HqLUbHwVkL8ojxUUrDn3go9kMcT21FNR7BDLUAoYZD9H3gcFKnomkOAry0ClrB8QA"}}',
        programId: 'VCC001',
        meta: {
            certificateType: 'certifyV3',
            osCreatedAt: '2022-01-05T17:43:40.771Z',
            osUpdatedAt: '2022-01-05T17:43:40.771Z',
            osid: 'c9536d67-51c6-4da4-8bd1-8d1147646858'
        },
        osCreatedAt: '2022-01-05T17:43:40.771Z',
        osUpdatedAt: '2022-01-05T17:43:40.771Z',
        osid: 'd5a71516-49dd-4b4f-b68e-f7ca1621dc0c'
    }
    const actualLatestCertificate = certificate_service.getLatestCertificate(certificates);
    expect(expectedLatestCertificate).toEqual(actualLatestCertificate);
});

test('should fetch only 2nd dose certificate if only that is present in system', () => {
    const expectedLatestCertificate = {
        name: 'John Doe',
        contact: [ 'tel:9691742639' ],
        mobile: '9691742639',
        preEnrollmentCode: '987456111',
        certificateId: '712988986',
        certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v2"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456111","name":"John Doe","gender":"Male","age":"35","nationality":"Dutch","address":{"streetAddress":"Zevenenderdrift 98","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"},"dob":"1987-04-21"},"issuer":"https://cowin.gov.in/","issuanceDate":"2022-01-05T17:43:40.699Z","evidence":[{"id":"https://cowin.gov.in/vaccine/712988986","infoUrl":"https://cowin.gov.in/?712988986","feedbackUrl":"https://cowin.gov.in/?712988986","certificateId":"712988986","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","icd11Code":"XM9QW8","prophylaxis":"COVID-19 vaccine, non-replicating viral vector","date":"2021-10-17T05:30:28.187Z","effectiveStart":"2021-10-25","effectiveUntil":"2022-10-24","dose":2,"totalDoses":2,"verifier":{"name":"Bartjan Verduijn"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"Oude Varsselseweg 7","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2022-01-05T17:43:40Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..ku3L1y_1oMFJ4Nd5Q3E3YXDCus1z_KmBxbxvNDVHQuqFeanf18j0_YPWNE1SNe-BHEk3cdHeGqqQHXqgFrAl3l5JV9pxL-qdG5tOre9WpP1iQiEtKPfOIx3XxWPs59VyOr_X_kGsc3KmUUjYzGkoaeV2w3Cf2g11v13oJES_x3tXxfWwkwMZ6okXkyAG4Q_kP4_m4XpWrV8LcK6DjuFscdj72-4Jre5NXtMcB4qPWjN4zj9QXb9oazxss14FaceaEUbqcz0uAVO5KIQtgmbM9HqLUbHwVkL8ojxUUrDn3go9kMcT21FNR7BDLUAoYZD9H3gcFKnomkOAry0ClrB8QA"}}',
        programId: 'VCC001',
        meta: {
            certificateType: 'certifyV3',
            osCreatedAt: '2022-01-05T17:43:40.771Z',
            osUpdatedAt: '2022-01-05T17:43:40.771Z',
            osid: 'c9536d67-51c6-4da4-8bd1-8d1147646858'
        },
        osCreatedAt: '2022-01-05T17:43:40.771Z',
        osUpdatedAt: '2022-01-05T17:43:40.771Z',
        osid: 'd5a71516-49dd-4b4f-b68e-f7ca1621dc0c'
    }
    const actualLatestCertificate = certificate_service.getLatestCertificate([expectedLatestCertificate]);
    expect(expectedLatestCertificate).toEqual(actualLatestCertificate);
});

test('should fetch only provisional dose certificate if only that is present in system', () => {
    const expectedLatestCertificate = {
        name: 'John Doe',
        contact: [ 'tel:9691742639' ],
        mobile: '9691742639',
        preEnrollmentCode: '987456111',
        certificateId: '525128495',
        certificate: '{"@context":["https://www.w3.org/2018/credentials/v1","https://cowin.gov.in/credentials/vaccination/v2"],"type":["VerifiableCredential","ProofOfVaccinationCredential"],"credentialSubject":{"type":"Person","id":"872550100V","refId":"987456111","name":"John Doe","gender":"Male","age":"35","nationality":"Dutch","address":{"streetAddress":"Zevenenderdrift 98","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"},"dob":"1987-04-21"},"issuer":"https://cowin.gov.in/","issuanceDate":"2022-01-05T17:43:33.711Z","evidence":[{"id":"https://cowin.gov.in/vaccine/525128495","infoUrl":"https://cowin.gov.in/?525128495","feedbackUrl":"https://cowin.gov.in/?525128495","certificateId":"525128495","type":["Vaccination"],"batch":"41202025","vaccine":"Covishield","manufacturer":"astrazeneca","icd11Code":"XM9QW8","prophylaxis":"COVID-19 vaccine, non-replicating viral vector","date":"2021-10-17T05:30:28.187Z","effectiveStart":"2021-10-25","effectiveUntil":"2022-10-24","dose":1,"totalDoses":2,"verifier":{"name":"Bartjan Verduijn"},"facility":{"name":"MOH Gothatuwa","address":{"streetAddress":"Oude Varsselseweg 7","streetAddress2":"","district":"Laren","city":"","addressRegion":"Noord-Holland","addressCountry":"NLD","postalCode":"1251 RD"}}}],"nonTransferable":"true","proof":{"type":"RsaSignature2018","created":"2022-01-05T17:43:33Z","verificationMethod":"did:india","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..OpXTzWnKHuU-rF_ZuWSzHNjk3sdkuKerDstQRC5BOUddp3iVcB_bQcag6Y5HXDYCFxzquPBqbhX6ikwnf2A_MXSxouMIAyMCcYO6U-f1to8BGjkA8lrMYoMi2RxOq9snVWbFIk3o1as0HBafvOW3b2uJMUJOvBYQArZFnE2JOpYhRC1wlptCRzvkq4-5OJf8DSG9AywenU6U0Qg_YoDvvyAqVoUTtkC7juA1Gr2eZW-znMZOdYQ47N3-NqK6NxY_pR8pBqV3mvOzfdJICa_J5EBnM7CpJz3iWjOQBTYeWsAZANMla_cpL6lCq9LlvekGs6lgwaRnWiOl7x3AS615sA"}}',
        programId: 'VCC001',
        meta: {
            certificateType: 'certifyV3',
            osCreatedAt: '2022-01-05T17:43:34.366Z',
            osUpdatedAt: '2022-01-05T17:43:34.366Z',
            osid: '257b9764-28ab-4a39-9033-8a4effc70ac1'
        },
        osCreatedAt: '2022-01-05T17:43:34.366Z',
        osUpdatedAt: '2022-01-05T17:43:34.366Z',
        osid: 'dbcca4d7-70f8-4235-81bc-382d38f5553f'
    }
    const actualLatestCertificate = certificate_service.getLatestCertificate([expectedLatestCertificate]);
    expect(expectedLatestCertificate).toEqual(actualLatestCertificate);
});

test('should convert certificate in eu specified payload with only fn, fnt if gn, gnt is not present', async() => {
    const nameConfig1 = {
        fn: "Dinushan",
        fnt: "DINUSHAN"
    }
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
        "ver": "1.3.0",
        "nam": {
            "fn": "Dinushan",
            "fnt": "DINUSHAN"
        },
        "dob": "1986-10-12",
        "v": [
            {
                "tg": "840539006",
                "vp": "J07BX03",
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
    const actualDccPayload = await certificate_service.convertCertificateToDCCPayload(certificateRaw, nameConfig1);
    expect(actualDccPayload).toEqual(expectedDccPayload);
    expect(actualDccPayload.nam.hasOwnProperty("gn")).toEqual(false);
    expect(actualDccPayload.nam.hasOwnProperty("gnt")).toEqual(false);
});