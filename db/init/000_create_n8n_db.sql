-- 000_create_n8n_db.sql
CREATE DATABASE n8n
  WITH 
  OWNER = postgres
  ENCODING = 'UTF8'
  LC_COLLATE = 'en_US.utf8'
  LC_CTYPE = 'en_US.utf8'
  TEMPLATE template0;
