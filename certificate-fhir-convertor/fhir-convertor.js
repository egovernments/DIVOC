const { v4: uuidv4 } = require('uuid');
const R = require('ramda');

const vaccineCodeMapping = {
    "Covaxin": {
        "code": "XM1NL1"
    },
    "Covishield": {
        "code": "XM5DF6"
    }
};

function certificateToFhirJson(certificate) {
    const dateString = new Date().toJSON();

    const patientId = "urn:uuid:" + uuidv4();
    const organisationId = "urn:uuid:" + uuidv4();
    const practitionerId = "urn:uuid:" + uuidv4();
    const bundleId = "urn:uuid:" + uuidv4();

    const practitionerName = R.pathOr('', ['evidence', 0, 'verifier', 'name'], certificate);
    const vaccineName = R.pathOr('', ['evidence', 0, 'vaccine'], certificate);
    const vaccineCode = vaccineCodeMapping[vaccineName].code;

    const facilityName = R.pathOr('', ['evidence', 0, 'facility', 'name'], certificate);
    const facilityCity = R.pathOr('', ['evidence', 0, 'facility', 'address', 'city'], certificate);
    const facilityDistrict = R.pathOr('', ['evidence', 0, 'facility', 'address', 'district'], certificate);
    const facilityCountry = R.pathOr('', ['evidence', 0, 'facility', 'address', 'addressCountry'], certificate);

    const patientNationality = R.pathOr('', ['credentialSubject', 'nationality'], certificate);
    const patientGovtId = R.pathOr('', ['credentialSubject', 'id'], certificate);
    const patientName = R.pathOr('', ['credentialSubject', 'name'], certificate);
    const patientGender = R.pathOr('', ['credentialSubject', 'gender'], certificate).toLowerCase();
    const vaccinationDate = R.pathOr('', ['evidence', 0, 'date'], certificate);
    const manufacturer = R.pathOr('', ['evidence', 0, 'manufacturer'], certificate);
    const batchNumber = R.pathOr('', ['evidence', 0, 'batch'], certificate);
    const effectiveUntilDate = R.pathOr('', ['evidence', 0, 'effectiveUntil'], certificate);
    const dose = parseInt(R.pathOr('', ['evidence', 0, 'dose'], certificate));

    const fhirCertificateTemplate = {
        "resourceType": "Bundle",
        "id": "1",
        "meta": {
            "versionId": "1",
            "profile": [
                "http://fhir.org/guides/who/svc-rc1/StructureDefinition/svc-bundle"
            ],
            "security": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
                    "code": "V",
                    "display": "very restricted"
                }
            ]
        },
        "identifier": {
            "system": "http://acme.in",
            "value": bundleId
        },
        "type": "document",
        "timestamp": dateString,
        "entry": [
            {
                "fullUrl": "1"
            },
            {
                "resource": {
                    "resourceType": "Composition",
                    "id": "1",
                    "meta": {
                        "versionId": "1",
                        "lastUpdated": dateString,
                        "profile": [
                            "http://fhir.org/guides/who/svc-rc1/StructureDefinition/svc-composition"
                        ]
                    },
                    "language": "en-IN",
                    "status": "final",
                    "type": {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "373942005",
                                "display": "SVC Bundle"
                            }
                        ]
                    },
                    "subject": {
                        "reference": patientId
                    },
                    "date": dateString,
                    "author": [
                        {
                            "reference": practitionerId
                        }
                    ],
                    "title": "SVC Bundle",
                    "confidentiality": "N",
                    "custodian": {
                        "reference": organisationId
                    }
                }
            },
            {
                "fullUrl": practitionerId
            },
            {
                "resource": {
                    "resourceType": "Practitioner",
                    "id": "1",
                    "meta": {
                        "versionId": "1",
                        "lastUpdated": dateString,
                        "profile": [
                            "http://fhir.org/guides/who/svc-rc1/StructureDefinition/svc-practitioner"
                        ]
                    },
                    "identifier": [
                        {
                            "type": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                        "code": "MD",
                                        "display": "Medical License number"
                                    }
                                ]
                            },
                            "system": "https://doctor.ndhm.gov.in",
                            "value": "21-1521-3828-3227"
                        }
                    ],
                    "name": [
                        {
                            "text":  practitionerName
                        }
                    ]
                }
            },
            {
                "fullUrl": organisationId
            },
            {
                "resource": {
                    "resourceType": "Organization",
                    "meta": {
                        "profile": [
                            "http://fhir.org/guides/who/svc-rc1/StructureDefinition/svc-organization"
                        ]
                    },
                    "identifier": [
                        {
                            "type": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                        "code": "PRN",
                                        "display": "Provider number"
                                    }
                                ]
                            },
                            "system": "https://facility.who",
                            "value": facilityName.split(' ').join('-')
                        }
                    ],
                    "name": facilityName,
                    "address": [
                        {
                            "city": facilityCity
                        },
                        {
                            "district": facilityDistrict
                        },
                        {
                            "country": facilityCountry
                        }
                    ]
                }
            },
            {
                "fullUrl": patientId
            },
            {
                "resource": {
                    "resourceType": "Patient",
                    "meta": {
                        "versionId": "1",
                        "lastUpdated": dateString,
                        "profile": [
                            "http://fhir.org/guides/who/svc-rc1/StructureDefinition/svc-patient"
                        ]
                    },
                    "extension": [
                        {
                            "url": "patient-nationality",
                            "valueString": patientNationality
                        }
                    ],
                    "identifier": [
                        {
                            "type": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                        "code": "SVC",
                                        "display": "WHO SVC"
                                    }
                                ]
                            },
                            "system": "Govt id number",
                            "value": patientGovtId
                        }
                    ],
                    "name": [
                        {
                            "text": patientName
                        }
                    ],
                    "gender": patientGender
                }
            },
            {
                "fullUrl": "1"
            },
            {
                "resource": {
                    "resourceType": "Immunization",
                    "id": "1",
                    "identifier": [
                        {
                            "system": "http://acme.com/MRNs",
                            "value": "7000135"
                        }
                    ],
                    "vaccineCode": {
                        "coding": [
                            {
                                "system": "http://id.who.int/icd11/mms",
                                "code": vaccineCode,
                                "display": vaccineName
                            }
                        ]
                    },
                    "patient": {
                        "reference": "Patient/"+patientId
                    },
                    "occurrenceDateTime": vaccinationDate,
                    "manufacturer": {
                        "reference":  manufacturer
                    },
                    "lotNumber": batchNumber,
                    "expirationDate": effectiveUntilDate,
                    "doseQuantity": {
                        "value": dose
                    },
                    "performer": [
                        {
                            "actor": {
                                "reference": "Practitioner/"+practitionerId
                            }
                        }
                    ]
                }
            },
            {
                "fullUrl": "1"
            },
            {
                "resource": {
                    "resourceType": "Provenance",
                    "id": "1"
                }
            }
        ]
    };

    return JSON.stringify(fhirCertificateTemplate)
}

module.exports = {
    certificateToFhirJson,
    vaccineCodeMapping
};
