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
    // Mock API requests for login
    cy.intercept('POST', '**/rest-auth/login/', { key: 'fake-token' }).as(
      'login',
    )
    cy.intercept('GET', '**/rest-auth/user/', {
      id: 1,
      username: username,
      email: `${username}@example.com`,
      is_staff: true,
      domain_preference: null,
    }).as('getUser')
    cy.intercept('GET', '**/api/v1/public/server/info/', {
      version: '5.0',
      name: 'Test Server',
    }).as('getServerInfo')

    // Default empty results for domains and scopes during login
    // Individual tests can override these if needed
    cy.intercept('GET', '**/api/v1/token/domains/', { results: [] }).as(
      'getDomainsLogin',
    )
    cy.intercept('GET', '**/api/v1/token/scopes/', { results: [] }).as(
      'getScopesLogin',
    )

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
