\restrict 0REEWmkEBDt44vfH9je9gZPK6J9TgMSfh4eKUFnchlOVogBlHdI6WWdEHEsqLoq


CREATE SCHEMA IF NOT EXISTS demo_first;

CREATE SEQUENCE IF NOT EXISTS demo_first.activites_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.audit_log_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.contacts_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.document_versions_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.documents_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.entreprises_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.exports_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.form_versions_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.leave_requests_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.listes_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.notes_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.notifications_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.projets_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.roles_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.submissions_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.tags_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS demo_first.users_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS demo_first.activites (
    id integer NOT NULL DEFAULT nextval('demo_first.activites_id_seq'::regclass) PRIMARY KEY,
    type character varying(50) NOT NULL,
    description text,
    date timestamp without time zone DEFAULT now(),
    contact_id integer,
    projet_id integer,
    utilisateur character varying(100),
    utilisateur_id uuid
);

CREATE TABLE IF NOT EXISTS demo_first.audit_log (
    id bigint NOT NULL DEFAULT nextval('demo_first.audit_log_id_seq'::regclass) PRIMARY KEY,
    actor_user_id bigint,
    entity_type character varying(64) NOT NULL,
    entity_id bigint NOT NULL,
    action character varying(64) NOT NULL,
    meta jsonb,
    occurred_at timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS demo_first.contact_projet (
    contact_id integer NOT NULL,
    projet_id integer NOT NULL,
    PRIMARY KEY (contact_id, projet_id)
);

CREATE TABLE IF NOT EXISTS demo_first.contact_tags (
    contact_id integer NOT NULL,
    tag_id integer NOT NULL,
    PRIMARY KEY (contact_id, tag_id)
);

CREATE TABLE IF NOT EXISTS demo_first.contacts (
    id integer NOT NULL DEFAULT nextval('demo_first.contacts_id_seq'::regclass) PRIMARY KEY,
    entreprise_id integer,
    created_at timestamp without time zone DEFAULT now(),
    last_interaction timestamp without time zone,
    form_data jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS demo_first.conversation_participants (
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS demo_first.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    is_group boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    title text
);

CREATE TABLE IF NOT EXISTS demo_first.document_tags (
    document_id bigint NOT NULL,
    tag_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE IF NOT EXISTS demo_first.document_versions (
    id bigint NOT NULL DEFAULT nextval('demo_first.document_versions_id_seq'::regclass) PRIMARY KEY,
    document_id bigint NOT NULL,
    version_no integer NOT NULL,
    storage_uri text NOT NULL,
    checksum_sha256 character(64),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (document_id, version_no)
);

CREATE TABLE IF NOT EXISTS demo_first.documents (
    id bigint NOT NULL DEFAULT nextval('demo_first.documents_id_seq'::regclass) PRIMARY KEY,
    owner_user_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    extension character varying(16),
    size_bytes bigint,
    mime_type character varying(255),
    status character varying(32) DEFAULT 'DRAFT'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.entreprises (
    id integer NOT NULL DEFAULT nextval('demo_first.entreprises_id_seq'::regclass) PRIMARY KEY,
    nom character varying(255) NOT NULL,
    secteur character varying(255),
    adresse text,
    telephone character varying(50),
    email character varying(255),
    site_web character varying(255),
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.exports (
    id integer NOT NULL DEFAULT nextval('demo_first.exports_id_seq'::regclass) PRIMARY KEY,
    type character varying(50) NOT NULL,
    filtre jsonb,
    fichier_url character varying(255),
    date_export timestamp without time zone DEFAULT now(),
    utilisateur character varying(100)
);

CREATE TABLE IF NOT EXISTS demo_first.form_versions (
    id bigint NOT NULL DEFAULT nextval('demo_first.form_versions_id_seq'::regclass) PRIMARY KEY,
    form_id text,
    version integer NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    schema jsonb NOT NULL,
    notes text,
    author_id text,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (form_id, version)
);

CREATE TABLE IF NOT EXISTS demo_first.forms (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.keycloak_users (
    id uuid NOT NULL PRIMARY KEY,
    username character varying(255) NOT NULL,
    email character varying(255)
);

CREATE TABLE IF NOT EXISTS demo_first.leave_requests (
    id integer NOT NULL DEFAULT nextval('demo_first.leave_requests_id_seq'::regclass) PRIMARY KEY,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'EN ATTENTE'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.listes (
    id integer NOT NULL DEFAULT nextval('demo_first.listes_id_seq'::regclass) PRIMARY KEY,
    type character varying(100) NOT NULL,
    valeur character varying(255) NOT NULL,
    parent_id integer,
    ordre integer DEFAULT 0,
    actif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.message_reads (
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    read_at timestamp without time zone DEFAULT now(),
    PRIMARY KEY (message_id, user_id)
);

CREATE TABLE IF NOT EXISTS demo_first.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    conversation_id uuid,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.notes (
    id integer NOT NULL DEFAULT nextval('demo_first.notes_id_seq'::regclass) PRIMARY KEY,
    contact_id integer NOT NULL,
    utilisateur_id uuid NOT NULL,
    contenu jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.notes_replies (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    note_id integer NOT NULL,
    utilisateur_id uuid NOT NULL,
    contenu jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.notifications (
    id integer NOT NULL DEFAULT nextval('demo_first.notifications_id_seq'::regclass) PRIMARY KEY,
    user_id uuid NOT NULL,
    note_id integer NOT NULL,
    status character varying(20) DEFAULT 'unread'::character varying,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.projets (
    id integer NOT NULL DEFAULT nextval('demo_first.projets_id_seq'::regclass) PRIMARY KEY,
    entreprise_id integer,
    nom character varying(255) NOT NULL,
    description text,
    statut character varying(50) DEFAULT 'en cours'::character varying,
    budget numeric(12,2),
    date_debut date,
    date_fin date,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_first.roles (
    id bigint NOT NULL DEFAULT nextval('demo_first.roles_id_seq'::regclass) PRIMARY KEY,
    code character varying(50) NOT NULL,
    label character varying(120) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS demo_first.submissions (
    id integer NOT NULL DEFAULT nextval('demo_first.submissions_id_seq'::regclass) PRIMARY KEY,
    form_id text NOT NULL,
    submission_data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    form_version integer
);

CREATE TABLE IF NOT EXISTS demo_first.tags (
    id bigint NOT NULL DEFAULT nextval('demo_first.tags_id_seq'::regclass) PRIMARY KEY,
    name character varying(64) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS demo_first.user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS demo_first.users (
    id bigint NOT NULL DEFAULT nextval('demo_first.users_id_seq'::regclass) PRIMARY KEY,
    username character varying(80) NOT NULL,
    email character varying(255) NOT NULL,
    display_name character varying(120),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (email),
    UNIQUE (username)
);
\unrestrict 0REEWmkEBDt44vfH9je9gZPK6J9TgMSfh4eKUFnchlOVogBlHdI6WWdEHEsqLoq
