describe("Facility Tests", () => {
    it('should get all facilities', function () {
        cy.divocRequest('GET', 'http://localhost:8001/divoc/admin/api/v1/facilities')
            .its('body')
            .should('be.an', 'array')
            .and('have.length', 10)
    });

    it("Facilities File Upload", () => {
        //Declarations
        const fileName = 'facilities.csv';
        const method = 'POST';
        const url = 'http://localhost:8001/divoc/admin/api/v1/facilities';

        cy.divocFormRequest(method, url, fileName, (response) => {
            expect(response.status).to.eq(200)
        });
    })
})