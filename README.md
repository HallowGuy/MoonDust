# MoonDust

This repository provides a basic project skeleton with the following structure:

- `module-config/` – configuration files for modules such as Nginx and Keycloak.
- `docker-compose.yml` – orchestrates the services: Keycloak, PostgreSQL, and Nginx.
- `.env` – environment variables used by the compose file.

Nginx requires users to authenticate through Keycloak before serving content.

Use `docker-compose up` to start the development environment.
