describe('WCAG AA Accessibility Audit', () => {
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

    cy.env(['A11Y_WAIT_TIME', 'FAIL_ON_A11Y_VIOLATIONS']).then((envVars) => {
      // Wait for Quasar/Vue components to stabilize and ECharts to animate
      cy.wait(envVars.A11Y_WAIT_TIME || 2500)

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
        !(envVars.FAIL_ON_A11Y_VIOLATIONS === 'true'),
      )
    })
  }

  describe('Unauthenticated Pages', () => {
    it('audits the Login page', () => {
      // Create a separate session or just logout to audit login
      cy.clearCookies()
      cy.clearLocalStorage()
      checkAccessibility('/login')
    })
  })

  describe('Authenticated Modules', () => {
    beforeEach(() => {
      cy.env(['AUTH_USER', 'AUTH_PASS']).then((envVars) => {
        const user = envVars.AUTH_USER || 'admin'
        const password = envVars.AUTH_PASS || 'admin'
        // Uses the custom session-based login with mocks (no real backend needed)
        cy.login(user, password)
      })

      // Intercept general API calls to prevent UI crashes in CI where backend is absent
      cy.intercept('GET', '**/api/v1/token/**', { count: 0, results: [] })
      cy.intercept('GET', '**/api/v1/public/**', { count: 0, results: [] })
      cy.intercept('GET', '**/api/v1/stats/**', {})
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
