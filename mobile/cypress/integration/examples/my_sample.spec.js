describe('Test Login', () => {
    /*   it('Invalid Login', () => {
           cy.visit('https://divoc.xiv.in/facility_app')
           cy.contains('GET OTP').click()
           cy.contains('Invalid username or password')
       })*/

    it('Valid Login', () => {
        cy.visit('https://divoc.xiv.in/facility_app')

        cy.get('.input-field')
            .type('2323232323')
        cy.contains('GET OTP').click()

        cy.get('input[id="otp"]')
            .type('1234')
        cy.contains('LOGIN').click()

        cy.contains('Home')
    })
})
