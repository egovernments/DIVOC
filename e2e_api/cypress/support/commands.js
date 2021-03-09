// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('divocFormRequest', (method, url, fileName) => {
    return cy.fixture(fileName, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then((blob) => {
            return cy.divocGetToken()
                .then(accessToken => {
                    return {accessToken: accessToken, blob: blob}
                })
        }).then((result) => {
            // Build up the form
            const formData = new FormData();
            formData.set('file', result.blob, fileName); //adding a file to the form
            // Perform the request
            return fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${result.accessToken}`,
                },
                body: formData,
            });
        });
})


Cypress.Commands.add('divocRequest', (method, url, body) => {
    return cy.divocGetToken()
        .then((token) => {
            return cy.request({
                url: url,
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: body,
            });
        });
})


const KEYCLOAK_URL = "http://localhost:8080/auth"
const TOKEN_URL = KEYCLOAK_URL + "/realms/divoc/protocol/openid-connect/token"
const ADMIN_API_CLIENT_SECRET = "8eb72e25-baff-4ec5-b636-d4c1b55257b5"

const authBody = {
    "grant_type": "client_credentials",
    "client_id": "admin-api",
    "client_secret": ADMIN_API_CLIENT_SECRET
}

Cypress.Commands.add('divocGetToken', () => {
    return cy.request({
        method: 'POST',
        url: TOKEN_URL,
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        },
        body: authBody
    }).then((result) => {
        return result.body["access_token"]
    });
})