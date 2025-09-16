--
-- PostgreSQL database cluster dump
--

\restrict PErcGkhzACg5ieVI85gsP8Wd3WcEt2gl128hp0hRQmnxqNQpDN0JtHD9WW9eJ6y

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE flowable;
ALTER ROLE flowable WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;

--
-- User Configurations
--








\unrestrict PErcGkhzACg5ieVI85gsP8Wd3WcEt2gl128hp0hRQmnxqNQpDN0JtHD9WW9eJ6y

--
-- PostgreSQL database cluster dump complete
--

