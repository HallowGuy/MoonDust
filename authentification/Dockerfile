FROM quay.io/keycloak/keycloak:26.0

# Installe envsubst
USER root
RUN microdnf install -y gettext && microdnf clean all
USER 1000

# Copie les templates
COPY realm-metropole.template.json /opt/keycloak/data/import/
COPY realm-reunion.template.json /opt/keycloak/data/import/

# Substitue et démarre Keycloak
CMD sh -c '\
  envsubst < /opt/keycloak/data/import/realm-metropole.template.json > /opt/keycloak/data/import/realm-metropole.json && \
  envsubst < /opt/keycloak/data/import/realm-reunion.template.json > /opt/keycloak/data/import/realm-reunion.json && \
  /opt/keycloak/bin/kc.sh start-dev --import-realm'
