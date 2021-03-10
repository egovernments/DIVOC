import {createCSV, enrollments, PORTAL_URL} from "./test_data";

const {facilities} = require("./test_data");
const BASE_URL = PORTAL_URL + "/divoc/admin/api/v1";
const ENROLLMENTS = BASE_URL + "/enrollments"
const FACILITIES = BASE_URL + "/facilities"

describe("Enrollments Tests", () => {

    const NewFacilityCode = "E" + new Date().getTime()
    beforeEach(() => {
        cy.wait(5000)
        cy.intercept({
            url: BASE_URL,
        }).as("waitForApiToComplete");

        const fileName = 'facilities.csv';
        const newFacility = facilities[0]
        newFacility.facilityCode = NewFacilityCode
        createCSV([newFacility], fileName);
        cy.divocFormRequest('POST', FACILITIES, fileName, new FormData(), (response) => {
            expect(response.status).to.eq(200)
        });
    })

    it("Test GET enrollments by uploading enrollments CSV ", () => {

        const fileName = 'enrollments.csv';
        const newEnrollments = enrollments[0]
        newEnrollments.enrollmentScopeId = NewFacilityCode
        newEnrollments.name = "John-" + new Date().getTime()
        createCSV([newEnrollments], fileName);

        // Build up the form
        const formData = new FormData();
        formData.set("programId", "CTEST")
        cy.divocFormRequest('POST', ENROLLMENTS, fileName, formData, (response) => {
            expect(response.status).to.eq(200)
        });

        cy.wait("@waitForApiToComplete");
        cy.wait(1000)

        cy.divocRequest('GET', ENROLLMENTS)
            .its('body')
            .should('be.an', 'array')
            .should(items => {
                const enrollmentScopeIds = items.map(i => i.enrollmentScopeId)
                const names = items.map(i => i.name)
                expect(enrollmentScopeIds).to.include(newEnrollments.enrollmentScopeId)
                expect(names).to.include(newEnrollments.name)
            })
    })
})