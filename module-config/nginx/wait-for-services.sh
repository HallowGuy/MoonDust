#!/bin/sh

# wait for dependent services to be reachable before starting Nginx
wait_for() {
  host="$1"
  port="$2"
  echo "Waiting for $host:$port..."
  until bash -c '</dev/tcp/$host/$port' 2>/dev/null; do
    sleep 2
  done
}

wait_for frontend 4200
wait_for backend 8080
wait_for keycloak 8080

exec nginx -g 'daemon off;'
