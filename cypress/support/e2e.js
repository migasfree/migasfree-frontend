// ***********************************************************
// This support file is processed and loaded automatically before your test files.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-axe'

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
})

// Global API interceptor to prevent hits to real server (GET requests only)
beforeEach(() => {
  cy.intercept('**/api/v1/**', (req) => {
    if (req.method === 'GET') {
      // Return empty array for stats, alerts, etc.
      if (req.url.includes('/stats/') || req.url.includes('/alerts/')) {
        req.reply({
          statusCode: 200,
          body: [],
        })
      } else {
        // Return paginated object for standard lists
        req.reply({
          statusCode: 200,
          body: { results: [], count: 0 },
        })
      }
    }
  }).as('globalApi')
})
