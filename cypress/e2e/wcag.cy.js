describe('WCAG AA Accessibility Audit', () => {
  const user = Cypress.env('AUTH_USER') || 'admin'
  const password = Cypress.env('AUTH_PASS') || 'admin'
  const shouldFail = Cypress.env('FAIL_ON_A11Y_VIOLATIONS') === 'true'

  before(() => {
    // Reset violations file if running locally
    cy.writeFile('cypress/wcag-violations.json', {})
  })

  /**
   * Reusable accessibility audit helper
   * @param {string} path - The route to audit
   */
  const checkAccessibility = (path) => {
    cy.visit(path)
    cy.injectAxe()

    // Wait for Quasar/Vue components to stabilize and ECharts to animate
    cy.wait(Cypress.env('A11Y_WAIT_TIME') || 2500)

    cy.checkA11y(
      null,
      {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
      (violations) => {
        // 1. Report to JSON for artifact collection
        cy.readFile('cypress/wcag-violations.json').then((data) => {
          const current = data || {}
          current[path] = violations
          cy.writeFile('cypress/wcag-violations.json', current)
        })

        // 2. Report to console for CI visibility
        if (violations.length > 0) {
          cy.task(
            'log',
            `🚨 Found ${violations.length} accessibility violations on ${path}`,
          )
          violations.forEach((v) => {
            cy.task('log', `Violation: [${v.id}] ${v.help} (${v.impact})`)
          })
        }
      },
      !shouldFail,
    )
  }

  describe('Unauthenticated Pages', () => {
    it('audits the Login page', () => {
      // Create a separate session or just logout to audit login
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit('/login')
      cy.injectAxe()
      cy.checkA11y(null, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      })
    })
  })

  describe('Authenticated Modules', () => {
    before(() => {
      // Perform real login once for all authenticated tests in this block
      cy.visit('/login')
      // Use more robust selectors in case ID isn't matching the native input
      cy.get('input[autocomplete="username"]').type(user, { force: true })
      cy.get('input[type="password"]').type(password, { force: true })
      cy.get('button[type="submit"]').click()

      // Wait for redirect to dashboard
      cy.url().should('not.include', '/login')
    })

    const pages = [
      { name: 'Dashboard', path: '/' },
      { name: 'Computers', path: '/computers/results' },
      { name: 'Packages', path: '/packages/results' },
      { name: 'Models', path: '/models/results' },
      { name: 'Users', path: '/users/results' },
    ]

    pages.forEach((page) => {
      it(`audits the ${page.name} page`, () => {
        checkAccessibility(page.path)
      })
    })
  })
})
