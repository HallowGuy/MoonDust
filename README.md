# MoonDust

Structure du projet avec plusieurs services conteneurisés.

## Dossiers

- `frontend` : interface utilisateur.
- `backend` : API backend.
- `modules` : modules ou SDK additionnels.
- `nginx` : proxy Nginx.
- `keycloak` : gestion des identités.

Chaque dossier contient un `Dockerfile` minimal.

## Lancement

Utiliser `docker-compose` pour démarrer l'ensemble des services :

```bash
docker-compose up --build
```
