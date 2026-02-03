# How to Contribute

Thank you for your interest in improving `migasfree-frontend`! This guide covers the process for submitting quality contributions.

## Development Workflow

1. **Fork the repository** and create your feature branch from `master`.
2. **Follow the Setup Guide**: Refer to [Getting Started](../tutorials/getting-started.md) to set up your environment.

## Code Quality

We use **ESLint** and **Prettier** to maintain code consistency.

- **Lint code**:

  ```bash
  yarn lint
  ```

- **Format code**:

  ```bash
  yarn format
  ```

## Testing

We use **Vitest** for unit and component testing.

- **Run tests**:

  ```bash
  yarn test
  ```

- **Watch mode**:

  ```bash
  yarn test:watch
  ```

- **Check coverage**:

  ```bash
  yarn test:coverage
  ```

**Requirement**: Please ensure all tests pass before submitting a Pull Request. If you add new features, please include relevant tests.

## Pull Request Process

1. Ensure your code adheres to the style guidelines (`yarn lint`).
2. Verify that all tests pass (`yarn test`).
3. Submit your Pull Request with a clear description of the changes.

## License

By contributing, you agree that your contributions will be licensed under its [GPLv3 License](../../LICENSE).
