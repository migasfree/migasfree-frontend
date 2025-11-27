# Contributing to Migasfree Frontend

Thank you for your interest in contributing to Migasfree Frontend! We welcome contributions from the community to help improve this project.

## Getting Started

### Prerequisites

- **Node.js**: Version 20.19.0 or higher.
- **Yarn**: We use Yarn as our package manager.

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/migasfree/migasfree-frontend.git
    cd migasfree-frontend
    ```

2.  **Install dependencies**:

    ```bash
    yarn install
    ```

3.  **Configure Environment**:

    Create a `.env` file in the root directory. You can use `.env.example` as a reference.

## Development

To start the development server with hot-reload:

```bash
yarn dev
```

The application will be available at `http://localhost:3002` (or the port specified in your console).

## Testing

We use **Vitest** for unit and component testing.

- **Run tests**:

  ```bash
  yarn test
  ```

- **Run tests in watch mode**:

  ```bash
  yarn test:watch
  ```

- **Check coverage**:
  ```bash
  yarn test:coverage
  ```

Please ensure all tests pass before submitting a Pull Request. If you add new features, please include relevant tests.

## Code Quality

We use **ESLint** and **Prettier** to maintain code quality and consistency.

- **Lint code**:

  ```bash
  yarn lint
  ```

- **Format code**:
  ```bash
  yarn format
  ```

## Pull Request Process

1.  Fork the repository and create your branch from `master`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes.
4.  Make sure your code lints.
5.  Issue that pull request!

## License

By contributing, you agree that your contributions will be licensed under its [GPLv3 License](LICENSE).
