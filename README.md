# migasfree-frontend

Migasfree is an application to manage systems. Fundamentally to deploy software to computers in an organization.

This project is the frontend (with [Quasar framework](https://quasar.dev/)).

## License

Migasfree is free software, released under [GNU GPL v3](https://github.com/migasfree/migasfree-frontend/blob/master/LICENSE).

## Install the dependencies

```bash
yarn
```

### Configure server

Create and .env file. You can take the content of file .env.example as a sample.

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
yarn dev
```

### Lint the files

```bash
yarn lint
```

### i18n

```bash
yarn gettext:extract
yarn gettext:compile
```

### Build the app for production

```bash
yarn build
```

## Build docker container (develop purpose)

```bash
docker build -t migasfree-frontend .
docker run -p 3000:3000 migasfree-frontend
```

## Screenshots

### Dashboard (light mode)

![Dashboard](https://github.com/migasfree/migasfree-frontend/blob/master/screenshots/dashboard.png)

### Computers list (dark mode)

![Computers list](https://github.com/migasfree/migasfree-frontend/blob/master/screenshots/computers_list.png)
