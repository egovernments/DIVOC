const KEYCLOAK_URL = "http://localhost:8080/auth"
const TOKEN_URL = KEYCLOAK_URL + "/realms/divoc/protocol/openid-connect/token"

describe("Facility Tests", () => {
    it('should get all facilities', function () {

        const headers = {
            "Content-type": "application/x-www-form-urlencoded"
        }
        const body = {
            "grant_type": "client_credentials",
            "client_id": "admin-api",
            "client_secret": "8eb72e25-baff-4ec5-b636-d4c1b55257b5"
        }

        cy.request({
            method: 'POST',
            url: TOKEN_URL,
            headers: headers,
            body: body
        }).then((result) => {
            cy.request({
                method: 'GET',
                url: 'http://localhost:8001/divoc/admin/api/v1/facilities',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + result.body["access_token"]
                },
            }).its('body')
                .should('be.an', 'array')
                .and('have.length', 0)
        });
    });
})