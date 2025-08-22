-- Seed data for demo_first schema
SET search_path TO demo_first, public;

-- Roles
INSERT INTO roles (code, label) VALUES
  ('ADMIN', 'Administrator'),
  ('EDITOR', 'Editor'),
  ('VIEWER', 'Viewer');

-- Users
INSERT INTO users (username, email, display_name) VALUES
  ('alice', 'alice@example.com', 'Alice Example'),
  ('bob', 'bob@example.com', 'Bob Example'),
  ('carol', 'carol@example.com', 'Carol Example');

-- User roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE (u.username, r.code) IN (('alice','ADMIN'), ('bob','EDITOR'), ('carol','VIEWER'));

-- Documents
INSERT INTO documents (owner_user_id, name, extension, size_bytes, mime_type, status) VALUES
  (1, 'Project Plan', 'docx', 102400, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'PUBLISHED'),
  (2, 'Budget', 'xlsx', 20480, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'DRAFT'),
  (3, 'Notes', 'txt', 512, 'text/plain', 'ARCHIVED');

-- Document versions
INSERT INTO document_versions (document_id, version_no, storage_uri, checksum_sha256) VALUES
  (1, 1, 's3://bucket/project-plan-v1.docx', NULL),
  (1, 2, 's3://bucket/project-plan-v2.docx', NULL),
  (2, 1, 'file://server/budget-v1.xlsx', NULL),
  (2, 2, 'file://server/budget-v2.xlsx', NULL),
  (3, 1, 's3://bucket/notes-v1.txt', NULL),
  (3, 2, 's3://bucket/notes-v2.txt', NULL);

-- Tags
INSERT INTO tags (name) VALUES
  ('contract'),
  ('invoice'),
  ('spec');

-- Document tags
INSERT INTO document_tags (document_id, tag_id)
SELECT d.id, t.id FROM documents d, tags t
WHERE (d.name, t.name) IN
  (('Project Plan','spec'), ('Budget','invoice'), ('Notes','contract'));

-- Audit log
INSERT INTO audit_log (actor_user_id, entity_type, entity_id, action, meta) VALUES
  (1, 'DOCUMENT', 1, 'CREATE_DOCUMENT', NULL),
  (1, 'DOCUMENT', 1, 'UPLOAD_VERSION', '{"version":1}'),
  (2, 'DOCUMENT', 2, 'CREATE_DOCUMENT', NULL),
  (2, 'DOCUMENT', 2, 'UPLOAD_VERSION', '{"version":1}'),
  (3, 'DOCUMENT', 3, 'TAG_ADD', '{"tag":"contract"}');
