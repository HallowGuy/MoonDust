#!/bin/bash
set -e

echo "⏳ Patch du realm master (ssl_required=NONE)..."
docker exec -i postgres_db \
  psql -U "${KEYCLOAK_DB_USER}" -d "${KEYCLOAK_DB_NAME}" \
  -c "UPDATE realm SET ssl_required='NONE' WHERE name='master';"

echo "🔄 Redémarrage de Keycloak..."
docker compose restart keycloak

echo "✅ Patch appliqué et Keycloak redémarré."
