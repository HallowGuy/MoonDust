# Dockerfile pour le dossier Keycloak
# Fournit un environnement Keycloak de developpement avec import automatique du realm "demo"

# Utilisation de l'image officielle Keycloak
FROM quay.io/keycloak/keycloak:24.0

# Variables d'environnement pour l'administrateur
ENV KEYCLOAK_ADMIN=admin \
    KEYCLOAK_ADMIN_PASSWORD=admin

WORKDIR /opt/keycloak

# Copie du fichier de configuration du realm
COPY realm-demo.json /opt/keycloak/data/import/realm-demo.json

# Lancement de Keycloak en mode developpement avec import du realm
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--import-realm"]

# Fin du Dockerfile Keycloak
