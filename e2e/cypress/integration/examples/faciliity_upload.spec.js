const {facilities} = require("./test_data");
const BASE_URL = "http://portal_api:8001/divoc/admin/api/v1";
const FACILITIES = BASE_URL + "/facilities"


describe("Facility Tests", () => {

    beforeEach(() => {
        cy.intercept({
            url: BASE_URL,
        }).as("waitForApiToComplete");
    })

    it("Test GET facilities by uploading facilities CSV ", () => {

        const fileName = 'facilities.csv';
        createFacilitatesCSV(fileName);

        cy.divocFormRequest('POST', FACILITIES, fileName, (response) => {
            expect(response.status).to.eq(200)
        })

        cy.wait("@waitForApiToComplete")

        cy.divocRequest('GET', FACILITIES)
            .its('body')
            .should('be.an', 'array')
            .should(items => {
                const facilityCodes = items.map(i => i.facilityCode)
                facilities.forEach((item) => {
                    expect(facilityCodes).to.include(item.facilityCode)
                })
            })
    })
})

function convertJsonIntoCSV(jsonArray) {
    const items = jsonArray
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    const csv = [
        header.join(','), // header row first
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')

    return csv;
}


function createFacilitatesCSV(fileName) {
    facilities.forEach((item, index) => {
        const uniqueNumber = new Date().getTime() + "" + index
        item.serialNum = uniqueNumber
        item.facilityCode = "FC-" + uniqueNumber
    })

    const csv = convertJsonIntoCSV(facilities)
    cy.writeFile(`cypress/fixtures/${fileName}`, csv)
    return csv;
}

