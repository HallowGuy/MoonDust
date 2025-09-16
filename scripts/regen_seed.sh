#!/usr/bin/env bash
set -euo pipefail

# === Paramètres donnés ===
CONTAINER="postgres_db"
DB="moondust"
USER="postgres"
PASS="postgres"
PORT="5432"

INIT_DIR="./db/init"

ts=$(date +%Y%m%d-%H%M%S)
mkdir -p "$INIT_DIR/_backup_$ts"

# Sauvegarde les fichiers actuels si présents
[ -f "$INIT_DIR/001_schema.sql" ] && mv "$INIT_DIR/001_schema.sql" "$INIT_DIR/_backup_$ts/001_schema.sql"
[ -f "$INIT_DIR/002_seed.sql" ] && mv "$INIT_DIR/002_seed.sql" "$INIT_DIR/_backup_$ts/002_seed.sql"

# (Optionnel) rôles/paramètres globaux - sans mots de passe
docker exec -e PGPASSWORD="$PASS" "$CONTAINER" \
  bash -lc "pg_dumpall -U $USER -h localhost -p $PORT --globals-only --no-role-passwords" \
  > "$INIT_DIR/000_globals.sql" || echo '⚠️ Globals dump skipped'

# Schéma complet (tous schémas, extensions, index…)
docker exec -e PGPASSWORD="$PASS" "$CONTAINER" \
  bash -lc "pg_dump -U $USER -h localhost -p $PORT -d $DB --schema-only --no-owner --no-privileges" \
  > "$INIT_DIR/001_schema.sql"

# Données complètes (toutes tables)
docker exec -e PGPASSWORD="$PASS" "$CONTAINER" \
  bash -lc "pg_dump -U $USER -h localhost -p $PORT -d $DB \
            --data-only --inserts --column-inserts \
            --disable-triggers \
            --no-owner --no-privileges" \
  > "$INIT_DIR/002_seed.sql"

echo "✅ Schéma + seed régénérés dans $INIT_DIR"
