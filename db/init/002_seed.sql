--
-- PostgreSQL database dump
--

\restrict i07KdNcya4GNCX5o6Lwil65ny2LWhSKpZaCFwjt0DFtMu1gffYQUdjofML4gRP9

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: entreprises; Type: TABLE DATA; Schema: demo_first; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE demo_first.entreprises DISABLE TRIGGER ALL;

INSERT INTO demo_first.entreprises (id, nom, secteur, adresse, telephone, email, site_web, created_at) VALUES (1, 'eaze', 'ezae', 'zea', 'eaze', 'toto@toto.fr', 'toto.fr', '2025-09-08 10:56:27.282062');


ALTER TABLE demo_first.entreprises ENABLE TRIGGER ALL;

--
-- Data for Name: contacts; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.contacts DISABLE TRIGGER ALL;

INSERT INTO demo_first.contacts (id, entreprise_id, created_at, last_interaction, form_data) VALUES (2, NULL, '2025-09-11 15:34:01.162712', NULL, '{"nom": "Delorme Ma", "tags": "Mr", "email": "toto@toto.com", "notes": "aze", "poste": "avv", "prenom": "Maxime", "source": "Leadeo", "statut": "A faire", "adresse": "", "civilite": "Mr", "reponse1": "reponse1", "telephone": "(123) 456-8797", "textField": "ttttttt", "entreprise": 1}');
INSERT INTO demo_first.contacts (id, entreprise_id, created_at, last_interaction, form_data) VALUES (3, NULL, '2025-09-15 08:05:49.469853', NULL, '{"nom": "aaa", "tags": "Mr", "email": "aaa@aaa.fr", "notes": "", "poste": "", "prenom": "aaabbbb", "source": "Leadeo", "statut": "A faire", "adresse": "", "civilite": "Mr", "reponse1": "", "telephone": "", "entreprise": 1}');


ALTER TABLE demo_first.contacts ENABLE TRIGGER ALL;

--
-- Data for Name: projets; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.projets DISABLE TRIGGER ALL;



ALTER TABLE demo_first.projets ENABLE TRIGGER ALL;

--
-- Data for Name: activites; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.activites DISABLE TRIGGER ALL;

INSERT INTO demo_first.activites (id, type, description, date, contact_id, projet_id, utilisateur, utilisateur_id) VALUES (1, 'appel', 'eazezae', '2025-09-09 03:49:34.370016', NULL, NULL, 'Maxime', NULL);
INSERT INTO demo_first.activites (id, type, description, date, contact_id, projet_id, utilisateur, utilisateur_id) VALUES (2, 'email', 'eaze', '2025-09-09 03:58:40.538067', NULL, NULL, 'inconnu', NULL);
INSERT INTO demo_first.activites (id, type, description, date, contact_id, projet_id, utilisateur, utilisateur_id) VALUES (3, 'appel', 'aaaaaa', '2025-09-09 03:59:22.620073', NULL, NULL, 'inconnu', NULL);
INSERT INTO demo_first.activites (id, type, description, date, contact_id, projet_id, utilisateur, utilisateur_id) VALUES (4, 'appel', 'dddddd', '2025-09-09 04:31:16.72323', NULL, NULL, NULL, '90950675-423e-4b77-8678-f0f755a5b91e');
INSERT INTO demo_first.activites (id, type, description, date, contact_id, projet_id, utilisateur, utilisateur_id) VALUES (5, 'appel', 'tototo', '2025-09-09 13:45:44.562448', NULL, NULL, NULL, '90950675-423e-4b77-8678-f0f755a5b91e');
INSERT INTO demo_first.activites (id, type, description, date, contact_id, projet_id, utilisateur, utilisateur_id) VALUES (6, 'appel', 'aaaaaaaa', '2025-09-10 06:12:35.750892', NULL, NULL, NULL, '90950675-423e-4b77-8678-f0f755a5b91e');
INSERT INTO demo_first.activites (id, type, description, date, contact_id, projet_id, utilisateur, utilisateur_id) VALUES (7, 'email', 'zzzzzzz', '2025-09-10 06:15:47.645384', NULL, NULL, 'reunion.user', '90950675-423e-4b77-8678-f0f755a5b91e');
INSERT INTO demo_first.activites (id, type, description, date, contact_id, projet_id, utilisateur, utilisateur_id) VALUES (8, 'appel', 'bbbbbbb', '2025-09-10 06:18:05.399713', NULL, NULL, NULL, '90950675-423e-4b77-8678-f0f755a5b91e');
INSERT INTO demo_first.activites (id, type, description, date, contact_id, projet_id, utilisateur, utilisateur_id) VALUES (9, 'appel', 'titi', '2025-09-10 09:08:22.978182', NULL, NULL, NULL, '90950675-423e-4b77-8678-f0f755a5b91e');


ALTER TABLE demo_first.activites ENABLE TRIGGER ALL;

--
-- Data for Name: users; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.users DISABLE TRIGGER ALL;

INSERT INTO demo_first.users (id, username, email, display_name, is_active, created_at, updated_at) VALUES (1, 'alice', 'alice@example.com', 'Alice Example', true, '2025-09-05 09:59:25.911058+00', '2025-09-05 09:59:25.911058+00');
INSERT INTO demo_first.users (id, username, email, display_name, is_active, created_at, updated_at) VALUES (2, 'bob', 'bob@example.com', 'Bob Example', true, '2025-09-05 09:59:25.911058+00', '2025-09-05 09:59:25.911058+00');
INSERT INTO demo_first.users (id, username, email, display_name, is_active, created_at, updated_at) VALUES (3, 'carol', 'carol@example.com', 'Carol Example', true, '2025-09-05 09:59:25.911058+00', '2025-09-05 09:59:25.911058+00');


ALTER TABLE demo_first.users ENABLE TRIGGER ALL;

--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.audit_log DISABLE TRIGGER ALL;

INSERT INTO demo_first.audit_log (id, actor_user_id, entity_type, entity_id, action, meta, occurred_at) VALUES (1, 1, 'DOCUMENT', 1, 'CREATE_DOCUMENT', NULL, '2025-09-05 09:59:25.919544+00');
INSERT INTO demo_first.audit_log (id, actor_user_id, entity_type, entity_id, action, meta, occurred_at) VALUES (2, 1, 'DOCUMENT', 1, 'UPLOAD_VERSION', '{"version": 1}', '2025-09-05 09:59:25.919544+00');
INSERT INTO demo_first.audit_log (id, actor_user_id, entity_type, entity_id, action, meta, occurred_at) VALUES (3, 2, 'DOCUMENT', 2, 'CREATE_DOCUMENT', NULL, '2025-09-05 09:59:25.919544+00');
INSERT INTO demo_first.audit_log (id, actor_user_id, entity_type, entity_id, action, meta, occurred_at) VALUES (4, 2, 'DOCUMENT', 2, 'UPLOAD_VERSION', '{"version": 1}', '2025-09-05 09:59:25.919544+00');
INSERT INTO demo_first.audit_log (id, actor_user_id, entity_type, entity_id, action, meta, occurred_at) VALUES (5, 3, 'DOCUMENT', 3, 'TAG_ADD', '{"tag": "contract"}', '2025-09-05 09:59:25.919544+00');


ALTER TABLE demo_first.audit_log ENABLE TRIGGER ALL;

--
-- Data for Name: contact_old; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.contact_old DISABLE TRIGGER ALL;

INSERT INTO demo_first.contact_old (id, entreprise_id, prenom, nom, email, telephone, poste, created_at, civilite, mobile, adresse, ville, pays, tags, source, statut, notes, last_interaction, form_data) VALUES (1, 1, 'Romainezaea', 'DELORME TEST ', 'toto@toto.com', '065788745', 'DG', '2025-09-08 10:47:30.545586', '33', NULL, '10 Rue des Rouges Gorges 89470 Monéteau', 'Monéteau', 'France', '{VIP}', 'Web', '38', NULL, NULL, '{"nom": "DELORME", "tags": "Tag 2", "email": "toto@toto.fr", "notes": "", "poste": "avv", "number": 222222, "prenom": "Maxime", "source": "Leadeo", "statut": "A faire", "adresse": "10 rue de la paix", "civilite": "Mr", "telephone": "(123) 456-7891", "textField": "Text field", "entreprise": "entrepriseA"}');


ALTER TABLE demo_first.contact_old ENABLE TRIGGER ALL;

--
-- Data for Name: contact_projet; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.contact_projet DISABLE TRIGGER ALL;



ALTER TABLE demo_first.contact_projet ENABLE TRIGGER ALL;

--
-- Data for Name: tags; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.tags DISABLE TRIGGER ALL;

INSERT INTO demo_first.tags (id, name, created_at) VALUES (1, 'contract', '2025-09-05 09:59:25.917976+00');
INSERT INTO demo_first.tags (id, name, created_at) VALUES (2, 'invoice', '2025-09-05 09:59:25.917976+00');
INSERT INTO demo_first.tags (id, name, created_at) VALUES (3, 'spec', '2025-09-05 09:59:25.917976+00');


ALTER TABLE demo_first.tags ENABLE TRIGGER ALL;

--
-- Data for Name: contact_tags; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.contact_tags DISABLE TRIGGER ALL;



ALTER TABLE demo_first.contact_tags ENABLE TRIGGER ALL;

--
-- Data for Name: conversations; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.conversations DISABLE TRIGGER ALL;

INSERT INTO demo_first.conversations (id, is_group, created_at, title) VALUES ('a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', false, '2025-09-05 14:37:10.106233', NULL);
INSERT INTO demo_first.conversations (id, is_group, created_at, title) VALUES ('c2f37734-c107-41b8-9dcf-9c509dc0788f', false, '2025-09-09 15:13:41.749825', NULL);
INSERT INTO demo_first.conversations (id, is_group, created_at, title) VALUES ('ef3b1746-890d-48e8-9086-ff7b268e6b98', true, '2025-09-11 18:15:11.804027', 'Equipe produit');


ALTER TABLE demo_first.conversations ENABLE TRIGGER ALL;

--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.conversation_participants DISABLE TRIGGER ALL;

INSERT INTO demo_first.conversation_participants (conversation_id, user_id) VALUES ('a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '9f7eb43b-539c-4cba-b2a2-0474c390e37f');
INSERT INTO demo_first.conversation_participants (conversation_id, user_id) VALUES ('a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e');
INSERT INTO demo_first.conversation_participants (conversation_id, user_id) VALUES ('c2f37734-c107-41b8-9dcf-9c509dc0788f', '90950675-423e-4b77-8678-f0f755a5b91e');
INSERT INTO demo_first.conversation_participants (conversation_id, user_id) VALUES ('c2f37734-c107-41b8-9dcf-9c509dc0788f', 'd865f0da-6aaf-4d98-9d00-98be91320796');
INSERT INTO demo_first.conversation_participants (conversation_id, user_id) VALUES ('ef3b1746-890d-48e8-9086-ff7b268e6b98', '90950675-423e-4b77-8678-f0f755a5b91e');
INSERT INTO demo_first.conversation_participants (conversation_id, user_id) VALUES ('ef3b1746-890d-48e8-9086-ff7b268e6b98', '9f7eb43b-539c-4cba-b2a2-0474c390e37f');
INSERT INTO demo_first.conversation_participants (conversation_id, user_id) VALUES ('ef3b1746-890d-48e8-9086-ff7b268e6b98', 'd865f0da-6aaf-4d98-9d00-98be91320796');


ALTER TABLE demo_first.conversation_participants ENABLE TRIGGER ALL;

--
-- Data for Name: documents; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.documents DISABLE TRIGGER ALL;

INSERT INTO demo_first.documents (id, owner_user_id, name, extension, size_bytes, mime_type, status, created_at, updated_at) VALUES (1, 1, 'Project Plan', 'docx', 102400, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'PUBLISHED', '2025-09-05 09:59:25.915983+00', '2025-09-05 09:59:25.915983+00');
INSERT INTO demo_first.documents (id, owner_user_id, name, extension, size_bytes, mime_type, status, created_at, updated_at) VALUES (2, 2, 'Budget', 'xlsx', 20480, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'DRAFT', '2025-09-05 09:59:25.915983+00', '2025-09-05 09:59:25.915983+00');
INSERT INTO demo_first.documents (id, owner_user_id, name, extension, size_bytes, mime_type, status, created_at, updated_at) VALUES (3, 3, 'Notes', 'txt', 512, 'text/plain', 'ARCHIVED', '2025-09-05 09:59:25.915983+00', '2025-09-05 09:59:25.915983+00');


ALTER TABLE demo_first.documents ENABLE TRIGGER ALL;

--
-- Data for Name: document_tags; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.document_tags DISABLE TRIGGER ALL;

INSERT INTO demo_first.document_tags (document_id, tag_id, created_at) VALUES (1, 3, '2025-09-05 09:59:25.918692+00');
INSERT INTO demo_first.document_tags (document_id, tag_id, created_at) VALUES (2, 2, '2025-09-05 09:59:25.918692+00');
INSERT INTO demo_first.document_tags (document_id, tag_id, created_at) VALUES (3, 1, '2025-09-05 09:59:25.918692+00');


ALTER TABLE demo_first.document_tags ENABLE TRIGGER ALL;

--
-- Data for Name: document_versions; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.document_versions DISABLE TRIGGER ALL;

INSERT INTO demo_first.document_versions (id, document_id, version_no, storage_uri, checksum_sha256, created_at) VALUES (1, 1, 1, 's3://bucket/project-plan-v1.docx', NULL, '2025-09-05 09:59:25.917266+00');
INSERT INTO demo_first.document_versions (id, document_id, version_no, storage_uri, checksum_sha256, created_at) VALUES (2, 1, 2, 's3://bucket/project-plan-v2.docx', NULL, '2025-09-05 09:59:25.917266+00');
INSERT INTO demo_first.document_versions (id, document_id, version_no, storage_uri, checksum_sha256, created_at) VALUES (3, 2, 1, 'file://server/budget-v1.xlsx', NULL, '2025-09-05 09:59:25.917266+00');
INSERT INTO demo_first.document_versions (id, document_id, version_no, storage_uri, checksum_sha256, created_at) VALUES (4, 2, 2, 'file://server/budget-v2.xlsx', NULL, '2025-09-05 09:59:25.917266+00');
INSERT INTO demo_first.document_versions (id, document_id, version_no, storage_uri, checksum_sha256, created_at) VALUES (5, 3, 1, 's3://bucket/notes-v1.txt', NULL, '2025-09-05 09:59:25.917266+00');
INSERT INTO demo_first.document_versions (id, document_id, version_no, storage_uri, checksum_sha256, created_at) VALUES (6, 3, 2, 's3://bucket/notes-v2.txt', NULL, '2025-09-05 09:59:25.917266+00');


ALTER TABLE demo_first.document_versions ENABLE TRIGGER ALL;

--
-- Data for Name: exports; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.exports DISABLE TRIGGER ALL;



ALTER TABLE demo_first.exports ENABLE TRIGGER ALL;

--
-- Data for Name: forms; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.forms DISABLE TRIGGER ALL;

INSERT INTO demo_first.forms (id, name, created_at) VALUES ('contact', 'contact13', '2025-09-11 14:03:56.923301+00');
INSERT INTO demo_first.forms (id, name, created_at) VALUES ('formulairecni', 'formulairecni', '2025-09-15 05:19:45.159807+00');


ALTER TABLE demo_first.forms ENABLE TRIGGER ALL;

--
-- Data for Name: form_versions; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.form_versions DISABLE TRIGGER ALL;

INSERT INTO demo_first.form_versions (id, form_id, version, status, schema, notes, author_id, created_at) VALUES (22, 'contact', 2, 'draft', '{"display": "form", "components": [{"key": "textField", "type": "textfield", "input": true, "label": "Text Field", "tableView": true, "applyMaskOn": "change", "validateWhenHidden": false}, {"key": "password", "type": "password", "input": true, "label": "Password", "protected": true, "tableView": false, "applyMaskOn": "change", "validateWhenHidden": false}]}', 'save from builder', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-11 15:48:07.841465+00');
INSERT INTO demo_first.form_versions (id, form_id, version, status, schema, notes, author_id, created_at) VALUES (21, 'contact', 1, 'archived', '{"display": "form", "components": [{"key": "textField", "type": "textfield", "input": true, "label": "Text Field", "tableView": true, "applyMaskOn": "change", "validateWhenHidden": false}]}', 'save from builder', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-11 15:04:42.225037+00');
INSERT INTO demo_first.form_versions (id, form_id, version, status, schema, notes, author_id, created_at) VALUES (24, 'contact', 3, 'publiée', '{"display": "form", "components": [{"key": "columns", "type": "columns", "input": false, "label": "Columns", "columns": [{"pull": 0, "push": 0, "size": "md", "width": 6, "offset": 0, "components": [{"key": "civilite", "data": {"custom": "var url = ''http://localhost:5001/api/listes/Genre'';\nvar headers = { ''Content-Type'': ''application/json'' };\nvar _token = (typeof window !== ''undefined'' && window.localStorage) ? localStorage.getItem(''access_token'') : '''';\nif (_token) headers.Authorization = ''Bearer '' + _token;\nreturn fetch(url, { headers }).then(r => r.ok ? r.json() : []).then(arr => Array.isArray(arr) ? arr : []);"}, "type": "select", "input": true, "label": "Civilité", "widget": "choicesjs", "dataSrc": "custom", "template": "{{ item.valeur }}", "validate": {"required": true}, "tableView": true, "placeholder": "Sélectionnez une civilité", "defaultValue": "Mr", "searchEnabled": false, "valueProperty": "valeur", "clearOnRefresh": true, "validateWhenHidden": false}, {"key": "prenom", "type": "textfield", "input": true, "label": "Prénom", "tableView": true, "applyMaskOn": "change", "validateWhenHidden": false}, {"key": "nom", "type": "textfield", "input": true, "label": "Nom", "tableView": true, "applyMaskOn": "change", "validateWhenHidden": false}, {"key": "email", "type": "email", "input": true, "label": "Email", "tableView": true, "applyMaskOn": "change", "validateWhenHidden": false}, {"key": "telephone", "type": "phoneNumber", "input": true, "label": "Téléphone", "tableView": true, "applyMaskOn": "change", "validateWhenHidden": false}, {"key": "adresse", "type": "textfield", "input": true, "label": "Adresse", "tableView": true, "applyMaskOn": "change", "validateWhenHidden": false}, {"key": "poste", "data": {"values": [{"label": "AVV", "value": "avv"}, {"label": "SALES", "value": "sales"}]}, "type": "select", "input": true, "label": "Poste", "widget": "choicesjs", "tableView": true, "validateWhenHidden": false}], "currentWidth": 6}, {"pull": 0, "push": 0, "size": "md", "width": 6, "offset": 0, "components": [{"key": "entreprise", "data": {"custom": "var url = ''http://localhost:5001/api/entreprises'';\nvar headers = { ''Content-Type'': ''application/json'' };\nvar _token = (typeof window !== ''undefined'' && window.localStorage) ? localStorage.getItem(''access_token'') : '''';\nif (_token) headers.Authorization = ''Bearer '' + _token;\nreturn fetch(url, { headers }).then(r => r.ok ? r.json() : []).then(arr => Array.isArray(arr) ? arr.map(e => ({ value: e.id, label: e.nom })) : []);"}, "type": "select", "input": true, "label": "Entreprise", "widget": "choicesjs", "dataSrc": "custom", "template": "{{ item.label }}", "validate": {"required": true}, "tableView": true, "customClass": "select-dark", "valueProperty": "value", "validateWhenHidden": false}, {"key": "statut", "data": {"custom": "var url = ''http://localhost:5001/api/listes/Statut'';\nvar headers = { ''Content-Type'': ''application/json'' };\nvar _token = (typeof window !== ''undefined'' && window.localStorage) ? localStorage.getItem(''access_token'') : '''';\nif (_token) headers.Authorization = ''Bearer '' + _token;\nreturn fetch(url, { headers }).then(r => r.ok ? r.json() : []).then(arr => Array.isArray(arr) ? arr : []);"}, "type": "select", "input": true, "label": "Statut", "widget": "choicesjs", "dataSrc": "custom", "template": "{{ item.valeur }}", "validate": {"required": true}, "tableView": true, "customClass": "select-dark", "placeholder": "Sélectionnez un statut", "defaultValue": "A faire", "searchEnabled": false, "valueProperty": "valeur", "clearOnRefresh": true, "validateWhenHidden": false}, {"key": "tags", "data": {"custom": "var url = ''http://localhost:5001/api/listes/Tag'';\nvar headers = { ''Content-Type'': ''application/json'' };\nvar _token = (typeof window !== ''undefined'' && window.localStorage) ? localStorage.getItem(''access_token'') : '''';\nif (_token) headers.Authorization = ''Bearer '' + _token;\nreturn fetch(url, { headers }).then(r => r.ok ? r.json() : []).then(arr => Array.isArray(arr) ? arr : []);"}, "type": "select", "input": true, "label": "Tags", "widget": "choicesjs", "dataSrc": "custom", "template": "{{ item.valeur }}", "validate": {"required": true}, "tableView": true, "customClass": "select-dark", "placeholder": "Sélectionnez un tag", "defaultValue": "Mr", "searchEnabled": false, "valueProperty": "valeur", "clearOnRefresh": true, "validateWhenHidden": false}, {"key": "source", "data": {"custom": "var url = ''http://localhost:5001/api/listes/Source'';\nvar headers = { ''Content-Type'': ''application/json'' };\nvar _token = (typeof window !== ''undefined'' && window.localStorage) ? localStorage.getItem(''access_token'') : '''';\nif (_token) headers.Authorization = ''Bearer '' + _token;\nreturn fetch(url, { headers }).then(r => r.ok ? r.json() : []).then(arr => Array.isArray(arr) ? arr : []);"}, "type": "select", "input": true, "label": "Source", "widget": "choicesjs", "dataSrc": "custom", "template": "{{ item.valeur }}", "validate": {"required": true}, "tableView": true, "customClass": "select-dark", "placeholder": "Sélectionnez une source", "defaultValue": "Leadeo", "searchEnabled": false, "valueProperty": "valeur", "clearOnRefresh": true, "validateWhenHidden": false}, {"key": "reponse1", "type": "radio", "input": true, "label": "Réponse 1", "inline": false, "values": [{"label": "Réponse 1", "value": "reponse1", "shortcut": ""}], "tableView": false, "validateWhenHidden": false, "optionsLabelPosition": "right"}, {"key": "notes", "type": "textarea", "input": true, "label": "Notes", "tableView": true, "autoExpand": false, "applyMaskOn": "change", "validateWhenHidden": false}], "currentWidth": 6}], "tableView": false}]}', 'save from builder', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-11 17:34:38.73493+00');
INSERT INTO demo_first.form_versions (id, form_id, version, status, schema, notes, author_id, created_at) VALUES (25, 'formulairecni', 1, 'brouillon', '{"display": "form", "components": []}', 'init', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-15 05:19:45.166439+00');
INSERT INTO demo_first.form_versions (id, form_id, version, status, schema, notes, author_id, created_at) VALUES (26, 'formulairecni', 2, 'publiée', '{"display": "form", "components": [{"key": "textField", "type": "textfield", "input": true, "label": "Text Field", "tableView": true, "applyMaskOn": "change", "validateWhenHidden": false}]}', 'save from builder', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-15 05:24:37.462134+00');


ALTER TABLE demo_first.form_versions ENABLE TRIGGER ALL;

--
-- Data for Name: keycloak_users; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.keycloak_users DISABLE TRIGGER ALL;

INSERT INTO demo_first.keycloak_users (id, username, email) VALUES ('90950675-423e-4b77-8678-f0f755a5b91e', 'reunion.user', 'reunion.user@example.com');
INSERT INTO demo_first.keycloak_users (id, username, email) VALUES ('9f7eb43b-539c-4cba-b2a2-0474c390e37f', 'test', 'maxime.delormema@gmail.com');
INSERT INTO demo_first.keycloak_users (id, username, email) VALUES ('d865f0da-6aaf-4d98-9d00-98be91320796', 'toto', 'toto@toto.fr');


ALTER TABLE demo_first.keycloak_users ENABLE TRIGGER ALL;

--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.leave_requests DISABLE TRIGGER ALL;



ALTER TABLE demo_first.leave_requests ENABLE TRIGGER ALL;

--
-- Data for Name: listes; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.listes DISABLE TRIGGER ALL;

INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (20, 'Toto', 'eazea', NULL, 0, true, '2025-09-08 13:03:47.501621');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (21, 'Ville', 'Bordeaux', NULL, 0, true, '2025-09-08 13:04:16.729285');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (33, 'Genre', 'Mr', NULL, 0, true, '2025-09-08 15:07:46.562106');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (35, 'Genre', 'Non défini', NULL, 0, true, '2025-09-08 15:07:46.575936');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (36, 'Statut', 'A faire', NULL, 0, true, '2025-09-08 15:18:21.054191');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (37, 'Statut', 'En cours', NULL, 0, true, '2025-09-08 15:18:21.063071');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (38, 'Statut', 'En attente', NULL, 0, true, '2025-09-08 15:18:21.068425');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (39, 'Statut', 'Terminé', NULL, 0, true, '2025-09-08 15:18:21.073056');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (40, 'Source', 'Web', NULL, 0, true, '2025-09-09 03:04:51.573557');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (41, 'Source', 'Leadeo', NULL, 0, true, '2025-09-09 03:04:57.822968');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (42, 'Tag', 'VIP', NULL, 0, true, '2025-09-09 03:05:18.890388');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (43, 'Tag', 'Tag 2', NULL, 0, true, '2025-09-09 03:05:18.895542');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (34, 'Genre', 'Mmee', NULL, 0, true, '2025-09-08 15:07:46.570206');
INSERT INTO demo_first.listes (id, type, valeur, parent_id, ordre, actif, created_at) VALUES (44, 'Genre', 'test', 34, 0, true, '2025-09-12 06:27:18.438439');


ALTER TABLE demo_first.listes ENABLE TRIGGER ALL;

--
-- Data for Name: messages; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.messages DISABLE TRIGGER ALL;

INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('5ee318ed-91d2-4ab8-a6d1-00e6acace817', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', 'hello', '2025-09-05 14:37:10.119979');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('9a97f9dd-889b-46bd-83d6-8471bd031048', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', 'ça va ?', '2025-09-05 14:38:44.001585');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('21e3c900-a8dd-4917-9fc3-6a234cb5457f', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'nickel', '2025-09-05 14:40:43.156498');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('82a2ea00-2119-4449-bb22-15262921c60b', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', 'top', '2025-09-05 14:45:23.451751');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('05d5d3a0-fc97-475f-ae08-5bffdff9d781', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'trop cool', '2025-09-05 18:21:17.598229');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('3bcbf508-a8d4-476f-a26d-e55d8d4e2466', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', 'oui, je sais', '2025-09-05 18:26:43.116706');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('4f838884-2cc4-4cff-8540-24f2a8cb9727', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'aight', '2025-09-05 18:31:35.169084');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('104e899d-59c1-40e5-8a6f-4705194e033a', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', 'coucou', '2025-09-05 19:12:12.252021');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('ee8f8848-476f-4902-9028-f493bfe9de08', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', 'tu dors ?', '2025-09-05 19:15:53.393364');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('6f238651-dbb0-42ab-b356-b867b8b5d8ea', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', 'whatups ?', '2025-09-06 08:05:01.647334');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('9bc13ffc-d293-459c-a132-3ecdf1d8ccc0', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', 'eazea', '2025-09-06 08:06:39.852371');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('0f39da75-1088-49cc-a625-0dbb1cf9aed1', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'eaze', '2025-09-08 08:02:18.853142');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('b9d0e32e-9dba-49fd-bb26-9e2cd73a4176', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'hello 9 septembre', '2025-09-09 07:23:25.23664');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('ee614c01-2f43-4f43-af1e-c520eb009609', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'moi', '2025-09-09 08:11:07.405132');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('3be9a059-e9c7-4e6b-8f40-d070d830bbae', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'ça va ?', '2025-09-09 08:18:11.179019');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('7ea34b44-d709-41a7-ba94-542133605de8', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'top', '2025-09-09 08:19:35.398102');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('e220dfae-fc28-4bd1-86e8-39cb9ec148a5', 'c2f37734-c107-41b8-9dcf-9c509dc0788f', '90950675-423e-4b77-8678-f0f755a5b91e', 'eazeza', '2025-09-09 15:13:41.764197');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('42081532-a2f2-4863-8277-86e1fa551fd1', 'c2f37734-c107-41b8-9dcf-9c509dc0788f', '90950675-423e-4b77-8678-f0f755a5b91e', 'merci', '2025-09-09 17:01:03.310537');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('cefb12d6-2df7-4884-9261-4c56dde7a1b2', 'c2f37734-c107-41b8-9dcf-9c509dc0788f', '90950675-423e-4b77-8678-f0f755a5b91e', 'test', '2025-09-10 15:37:36.483256');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('329d3ec7-cf6d-42ac-bdc3-afbab838b394', 'c2f37734-c107-41b8-9dcf-9c509dc0788f', '90950675-423e-4b77-8678-f0f755a5b91e', 'coucou', '2025-09-11 10:01:00.072293');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('55577341-e0e2-41d4-806c-56197f835bf2', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'eazeaze😄', '2025-09-11 11:00:28.566173');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('2f0d0176-a078-4153-a432-d37a41775366', 'a0cc3e6a-6b92-4720-82dc-11fb6a594fb4', '90950675-423e-4b77-8678-f0f755a5b91e', 'aaaaa', '2025-09-11 18:14:37.775219');
INSERT INTO demo_first.messages (id, conversation_id, sender_id, content, created_at) VALUES ('3871cf09-1860-47ce-8fa1-b1690124fe1a', 'ef3b1746-890d-48e8-9086-ff7b268e6b98', '90950675-423e-4b77-8678-f0f755a5b91e', 'Hello la team ', '2025-09-11 18:15:42.401489');


ALTER TABLE demo_first.messages ENABLE TRIGGER ALL;

--
-- Data for Name: message_reads; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.message_reads DISABLE TRIGGER ALL;

INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('5ee318ed-91d2-4ab8-a6d1-00e6acace817', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-05 14:37:11.825109');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('5ee318ed-91d2-4ab8-a6d1-00e6acace817', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-05 14:39:12.92071');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('9a97f9dd-889b-46bd-83d6-8471bd031048', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-05 14:39:12.92071');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('9a97f9dd-889b-46bd-83d6-8471bd031048', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-05 14:40:47.5867');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('21e3c900-a8dd-4917-9fc3-6a234cb5457f', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-05 14:40:47.5867');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('82a2ea00-2119-4449-bb22-15262921c60b', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-05 14:57:05.75823');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('21e3c900-a8dd-4917-9fc3-6a234cb5457f', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-05 18:20:39.599976');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('82a2ea00-2119-4449-bb22-15262921c60b', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-05 18:20:39.599976');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('05d5d3a0-fc97-475f-ae08-5bffdff9d781', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-05 18:26:30.059027');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('05d5d3a0-fc97-475f-ae08-5bffdff9d781', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-05 18:27:01.938639');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('3bcbf508-a8d4-476f-a26d-e55d8d4e2466', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-05 18:27:01.938639');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('3bcbf508-a8d4-476f-a26d-e55d8d4e2466', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-05 18:27:47.536966');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('4f838884-2cc4-4cff-8540-24f2a8cb9727', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-05 19:11:20.990519');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('104e899d-59c1-40e5-8a6f-4705194e033a', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-05 19:12:14.427944');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('4f838884-2cc4-4cff-8540-24f2a8cb9727', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-05 19:16:16.442244');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('104e899d-59c1-40e5-8a6f-4705194e033a', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-05 19:16:16.442244');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('ee8f8848-476f-4902-9028-f493bfe9de08', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-05 19:16:16.442244');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('ee8f8848-476f-4902-9028-f493bfe9de08', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-05 19:17:41.924291');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('6f238651-dbb0-42ab-b356-b867b8b5d8ea', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-06 08:05:03.190275');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('9bc13ffc-d293-459c-a132-3ecdf1d8ccc0', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-06 08:06:41.024048');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('6f238651-dbb0-42ab-b356-b867b8b5d8ea', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-06 10:15:54.140583');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('9bc13ffc-d293-459c-a132-3ecdf1d8ccc0', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-06 10:15:54.140583');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('0f39da75-1088-49cc-a625-0dbb1cf9aed1', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-09 07:19:53.686382');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('b9d0e32e-9dba-49fd-bb26-9e2cd73a4176', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-09 07:26:02.664044');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('ee614c01-2f43-4f43-af1e-c520eb009609', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-09 08:14:02.935753');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('3be9a059-e9c7-4e6b-8f40-d070d830bbae', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-09 08:18:20.404036');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('7ea34b44-d709-41a7-ba94-542133605de8', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-09 08:19:47.913');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('e220dfae-fc28-4bd1-86e8-39cb9ec148a5', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-09 15:13:55.097827');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('e220dfae-fc28-4bd1-86e8-39cb9ec148a5', 'd865f0da-6aaf-4d98-9d00-98be91320796', '2025-09-09 15:14:14.352083');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('42081532-a2f2-4863-8277-86e1fa551fd1', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-09 17:01:12.245629');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('0f39da75-1088-49cc-a625-0dbb1cf9aed1', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-09 18:02:24.378913');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('b9d0e32e-9dba-49fd-bb26-9e2cd73a4176', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-09 18:02:24.378913');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('ee614c01-2f43-4f43-af1e-c520eb009609', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-09 18:02:24.378913');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('3be9a059-e9c7-4e6b-8f40-d070d830bbae', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-09 18:02:24.378913');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('7ea34b44-d709-41a7-ba94-542133605de8', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-09 18:02:24.378913');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('cefb12d6-2df7-4884-9261-4c56dde7a1b2', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-11 09:45:52.301623');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('329d3ec7-cf6d-42ac-bdc3-afbab838b394', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-11 10:01:40.13213');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('55577341-e0e2-41d4-806c-56197f835bf2', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-11 11:01:42.460536');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('55577341-e0e2-41d4-806c-56197f835bf2', '9f7eb43b-539c-4cba-b2a2-0474c390e37f', '2025-09-11 12:20:10.362468');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('3871cf09-1860-47ce-8fa1-b1690124fe1a', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-11 18:18:54.674801');
INSERT INTO demo_first.message_reads (message_id, user_id, read_at) VALUES ('2f0d0176-a078-4153-a432-d37a41775366', '90950675-423e-4b77-8678-f0f755a5b91e', '2025-09-11 18:35:03.912642');


ALTER TABLE demo_first.message_reads ENABLE TRIGGER ALL;

--
-- Data for Name: notes; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.notes DISABLE TRIGGER ALL;



ALTER TABLE demo_first.notes ENABLE TRIGGER ALL;

--
-- Data for Name: notes_replies; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.notes_replies DISABLE TRIGGER ALL;



ALTER TABLE demo_first.notes_replies ENABLE TRIGGER ALL;

--
-- Data for Name: notifications; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.notifications DISABLE TRIGGER ALL;



ALTER TABLE demo_first.notifications ENABLE TRIGGER ALL;

--
-- Data for Name: roles; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.roles DISABLE TRIGGER ALL;

INSERT INTO demo_first.roles (id, code, label, created_at, updated_at) VALUES (1, 'ADMIN', 'Administrator', '2025-09-05 09:59:25.908945+00', '2025-09-05 09:59:25.908945+00');
INSERT INTO demo_first.roles (id, code, label, created_at, updated_at) VALUES (2, 'EDITOR', 'Editor', '2025-09-05 09:59:25.908945+00', '2025-09-05 09:59:25.908945+00');
INSERT INTO demo_first.roles (id, code, label, created_at, updated_at) VALUES (3, 'VIEWER', 'Viewer', '2025-09-05 09:59:25.908945+00', '2025-09-05 09:59:25.908945+00');


ALTER TABLE demo_first.roles ENABLE TRIGGER ALL;

--
-- Data for Name: submissions; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.submissions DISABLE TRIGGER ALL;

INSERT INTO demo_first.submissions (id, form_id, submission_data, created_at, form_version) VALUES (1, 'toto', '{"submit": true, "civilite": "Mr"}', '2025-09-10 07:28:05.0654', NULL);
INSERT INTO demo_first.submissions (id, form_id, submission_data, created_at, form_version) VALUES (2, 'toto', '{"submit": true, "civilite": "Mr"}', '2025-09-10 07:28:05.06764', NULL);
INSERT INTO demo_first.submissions (id, form_id, submission_data, created_at, form_version) VALUES (3, 'toto', '{"submit": true, "civilite": "Mr"}', '2025-09-10 07:29:56.917792', NULL);
INSERT INTO demo_first.submissions (id, form_id, submission_data, created_at, form_version) VALUES (4, 'toto', '{"submit": true, "civilite": "Mr"}', '2025-09-10 07:29:56.918348', NULL);
INSERT INTO demo_first.submissions (id, form_id, submission_data, created_at, form_version) VALUES (5, 'toto', '{"civilite": "Mr"}', '2025-09-10 07:31:53.274496', NULL);


ALTER TABLE demo_first.submissions ENABLE TRIGGER ALL;

--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: demo_first; Owner: -
--

ALTER TABLE demo_first.user_roles DISABLE TRIGGER ALL;

INSERT INTO demo_first.user_roles (user_id, role_id, created_at) VALUES (1, 1, '2025-09-05 09:59:25.914303+00');
INSERT INTO demo_first.user_roles (user_id, role_id, created_at) VALUES (2, 2, '2025-09-05 09:59:25.914303+00');
INSERT INTO demo_first.user_roles (user_id, role_id, created_at) VALUES (3, 3, '2025-09-05 09:59:25.914303+00');


ALTER TABLE demo_first.user_roles ENABLE TRIGGER ALL;

--
-- Data for Name: entreprises; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.entreprises DISABLE TRIGGER ALL;



ALTER TABLE public.entreprises ENABLE TRIGGER ALL;

--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.contacts DISABLE TRIGGER ALL;



ALTER TABLE public.contacts ENABLE TRIGGER ALL;

--
-- Data for Name: activites; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.activites DISABLE TRIGGER ALL;



ALTER TABLE public.activites ENABLE TRIGGER ALL;

--
-- Data for Name: projets; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.projets DISABLE TRIGGER ALL;



ALTER TABLE public.projets ENABLE TRIGGER ALL;

--
-- Data for Name: contact_projet; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.contact_projet DISABLE TRIGGER ALL;



ALTER TABLE public.contact_projet ENABLE TRIGGER ALL;

--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.tags DISABLE TRIGGER ALL;



ALTER TABLE public.tags ENABLE TRIGGER ALL;

--
-- Data for Name: contact_tags; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.contact_tags DISABLE TRIGGER ALL;



ALTER TABLE public.contact_tags ENABLE TRIGGER ALL;

--
-- Data for Name: exports; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.exports DISABLE TRIGGER ALL;



ALTER TABLE public.exports ENABLE TRIGGER ALL;

--
-- Name: activites_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.activites_id_seq', 9, true);


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.audit_log_id_seq', 33, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.contacts_id_seq', 3, true);


--
-- Name: document_versions_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.document_versions_id_seq', 33, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.documents_id_seq', 33, true);


--
-- Name: entreprises_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.entreprises_id_seq', 1, true);


--
-- Name: exports_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.exports_id_seq', 1, false);


--
-- Name: form_versions_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.form_versions_id_seq', 26, true);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.leave_requests_id_seq', 1, false);


--
-- Name: listes_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.listes_id_seq', 44, true);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.notes_id_seq', 20, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.notifications_id_seq', 18, true);


--
-- Name: projets_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.projets_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.roles_id_seq', 33, true);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.submissions_id_seq', 5, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.tags_id_seq', 33, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: demo_first; Owner: -
--

SELECT pg_catalog.setval('demo_first.users_id_seq', 33, true);


--
-- Name: activites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activites_id_seq', 1, false);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contacts_id_seq', 1, false);


--
-- Name: entreprises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entreprises_id_seq', 1, false);


--
-- Name: exports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exports_id_seq', 1, false);


--
-- Name: projets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projets_id_seq', 1, false);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict i07KdNcya4GNCX5o6Lwil65ny2LWhSKpZaCFwjt0DFtMu1gffYQUdjofML4gRP9

