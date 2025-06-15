# MoonDust

Structure du projet avec plusieurs services conteneurisés.

## Stack technique

- **Backend** : NestJS (Node + TypeScript)
- **Frontend** : React.js + TypeScript
- **Gestion des droits** : Casbin pour un contrôle fin des accès
- **Dashboarding** : Metabase

## Dossiers

- `frontend` : interface utilisateur.
- `backend` : API backend.
- `modules` : modules ou SDK additionnels.
- `nginx` : proxy Nginx.
- `keycloak` : gestion des identités.
- `metabase` : service de dashboarding.

Chaque dossier contient un `Dockerfile` minimal.

## Lancement

Utiliser `docker-compose` pour démarrer l'ensemble des services :

```bash
docker-compose up --build
```
