#!/bin/sh

# Simple startup script for NGINX.
# The previous version waited for the Keycloak service to be
# available before launching. To make the module independent
# from Keycloak, the waiting logic has been removed.

exec nginx -g 'daemon off;'
