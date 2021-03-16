export function getNationalIdType(nationalId) {
    return nationalId.split(":")[1];
}

export function getNationalIdNumber(nationalId) {
    return nationalId.split(":")[2];
}

export function constuctNationalId(idtype, idNumber) {
    return ["did", idtype, idNumber].join(":")
}

export function getNameOfTheId(value) {
    return ID_TYPES.find(id => id.value === value).name
}

export const ID_TYPES = [
    {
        "id": "aadhaar",
        "name": "Aadhaar",
        "value": "in.gov.uidai.aadhaar"
    },
    {
        "id": "driverLicense",
        "name": "Driver License",
        "value": "in.gov.driverlicense"
    },
    {
        "id": "panCard",
        "name": "Pan Card",
        "value": "in.gov.pancard"
    },
    {
        "id": "passport",
        "name": "Passport",
        "value": "in.gov.passport"
    },
    {
        "id": "healthInsurance",
        "name": "Health Insurance Smart Card",
        "value": "in.gov.healthInsurance"
    },
    {
        "id": "mnrega",
        "name": "MNREGA Job Card",
        "value": "in.gov.mnrega"
    },
    {
        "id": "id",
        "name": "Official Identity Card issued to MPs/MLAs",
        "value": "in.gov.id"
    }
];