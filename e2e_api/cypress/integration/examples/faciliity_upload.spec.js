import {PORTAL_URL} from "./test_data";

const {createFacilitatesCSV} = require("./test_data");
const {facilities} = require("./test_data");
const BASE_URL = PORTAL_URL + "/divoc/admin/api/v1";
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

        // Build up the form
        const formData = new FormData();
        cy.divocFormRequest('POST', FACILITIES, fileName, formData, (response) => {
            expect(response.status).to.eq(200)
        })

        cy.wait("@waitForApiToComplete")
        cy.wait(2000)

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

