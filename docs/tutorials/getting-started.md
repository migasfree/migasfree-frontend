# Getting Started with Migasfree Frontend

This tutorial will guide you through setting up the `migasfree-frontend` development environment on your local machine.

## Prerequisites

- **Node.js**: Version 20.19.0 or higher.
- **Yarn**: We use Yarn as our package manager.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/migasfree/migasfree-frontend.git
   cd migasfree-frontend
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **Configure Environment**:

   Create a `.env` file in the root directory. You can use `.env.example` as a template.

   ```bash
   cp .env.example .env
   ```

## Running the Application

### Development Mode

To start the development server with hot-reload, error reporting, and more:

```bash
yarn dev
```

The application will be available at `http://localhost:3002` (or the specific port shown in your terminal).

### Docker (Optional)

If you prefer to run the application using Docker:

```bash
docker build -t migasfree-frontend .
docker run -p 3000:3000 migasfree-frontend
```
