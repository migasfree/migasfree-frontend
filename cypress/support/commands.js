// ***********************************************
// This file contains custom commands and overrides
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- Login command --
Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    // Set language to English for consistent test expectations
    cy.setCookie('language', 'en_US')

    cy.visit('/login')
    cy.get('input[type="text"]').type(username)
    cy.get('input[type="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/login')
  })
})

// -- API intercept helpers --
Cypress.Commands.add('mockApiCall', (method, url, response) => {
  cy.intercept(method, url, response).as('apiCall')
})
