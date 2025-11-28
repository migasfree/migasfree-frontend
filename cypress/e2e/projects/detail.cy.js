describe('Project Detail Page', () => {
  beforeEach(() => {
    cy.login('admin', 'admin')

    // Mock API responses
    cy.intercept('GET', '/api/v1/token/projects/1/', {
      id: 1,
      name: 'Test_Project',
      auto_register_computers: false,
      platform: { id: 1, name: 'Platform_1' },
      pms: 'apt',
      architecture: 'amd64',
      base_os: 'Linux',
    }).as('getProject')

    cy.intercept('GET', '/api/v1/token/platforms/', {
      results: [
        { id: 1, name: 'Platform_1' },
        { id: 2, name: 'Platform_2' },
      ],
    }).as('getPlatforms')

    cy.intercept('GET', '/api/v1/public/pms/', {
      apt: { module: 'apt', architectures: ['amd64', 'i386'] },
      yum: { module: 'yum', architectures: ['x86_64'] },
    }).as('getPms')

    cy.intercept('GET', '/api/v1/token/stores/?project__id=1', {
      count: 0,
      results: [],
    }).as('getStores')

    cy.intercept('GET', '/api/v1/token/deployments/?project__id=1', {
      count: 0,
      results: [],
    }).as('getDeployments')

    cy.intercept('POST', '/api/v1/token/stores/', {
      id: 100,
      name: 'org',
    }).as('createStore')

    cy.intercept('POST', '/api/v1/token/deployments/', {
      id: 200,
      name: 'org',
    }).as('createDeployment')

    cy.intercept('PATCH', '/api/v1/token/projects/1/', {
      id: 1,
      name: 'Updated_Project_Name',
    }).as('updateProject')
  })

  it('should load the project detail page', () => {
    cy.visit('/projects/results/1')
    cy.wait([
      '@getProject',
      '@getPlatforms',
      '@getPms',
      '@getStores',
      '@getDeployments',
    ])

    cy.contains('Test_Project').should('be.visible')
    cy.get('input[aria-label="Name"]').should('have.value', 'Test_Project')
  })

  it('should validate required fields', () => {
    cy.visit('/projects/results/1')
    cy.wait(['@getProject'])

    cy.get('input[aria-label="Name"]').clear().blur()
    cy.contains('Required').should('be.visible')

    // Save button should be disabled (or at least validation visible)
    // The UI disables buttons if !isValid
    cy.get('button[aria-label="Save"]').should('be.disabled')
  })

  it('should create default stores', () => {
    cy.visit('/projects/results/1')
    cy.wait(['@getProject', '@getStores'])

    // Find the button to create default stores.
    // It has a tooltip "Create default stores"
    // We can target by aria-label if available or icon

    // In the template: :aria-label="$gettext('Create default stores')"
    cy.get('button[aria-label="Create default stores"]').click()

    cy.wait('@createStore')
    cy.contains('Data has been added!').should('be.visible')
  })

  it('should create default deployments', () => {
    cy.visit('/projects/results/1')
    cy.wait(['@getProject', '@getDeployments'])

    // In the template: :aria-label="$gettext('Create default deployments')"
    cy.get('button[aria-label="Create default deployments"]').click()

    cy.wait('@createDeployment')
    cy.contains('Data has been added!').should('be.visible')
  })

  it('should save changes', () => {
    cy.visit('/projects/results/1')
    cy.wait(['@getProject'])

    cy.get('input[aria-label="Name"]')
      .clear()
      .type('Updated_Project_Name')
      .blur()
    cy.get('button[aria-label="Save"]').click()

    cy.wait('@updateProject')
    cy.contains('Data has been changed!').should('be.visible')
  })
})
