-- ================================================================
-- 040_create_activepieces_db.sql
-- Initialise la base Activepieces avec rôle dédié
-- ================================================================

-- Création du rôle applicatif Activepieces
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'activepieces'
    ) THEN
        CREATE ROLE activepieces LOGIN PASSWORD 'activepieces';
        COMMENT ON ROLE activepieces IS 'Rôle dédié à l’automatisation Activepieces';
    ELSE
        ALTER ROLE activepieces WITH LOGIN PASSWORD 'activepieces';
    END IF;
END
$$;

-- Création de la base si elle n’existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_database WHERE datname = 'activepieces'
    ) THEN
        CREATE DATABASE activepieces OWNER activepieces;
        COMMENT ON DATABASE activepieces IS 'Base de données utilisée par Activepieces';
    END IF;
END
$$;

-- S’assurer que le propriétaire est bien Activepieces
ALTER DATABASE activepieces OWNER TO activepieces;

-- Sécurité : retirer les droits publics
REVOKE ALL ON DATABASE activepieces FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE activepieces TO activepieces;

-- ================================================================
-- Fin du script
-- ================================================================
