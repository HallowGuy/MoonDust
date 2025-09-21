-- ==================================================
-- 000__global.sql
-- Global initialisation script for PostgreSQL cluster
-- Applied only on first initialisation of the DB
-- ==================================================

-- Always ensure UTF8 and safe string handling
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- ============================================
-- Create commonly used extensions (idempotent)
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- for hashing / encryption
CREATE EXTENSION IF NOT EXISTS citext;        -- case-insensitive text

-- ============================================
-- Global roles (not application-specific)
-- ============================================
-- Example of a read-only role for future needs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly') THEN
        CREATE ROLE readonly;
        COMMENT ON ROLE readonly IS 'Generic role for read-only access, to be granted to selected users';
    END IF;
END
$$;

-- Example of an auditor role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'auditor') THEN
        CREATE ROLE auditor;
        COMMENT ON ROLE auditor IS 'Role reserved for audit queries';
    END IF;
END
$$;

-- ==================================================
-- End of global.sql
-- ==================================================
