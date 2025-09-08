-- 020_keycloak_ssl_none.sql
-- Force le realm master de Keycloak à ne pas exiger SSL (utile en DEV)
-- ATTENTION : à ne pas utiliser tel quel en production

\connect keycloak;

UPDATE realm
SET ssl_required = 'NONE'
WHERE name = 'master';
