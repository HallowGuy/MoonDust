-- 020__create__flowable__db.sql
-- Creates the dedicated Flowable database and role inside the shared PostgreSQL instance

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'flowable'
    ) THEN
        CREATE ROLE flowable LOGIN PASSWORD 'flowable';
    ELSE
        ALTER ROLE flowable WITH LOGIN PASSWORD 'flowable';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'flowable'
    ) THEN
        CREATE DATABASE flowable OWNER flowable;
    END IF;
END
$$;

ALTER DATABASE flowable OWNER TO flowable;
GRANT ALL PRIVILEGES ON DATABASE flowable TO flowable;
