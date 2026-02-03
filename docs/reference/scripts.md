# Script Reference

The following `yarn` scripts are available in the project for development, testing, and building.

## Development

| Command        | Description                                                              |
| :------------- | :----------------------------------------------------------------------- |
| `yarn dev`     | Start the app in development mode (hot-code reloading, error reporting). |
| `yarn install` | Install project dependencies.                                            |

## Build

| Command      | Description                                                                         |
| :----------- | :---------------------------------------------------------------------------------- |
| `yarn build` | Build the application for production. Output is generated in the `dist/` directory. |

## Quality & Testing

| Command              | Description                                  |
| :------------------- | :------------------------------------------- |
| `yarn lint`          | Run ESLint to check for code quality issues. |
| `yarn format`        | Run Prettier to format the codebase.         |
| `yarn test`          | Run the test suite using Vitest.             |
| `yarn test:watch`    | Run tests in watch mode.                     |
| `yarn test:coverage` | Run tests and generate a coverage report.    |
| `yarn cypress:open`  | Open Cypress Test Runner.                    |
| `yarn cypress:run`   | Run Cypress tests headless.                  |

## Internationalization (i18n)

| Command                | Description                             |
| :--------------------- | :-------------------------------------- |
| `yarn gettext:extract` | Extract strings marked for translation. |
| `yarn gettext:compile` | Compile translation files.              |
