export const PORTAL_URL = "http://portal_api:8001"
export const KEYCLOAK_URL = "http://keycloak:8001"

export const facilities = [
    {
        "serialNum": 100,
        "facilityCode": "DEL010",
        "facilityName": "Awesome Hospital",
        "contact": 9809989981,
        "email": "awesome@mailinator.com",
        "operatingHourStart": 9,
        "operatingHourEnd": 18,
        "category": "GOVT",
        "type": "Fixed location",
        "status": "Active",
        "addressLine1": "No 23",
        "addressLine2": "Road, NIBM Road",
        "district": "Delhi",
        "state": "Delhi",
        "pincode": "A-100001",
        "geoLocationLat": 28,
        "geoLocationLon": 77,
        "websiteURL": "www.awesome.com",
        "adminName": "Suresh",
        "adminMobile": 1111111111
    },
    {
        "serialNum": 101,
        "facilityCode": "BLR311",
        "facilityName": "Chinmaya Mission Hospital",
        "contact": 9876543210,
        "email": "aolo@mailinator.com",
        "operatingHourStart": 10,
        "operatingHourEnd": 17,
        "category": "PRIVATE",
        "type": "Fixed location",
        "status": "Active",
        "addressLine1": "ER34",
        "addressLine2": "My C,D,E",
        "district": "Bengaluru",
        "state": "Karnataka",
        "pincode": "A-560001",
        "geoLocationLat": 13,
        "geoLocationLon": 75,
        "websiteURL": "www.aolo.com",
        "adminName": "ramesh",
        "adminMobile": 1111111112
    }
]

export const enrollments = [
    {
        "phone": "1234567890",
        "enrollmentScopeId": "",
        "nationalId": "2425",
        "dob": "1992-03-01",
        "gender": "Male",
        "name": "John",
        "email": "john@email.com",
        "addressLine1": "A",
        "addressLine2": "B",
        "district": "C",
        "state": "D",
        "pincode": "500001",
    }
]

export const vaccinators = [
    {
        "code": "V-12",
        "name": "John",
        "nationalIdentifier": "2424",
        "mobileNumber": "1234567890",
        "email": "a@a.com",
        "status": "Active",
        "facilityIds": "F-12",
    }
]

export function convertJsonIntoCSV(jsonArray) {
    const items = jsonArray
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    const csv = [
        header.join(','), // header row first
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')

    return csv;
}

export function createFacilitatesCSV(fileName) {

    facilities.forEach((item, index) => {
        const uniqueNumber = new Date().getTime() + "" + index
        item.serialNum = uniqueNumber
        item.facilityCode = "FC-" + uniqueNumber
    })
    return createCSV(facilities, fileName);
}

export function createCSV(jsonArray, fileName) {
    const csv = convertJsonIntoCSV(jsonArray)
    cy.writeFile(`cypress/fixtures/${fileName}`, csv)
    return csv;
}