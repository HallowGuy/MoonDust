# Keycloak

Ce dossier fournit la configuration necessaire pour executer Keycloak au sein du projet.
Le `Dockerfile` se base sur l'image officielle et importe automatiquement un realm de demonstration nomme `demo`.

## Construction et lancement

```bash
docker build -t moondust-keycloak .
docker run --rm -p 8080:8080 moondust-keycloak
```

Les variables `KEYCLOAK_ADMIN` et `KEYCLOAK_ADMIN_PASSWORD` definissent le compte administrateur cree au demarrage (valeurs par defaut : `admin` / `admin`).

Le realm `demo` definit dans `realm-demo.json` contient un utilisateur `demo` dont le mot de passe est `demo`.
