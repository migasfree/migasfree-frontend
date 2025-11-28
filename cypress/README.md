# Cypress E2E Testing

This project uses Cypress for end-to-end (E2E) testing.

## Running Tests

### Interactive Mode (Development)

```bash
yarn cypress:open
```

This opens the Cypress Test Runner where you can select and run tests interactively with live reloading.

### Headless Mode (CI)

```bash
yarn cypress:run
```

This runs all tests in headless mode, suitable for continuous integration environments.

## File Structure

```
cypress/
├── e2e/                          # E2E test files
│   ├── deployments/
│   │   └── detail.cy.js         # Deployment detail page tests
│   └── projects/
│       └── detail.cy.js         # Project detail page tests
└── support/                      # Commands and configuration
    ├── commands.js               # Custom commands
    └── e2e.js                   # Global configuration
```

## Custom Commands

### Login

Authenticates a user and creates a session. The language is automatically set to English for consistent test expectations.

```javascript
cy.login('admin', 'admin')
```

### Mock API Call

```javascript
cy.mockApiCall('GET', '/api/v1/token/deployments/1', response)
```

## Writing Tests

E2E tests should follow the AAA (Arrange, Act, Assert) pattern and use proper API mocking:

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.login('admin', 'admin')

    // Mock API responses
    cy.intercept('GET', '/api/v1/token/resource/1/', {
      id: 1,
      name: 'Test_Resource',
    }).as('getResource')
  })

  it('should do something', () => {
    // Arrange
    cy.visit('/resource/results/1')
    cy.wait(['@getResource'])

    // Act
    cy.get('input[aria-label="Name"]').clear().type('New_Name').blur()

    // Assert
    cy.get('input[aria-label="Name"]').should('have.value', 'New_Name')
  })
})
```

## Best Practices

1. **Use aria-label selectors**: Target elements by `aria-label` attributes for better accessibility and stability

   ```javascript
   cy.get('[aria-label="Name"]')
   ```

2. **Always use @ prefix for aliases**: When using `cy.wait()`, reference aliases with `@`

   ```javascript
   cy.intercept('GET', '/api/endpoint').as('getEndpoint')
   cy.wait('@getEndpoint') // ✅ Correct
   cy.wait('getEndpoint') // ❌ Wrong
   ```

3. **Trigger validation with .blur()**: After clearing or typing in inputs, call `.blur()` to trigger validation

   ```javascript
   cy.get('input[aria-label="Name"]').clear().blur()
   ```

4. **Use underscores in test data**: Avoid spaces in mock data to prevent issues with text matching

   ```javascript
   {
     name: 'Test_Project'
   } // ✅ Correct
   {
     name: 'Test Project'
   } // ❌ Avoid
   ```

5. **Mock all API calls**: Use `cy.intercept()` to mock all API endpoints your test depends on

   ```javascript
   cy.intercept('GET', '/api/v1/token/projects/', {
     results: [{ id: 1, name: 'Test_Project' }],
   }).as('getProjects')
   ```

6. **Clean state between tests**: Use `beforeEach()` to reset state and set up mocks

   ```javascript
   beforeEach(() => {
     cy.login('admin', 'admin')
     // Set up all necessary mocks
   })
   ```

7. **Test Quasar components correctly**:
   - For checkboxes, use `aria-checked` attribute instead of CSS classes
   ```javascript
   cy.get('[aria-label="Enabled?"]').should('have.attr', 'aria-checked', 'true')
   ```

## Language Configuration

All Cypress tests run with the application language set to English (`en_US`). This is automatically configured in the `login` command to ensure consistent test expectations across different environments.

## Common Patterns

### Testing Form Validation

```javascript
it('should validate required fields', () => {
  cy.visit('/resource/results/1')
  cy.wait(['@getResource'])

  cy.get('input[aria-label="Name"]').clear().blur()
  cy.contains('Required').should('be.visible')
  cy.get('button[aria-label="Save"]').should('be.disabled')
})
```

### Testing Checkbox Toggle

```javascript
it('should toggle checkbox', () => {
  cy.visit('/resource/results/1')
  cy.wait(['@getResource'])

  cy.get('[aria-label="Enabled?"]').should('have.attr', 'aria-checked', 'true')
  cy.get('[aria-label="Enabled?"]').click()
  cy.get('[aria-label="Enabled?"]').should('have.attr', 'aria-checked', 'false')
})
```

### Testing Save Operation

```javascript
it('should save changes', () => {
  cy.intercept('PATCH', '/api/v1/token/resource/1/', {
    id: 1,
    name: 'Updated_Name',
  }).as('updateResource')

  cy.visit('/resource/results/1')
  cy.wait(['@getResource'])

  cy.get('input[aria-label="Name"]').clear().type('Updated_Name').blur()
  cy.get('button[aria-label="Save"]').click()

  cy.wait('@updateResource')
  cy.contains('Data has been changed!').should('be.visible')
})
```
