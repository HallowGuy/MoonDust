# MoonDust

MoonDust est une stack Docker prête à l’emploi pour une appli web front/back pilotée par PostgreSQL, avec outils de dev et automatisation low‑code.

## Composants

- Backend: Node.js/Express (port conteneur `5001`) − API REST, envoi d’emails, upload de fichiers (`/uploads`).
- Frontend: React + Vite, servi par Nginx (port conteneur `80`). Le front consomme l’API via la route proxy `/api`.
- PostgreSQL: base de données (image `postgres:15`) avec scripts d’init dans `db/init/`.
- PgAdmin: console d’administration PostgreSQL.
- Redis: file d’attente et cache pour Activepieces.
- Activepieces: automatisation no‑code auto‑hébergée (UI/API sur port `80` dans le conteneur).

## Ports par défaut (hôte)

- Backend: `BACKEND_PORT_HOST=5001`
- Frontend: `FRONTEND_PORT_HOST=3002`
- PostgreSQL: `DB_PORT_HOST=5432`
- PgAdmin: `PGADMIN_PORT_HOST=5050`
- Activepieces: `AP_PORT_HOST=8080`

## Configuration

- Variables d’environnement: `.env` (identique à `.env.example`).
  - Frontend: par défaut, l’API est appelée via `/api` (proxy Nginx vers le backend). Pour figer une URL, renseigner `VITE_API_URL` au build.
  - Activepieces: nécessite `AP_ENCRYPTION_KEY` (32 hex). Une valeur de dev valide est fournie; changez‑la en production.
  - Mots de passe: valeurs de dev prêtes à l’emploi; à changer en prod.

## Démarrage rapide

1) `.env` est déjà prêt (sinon: `cp .env.example .env`).
2) Builder et démarrer tous les services:

```
docker compose up -d --build
```

3) Accéder:
- Frontend: http://localhost:3002
- Backend (API): http://localhost:5001 (ou via le front sur `/api`)
- PgAdmin: http://localhost:5050 (identifiants dans `.env`)
- Activepieces: http://localhost:8080

## Développement

- Base API côté front: `/api` (voir `frontend/nginx.conf` → proxy vers `backend:5001`).
- Uploads persistants: volume `uploads_data` monté sur `/usr/src/app/uploads` (backend).
- Healthchecks:
  - Backend: `GET /health` (interne au conteneur pour Compose)
  - Frontend/Activepieces: checks HTTP basiques

## Scripts d’init DB

- `db/init/*.sql` s’exécutent au premier démarrage (volume PostgreSQL vierge).
- Remise à zéro: `docker compose down -v` puis relancer.

## Commandes utiles

- Logs: `docker compose logs -f`
- Logs d’un service: `docker compose logs -f backend`
- Rebuild ciblé: `docker compose build frontend`

## Sécurité & production

- Remplacer tous les secrets (`AP_ENCRYPTION_KEY`, `AP_JWT_SECRET`, mots de passe Postgres/PgAdmin).
- Épingler les versions d’images si nécessaire et mettre en place des sauvegardes PostgreSQL.

