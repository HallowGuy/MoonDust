# MoonDust

MoonDust is a modular development stack featuring a reverse-proxy architecture that integrates **Keycloak** (for authentication), **PostgreSQL** (as the persistence layer), and **NGINX** (as the frontend gateway and static file server). It provides a production-leaning, developer-friendly environment with minimal assumptions and clear separation of concerns.

---

## 📁 Project Structure

.
├── module-config/
│ ├── nginx/ # NGINX configuration files
│ └── keycloak/ # Keycloak realm definitions and bootstrap files
├── frontend/
│ └── html/static-html/ # Static files served by NGINX (including custom error pages)
├── docker-compose.yml # Orchestration for Keycloak, PostgreSQL, and NGINX
├── .env # Centralized configuration for ports, DB credentials, etc.
└── README.md # This documentation

---

## 🚀 Getting Started

To launch the full stack in development mode:

```bash
docker-compose up --build
Ensure you have Docker and Docker Compose installed. The .env file must be configured prior to launch.

🔐 Authentication Flow
NGINX serves all static content and proxies authentication-related traffic to Keycloak under the relative path /keycloak/.

All user requests requiring authentication are redirected to Keycloak’s /realms/... endpoints.

Once authenticated, users are redirected back to NGINX-managed routes or frontend content.

This decoupling ensures NGINX can operate independently, but still enforces authentication via Keycloak once the latter is available.

📦 Services Overview
Service	Description
PostgreSQL	Persistent storage for Keycloak and other application modules
Keycloak	Identity and access management system running on port ${KEYCLOAK_PORT}
NGINX	Static content delivery and reverse proxy gateway on port ${NGINX_PORT}

Each service runs in its own container and communicates over the moondust internal bridge network.

🔄 Keycloak Realm Import
The keycloak service automatically imports the realm defined in:

module-config/keycloak/example-realm.json
This realm includes:

A sample client: example-client

Default settings appropriate for development

Paths mapped under /keycloak/ to ensure compatibility behind the NGINX reverse proxy

Feel free to replace this file with your own exported realm definitions.

🎨 Custom Error Pages
NGINX is configured to serve friendly error pages for:

400 Bad Request

404 Not Found

500 Internal Server Error

These pages are located under:


frontend/html/static-html/
Error interception is enabled so users are not exposed to raw upstream errors from Keycloak or other services. You can freely customize these pages to align with your brand or product messaging.

🛠 Configuration via .env
The environment variables used across the stack are managed in .env for convenience and separation of secrets. Examples include:


NGINX_PORT=80
KEYCLOAK_PORT=8081
POSTGRES_DB=moondust
POSTGRES_USER=moondust
KC_BOOTSTRAP_ADMIN_USERNAME=admin
KC_BOOTSTRAP_ADMIN_PASSWORD=admin
Be sure to change default passwords in any production or public environment.

✅ Production Considerations
While this stack is optimized for developer productivity, here are a few steps to harden it for production:

Replace the Keycloak development mode (start-dev) with start and a prebuilt image.

Use KC_HOSTNAME, KC_HTTP_RELATIVE_PATH, and KC_PROXY=edge to configure reverse proxy behavior explicitly.

Secure admin credentials using Docker secrets or environment vaults.

Enable HTTPS via NGINX with Let's Encrypt or custom TLS certificates.

Externalize Keycloak’s database if high availability or clustering is required.

📞 Support & Contributions
For issues, suggestions, or contributions, please contact the maintainers or open a pull request.

Best regards,
MoonDust Maintainers

yaml
Copier
Modifier
