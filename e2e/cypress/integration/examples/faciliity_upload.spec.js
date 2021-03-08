const BASE_URL = "http://localhost:8001/divoc/admin/api/v1";
const FACILITIES = BASE_URL + "/facilities"

describe("Facility Tests", () => {

    beforeEach(() => {
        cy.intercept({
            url: BASE_URL,
        }).as("waitForApiToComplete");
    })

    it("Test GET facilities by Upload Facilities CSV ", () => {

        const fileName = 'facilities.csv';

        cy.divocFormRequest('POST', FACILITIES, fileName, (response) => {
            expect(response.status).to.eq(200)
        })

        cy.wait("@waitForApiToComplete")

        cy.divocRequest('GET', FACILITIES)
            .its('body')
            .should('be.an', 'array')
            .and('have.length', 10)
    })
})