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

    it("Facilities File Upload", () => {

        //Declarations
        const fileName = 'facilities.csv';
        const method = 'POST';
        const url = 'http://localhost:8001/divoc/admin/api/v1/facilities';
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        // Get file from fixtures as binary
        /* cy.fixture(fileName, 'binary').then((excelBin) => {
             // File in binary format gets converted to blob so it can be sent as Form data
             Cypress.Blob.binaryStringToBlob(excelBin, fileType).then((blob) => {

                 // Build up the form
                 const formData = new FormData();
                 formData.set('file', blob, fileName); //adding a file to the form
                 // Perform the request
                 cy.form_request(method, url, formData, function (response) {
                     expect(response.status).to.eq(200);
                 });

             })

         })*/

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
            cy.fixture(fileName, 'binary')
                .then(Cypress.Blob.binaryStringToBlob)
                .then((blob) => {
                    // Build up the form
                    const formData = new FormData();
                    formData.set('file', blob, fileName); //adding a file to the form


                    const requestOptions = {
                        method: method,
                        url: url,
                        headers: {
                            "Authorization": `Bearer ${result.body["access_token"]}`,
                            "Content-Type": "multipart/form-data; boundary=--header"
                        }
                    }
                        //return cy.request({...requestOptions, form: true, body: formData});
                    // Perform the request
                     return cy.form_request(method, url, result.body["access_token"], formData, function (response) {
                         console.log(response)
                         expect(response.status).to.eq(200)
                     });
                })
        });
    })
})