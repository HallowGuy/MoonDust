-- Initialization script for PostgreSQL
-- Creates schemas for administration, application, and Keycloak

CREATE SCHEMA IF NOT EXISTS md_sys;
CREATE SCHEMA IF NOT EXISTS md_app;
CREATE SCHEMA IF NOT EXISTS keycloak;

-- Example application table
CREATE TABLE IF NOT EXISTS md_app.md_task (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
