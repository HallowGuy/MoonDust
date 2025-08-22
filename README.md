# MoonDust

## Base de données (demo first)

Démarrage de PostgreSQL :

```bash
docker compose up -d postgres
```

Vérification du schéma et des tables :

```bash
psql "postgresql://appuser:apppass@localhost:5432/appdb" -c "SET search_path TO demo_first; \\dt"
```
