describe('Deployment Detail Page', () => {
  beforeEach(() => {
    cy.login('admin', 'admin')

    // Mock API responses
    cy.intercept('GET', '/api/v1/token/deployments/1/', {
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

    cy.intercept('GET', '/api/v1/token/projects/', {
      results: [
        { id: 1, name: 'Test_Project' },
        { id: 2, name: 'Another_Project' },
      ],
    }).as('getProjects')

    cy.intercept('GET', '/api/v1/token/domains/', {
      results: [
        { id: 1, name: 'Test_Domain' },
        { id: 2, name: 'Another_Domain' },
      ],
    }).as('getDomains')

    cy.intercept('GET', '/api/v1/token/schedules/', {
      results: [
        { id: 1, name: 'Test_Schedule' },
        { id: 2, name: 'Another_Schedule' },
      ],
    }).as('getSchedules')

    cy.intercept('GET', '/api/v1/token/stats/deployments/1/timeline/', {
      computers: { error: 0, ok: 0 },
      schedule: null,
    }).as('getTimeline')

    cy.intercept('PATCH', '/api/v1/token/deployments/1/', {
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

    // Check for main sections
    cy.contains('General').should('be.visible')
    cy.contains('To who (attributes)').should('be.visible')
    cy.contains('What (packages)').should('be.visible')
    cy.contains('Actions').should('be.visible')
    cy.contains('When (schedule)').should('be.visible')
  })

  it('should validate required fields', () => {
    cy.visit('/deployments/results/1')
    cy.wait(['@getDeployment'])

    cy.get('input[aria-label="Name"]').clear().blur()
    cy.contains('Required').should('be.visible')

    // Save button should be disabled when validation fails
    cy.get('button[aria-label="Save"]').should('be.disabled')
  })

  it('should allow editing deployment name', () => {
    cy.visit('/deployments/results/1')
    cy.wait(['@getDeployment'])

    cy.get('input[aria-label="Name"]')
      .clear()
      .type('Updated_Deployment_Name')
      .blur()
    cy.get('input[aria-label="Name"]').should(
      'have.value',
      'Updated_Deployment_Name',
    )
  })

  it('should toggle enabled checkbox', () => {
    cy.visit('/deployments/results/1')
    cy.wait(['@getDeployment'])

    // The enabled checkbox should be checked initially (enabled: true in mock)
    // Quasar checkboxes set aria-checked attribute
    cy.get('[aria-label="Enabled?"]').should(
      'have.attr',
      'aria-checked',
      'true',
    )

    // Click to uncheck
    cy.get('[aria-label="Enabled?"]').click()
    cy.get('[aria-label="Enabled?"]').should(
      'have.attr',
      'aria-checked',
      'false',
    )
  })

  it('should save changes', () => {
    cy.visit('/deployments/results/1')
    cy.wait(['@getDeployment'])

    cy.get('input[aria-label="Name"]')
      .clear()
      .type('Updated_Deployment_Name')
      .blur()
    cy.get('button[aria-label="Save"]').click()

    cy.wait('@updateDeployment')
    cy.contains('Data has been changed!').should('be.visible')
  })
})
