# MoonDust

This repository provides a basic project skeleton with the following structure:

- `backend/` – placeholder for the backend implementation.
- `frontend/angular/` – Angular application configured with TailwindCSS.
- `module-config/` – configuration files for modules such as Nginx and Keycloak.
- `docker-compose.yml` – orchestrates the services: frontend, backend, Keycloak, PostgreSQL, and Nginx.
- `.env` – environment variables used by the compose file.

Nginx requires users to authenticate through Keycloak before the Angular front-end is served.

Use `docker-compose up` to start the development environment.
