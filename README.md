# MoonDust

This repository provides a basic project skeleton with the following structure:

- `module-config/` – configuration files for modules such as Nginx and Keycloak.
- `docker-compose.yml` – orchestrates the services: Keycloak, PostgreSQL, and Nginx.
- `.env` – environment variables used by the compose file.

Each service can start independently. Nginx still redirects users to Keycloak
for authentication before serving content, but it no longer waits for Keycloak
to be available at startup. Keycloak continues to rely on PostgreSQL for its
database.

Use `docker-compose up` to start the development environment.
