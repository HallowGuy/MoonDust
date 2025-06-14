# MoonDust

This repository provides a basic project skeleton with the following structure:

- `module-config/` – configuration files for modules such as Nginx and Keycloak.
- `docker-compose.yml` – orchestrates the services: Keycloak, PostgreSQL, and Nginx.
- `.env` – environment variables used by the compose file.

Each service can start independently. Nginx still redirects users to Keycloak
for authentication before serving content, but it no longer waits for Keycloak
to be available at startup. Keycloak continues to rely on PostgreSQL for its
database.

## Keycloak Realm Import

The `keycloak` service automatically imports the example realm defined in
`module-config/keycloak/example-realm.json`. The realm contains a sample client
named `example-client` used by the Nginx configuration for authentication.

## Friendly Error Pages

Nginx serves custom pages for `400`, `404`, and `500` errors from the
`static-html` directory and intercepts upstream errors as well. Requests are
redirected to Keycloak using a relative `/realms/...` path so the configuration
works regardless of the external host name. Feel free to modify these pages to
fit your branding.

Use `docker-compose up` to start the development environment.
