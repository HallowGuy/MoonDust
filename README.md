# MoonDust

This repository provides a basic project skeleton with the following structure:

- `backend/` – minimal Express backend exposing a small API.
- `frontend/angular/` – simple Node frontend serving static HTML.
- `module-config/` – configuration files for modules such as Nginx and Keycloak.
- `docker-compose.yml` – orchestrates the services: frontend, backend, Keycloak, PostgreSQL, and Nginx.
- `.env` – environment variables used by the compose file.

Nginx requires users to authenticate through Keycloak before the frontend is served.

Use `docker-compose up` to start the development environment.
