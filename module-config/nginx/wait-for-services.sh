#!/bin/sh

# Wait for a host:port to be reachable
wait_for() {
  host="$1"
  port="$2"
  echo "Waiting for $host:$port..."

  while ! nc -z "$host" "$port" >/dev/null 2>&1; do
    sleep 2
  done

  echo "$host:$port is available."
}

# Wait for Keycloak
wait_for keycloak 8080

# Start NGINX
exec nginx -g 'daemon off;'
