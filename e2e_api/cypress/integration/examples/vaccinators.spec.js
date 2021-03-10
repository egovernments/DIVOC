import {createCSV, vaccinators} from "./test_data";

const {facilities} = require("./test_data");
const BASE_URL = "http://localhost:8001/divoc/admin/api/v1";
const VACCINATORS = BASE_URL + "/vaccinators"
const FACILITIES = BASE_URL + "/facilities"

describe("Vaccinator Tests", () => {

    const NewFacilityCode = "V" + new Date().getTime();

    beforeEach(() => {
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

    it("Test GET vaccinator by uploading vaccinator CSV ", () => {

        cy.wait(1000)

        const fileName = 'vaccinator.csv';
        const newVaccinator = vaccinators[0]
        newVaccinator.code = "C" + new Date().getTime();
        newVaccinator.name = "John-" + new Date().getTime()
        newVaccinator.facilityIds = NewFacilityCode
        createCSV([newVaccinator], fileName);

        // Build up the form
        const formData = new FormData();
        cy.divocFormRequest('POST', VACCINATORS, fileName, formData, (response) => {
            expect(response.status).to.eq(200)
        });

        cy.wait("@waitForApiToComplete");
        cy.wait(1000)

        cy.divocRequest('GET', VACCINATORS)
            .its('body')
            .should('be.an', 'array')
            .should(items => {
                const codes = items.map(i => i.code)
                const names = items.map(i => i.name)
                let facilityIds = []
                items.forEach((i) => {
                    facilityIds = facilityIds.concat(i.facilityIds)
                })
                expect(codes).to.include(newVaccinator.code)
                expect(names).to.include(newVaccinator.name)
                expect(facilityIds).to.include(newVaccinator.facilityIds)
            })
    })
})