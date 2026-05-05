describe('Deployment Detail Page', () => {
  beforeEach(() => {
    cy.login('admin', 'admin')

    // Mock API responses
    cy.intercept('GET', '**/api/v1/token/deployments/1*', {
      id: 1,
      name: 'Test_Deployment',
      enabled: true,
      project: { id: 1, name: 'Test_Project' },
      domain: null,
      comment: '',
      source: 'I',
      included_attributes: [],
      excluded_attributes: [],
      packages_to_install: [],
      packages_to_remove: [],
      default_preincluded_packages: [],
      default_included_packages: [],
      default_excluded_packages: [],
      start_date: '2024-01-01',
      schedule: null,
      auto_restart: false,
      available_packages: [],
      available_package_sets: [],
      timeline: { computers: {}, schedule: null },
    }).as('getDeployment')

    cy.intercept('GET', '**/api/v1/token/projects/', {
      results: [
        { id: 1, name: 'Test_Project' },
        { id: 2, name: 'Another_Project' },
      ],
    }).as('getProjects')

    cy.intercept('GET', '**/api/v1/token/domains/', {
      results: [
        { id: 1, name: 'Test_Domain' },
        { id: 2, name: 'Another_Domain' },
      ],
    }).as('getDomains')

    cy.intercept('GET', '**/api/v1/token/schedules/', {
      results: [
        { id: 1, name: 'Test_Schedule' },
        { id: 2, name: 'Another_Schedule' },
      ],
    }).as('getSchedules')

    cy.intercept('GET', '**/api/v1/token/stats/deployments/1/timeline/', {
      computers: { error: 0, ok: 0 },
      schedule: null,
    }).as('getTimeline')

    cy.intercept('PATCH', '**/api/v1/token/deployments/1*', {
      id: 1,
      name: 'Updated_Deployment_Name',
    }).as('updateDeployment')
  })

  it('should load the deployment detail page', () => {
    cy.visit('/deployments/results/1')
    cy.wait([
      '@getDeployment',
      '@getProjects',
      '@getDomains',
      '@getSchedules',
      '@getTimeline',
    ])

    cy.contains('Test_Deployment').should('be.visible')
    cy.get('input[aria-label="Name"]').should('have.value', 'Test_Deployment')
  })

  it('should display deployment form sections', () => {
    cy.visit('/deployments/results/1')
    cy.wait(['@getDeployment'])

    // Check for main sections by content instead of internal classes
    cy.contains('General').should('exist')
    cy.contains('To who (attributes)').should('exist')
    cy.contains('What (packages)').should('exist')
  })

  it('should validate required fields', () => {
    cy.visit('/deployments/results/1')
    cy.wait(['@getDeployment'])

    // Use type with selectall and backspace to ensure events are fired
    cy.get('input[aria-label="Name"]').type('{selectall}{backspace}').blur()
    // Use regex to match both "Required" and "* Required" or potential translations
    cy.contains(/\*? ?Required/).should('be.visible')

    // Target the specific Save button by its aria-label
    cy.get('button[aria-label="Save"]').should('be.disabled')
  })

  it('should allow editing deployment name', () => {
    cy.visit('/deployments/results/1')
    cy.wait(['@getDeployment'])

    const newName = 'Updated_Deployment_Name'
    cy.get('input[aria-label="Name"]').clear().type(newName).blur()
    cy.get('input[aria-label="Name"]').should('have.value', newName)
  })

  it('should toggle enabled checkbox', () => {
    cy.visit('/deployments/results/1')
    cy.wait(['@getDeployment'])

    // Use a more specific selector and force the click if necessary
    cy.get('[aria-label="Enabled?"]').as('enabledCheckbox')

    cy.get('@enabledCheckbox').click({ force: true })
    cy.get('@enabledCheckbox').should('have.attr', 'aria-checked', 'false')

    cy.get('@enabledCheckbox').click({ force: true })
    cy.get('@enabledCheckbox').should('have.attr', 'aria-checked', 'true')
  })

  it('should save changes', () => {
    cy.visit('/deployments/results/1')
    cy.wait(['@getDeployment'])

    cy.get('input[aria-label="Name"]')
      .type('{selectall}{backspace}Updated_Deployment_Name')
      .blur()

    cy.get('button[aria-label="Save"]').should('not.be.disabled').click()

    cy.wait('@updateDeployment')
    cy.contains(/Data has been (changed|added)/).should('be.visible')
  })
})
