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
        "id": "kebeleId",
        "name": "Kebele Id",
        "value": "in.gov.kebele"
    },
    {
        "id": "workId",
        "name": "Work Id",
        "value": "in.gov.workid"
    },
    {
        "id": "drivingLicense",
        "name": "Driving License",
        "value": "in.gov.drivinglicense"
    },
    {
        "id": "passport",
        "name": "Passport",
        "value": "in.gov.passport"
    },
    {
        "id": "other",
        "name": "Other",
        "value": "in.gov.other"
    },
];