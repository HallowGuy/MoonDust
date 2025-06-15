#!/bin/sh

# Wait for Keycloak to be available on host `keycloak` and port `8080`.
echo "Waiting for Keycloak to become available at keycloak:8080..."

until nc -z keycloak 8080; do
  echo "Keycloak is unavailable - sleeping"
  sleep 2
done

echo "Keycloak is up - starting NGINX"
exec nginx -g 'daemon off;'
