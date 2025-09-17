--
-- PostgreSQL database dump
--

\restrict fwQMsvFOB9Fqjy2MX7mjgqRzCJnRZcqF0TenYI7Yc90jh5SzJZnVYAxNYBcnLzk

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
-- Name: demo_first; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA demo_first;


ALTER SCHEMA demo_first OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: demo_first; Owner: postgres
--

CREATE FUNCTION demo_first.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION demo_first.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activites; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.activites (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    description text,
    date timestamp without time zone DEFAULT now(),
    contact_id integer,
    projet_id integer,
    utilisateur character varying(100),
    utilisateur_id uuid
);


ALTER TABLE demo_first.activites OWNER TO postgres;

--
-- Name: activites_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.activites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.activites_id_seq OWNER TO postgres;

--
-- Name: activites_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.activites_id_seq OWNED BY demo_first.activites.id;


--
-- Name: audit_log; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.audit_log (
    id bigint NOT NULL,
    actor_user_id bigint,
    entity_type character varying(64) NOT NULL,
    entity_id bigint NOT NULL,
    action character varying(64) NOT NULL,
    meta jsonb,
    occurred_at timestamp with time zone DEFAULT now()
);


ALTER TABLE demo_first.audit_log OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.audit_log_id_seq OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.audit_log_id_seq OWNED BY demo_first.audit_log.id;


--
-- Name: contact_old; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.contact_old (
    id integer,
    entreprise_id integer,
    prenom character varying(100),
    nom character varying(100),
    email character varying(255),
    telephone character varying(50),
    poste character varying(100),
    created_at timestamp without time zone,
    civilite character varying(20),
    mobile character varying(50),
    adresse text,
    ville character varying(100),
    pays character varying(100),
    tags text[],
    source character varying(100),
    statut character varying(50),
    notes text,
    last_interaction timestamp without time zone,
    form_data jsonb
);


ALTER TABLE demo_first.contact_old OWNER TO postgres;

--
-- Name: contact_projet; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.contact_projet (
    contact_id integer NOT NULL,
    projet_id integer NOT NULL
);


ALTER TABLE demo_first.contact_projet OWNER TO postgres;

--
-- Name: contact_tags; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.contact_tags (
    contact_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE demo_first.contact_tags OWNER TO postgres;

--
-- Name: contacts; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.contacts (
    id integer NOT NULL,
    entreprise_id integer,
    created_at timestamp without time zone DEFAULT now(),
    last_interaction timestamp without time zone,
    form_data jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE demo_first.contacts OWNER TO postgres;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.contacts_id_seq OWNER TO postgres;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.contacts_id_seq OWNED BY demo_first.contacts.id;


--
-- Name: conversation_participants; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.conversation_participants (
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE demo_first.conversation_participants OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    is_group boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    title text
);


ALTER TABLE demo_first.conversations OWNER TO postgres;

--
-- Name: document_tags; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.document_tags (
    document_id bigint NOT NULL,
    tag_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE demo_first.document_tags OWNER TO postgres;

--
-- Name: document_versions; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.document_versions (
    id bigint NOT NULL,
    document_id bigint NOT NULL,
    version_no integer NOT NULL,
    storage_uri text NOT NULL,
    checksum_sha256 character(64),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT document_versions_version_no_check CHECK ((version_no >= 1))
);


ALTER TABLE demo_first.document_versions OWNER TO postgres;

--
-- Name: document_versions_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.document_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.document_versions_id_seq OWNER TO postgres;

--
-- Name: document_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.document_versions_id_seq OWNED BY demo_first.document_versions.id;


--
-- Name: documents; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.documents (
    id bigint NOT NULL,
    owner_user_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    extension character varying(16),
    size_bytes bigint,
    mime_type character varying(255),
    status character varying(32) DEFAULT 'DRAFT'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT documents_size_bytes_check CHECK ((size_bytes >= 0))
);


ALTER TABLE demo_first.documents OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.documents_id_seq OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.documents_id_seq OWNED BY demo_first.documents.id;


--
-- Name: entreprises; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.entreprises (
    id integer NOT NULL,
    nom character varying(255) NOT NULL,
    secteur character varying(255),
    adresse text,
    telephone character varying(50),
    email character varying(255),
    site_web character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE demo_first.entreprises OWNER TO postgres;

--
-- Name: entreprises_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.entreprises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.entreprises_id_seq OWNER TO postgres;

--
-- Name: entreprises_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.entreprises_id_seq OWNED BY demo_first.entreprises.id;


--
-- Name: exports; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.exports (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    filtre jsonb,
    fichier_url character varying(255),
    date_export timestamp without time zone DEFAULT now(),
    utilisateur character varying(100)
);


ALTER TABLE demo_first.exports OWNER TO postgres;

--
-- Name: exports_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.exports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.exports_id_seq OWNER TO postgres;

--
-- Name: exports_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.exports_id_seq OWNED BY demo_first.exports.id;


--
-- Name: form_versions; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.form_versions (
    id bigint NOT NULL,
    form_id text,
    version integer NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    schema jsonb NOT NULL,
    notes text,
    author_id text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE demo_first.form_versions OWNER TO postgres;

--
-- Name: form_versions_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.form_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.form_versions_id_seq OWNER TO postgres;

--
-- Name: form_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.form_versions_id_seq OWNED BY demo_first.form_versions.id;


--
-- Name: forms; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.forms (
    id text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE demo_first.forms OWNER TO postgres;

--
-- Name: forms_current; Type: VIEW; Schema: demo_first; Owner: postgres
--

CREATE VIEW demo_first.forms_current AS
 SELECT DISTINCT ON (form_versions.form_id) form_versions.form_id,
    form_versions.version,
    form_versions.status,
    form_versions.schema,
    form_versions.created_at
   FROM demo_first.form_versions
  WHERE (form_versions.status = 'published'::text)
  ORDER BY form_versions.form_id, form_versions.version DESC;


ALTER TABLE demo_first.forms_current OWNER TO postgres;

--
-- Name: keycloak_users; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.keycloak_users (
    id uuid NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255)
);


ALTER TABLE demo_first.keycloak_users OWNER TO postgres;

--
-- Name: leave_requests; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.leave_requests (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'EN ATTENTE'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE demo_first.leave_requests OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.leave_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.leave_requests_id_seq OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.leave_requests_id_seq OWNED BY demo_first.leave_requests.id;


--
-- Name: listes; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.listes (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    valeur character varying(255) NOT NULL,
    parent_id integer,
    ordre integer DEFAULT 0,
    actif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE demo_first.listes OWNER TO postgres;

--
-- Name: listes_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.listes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.listes_id_seq OWNER TO postgres;

--
-- Name: listes_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.listes_id_seq OWNED BY demo_first.listes.id;


--
-- Name: message_reads; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.message_reads (
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    read_at timestamp without time zone DEFAULT now()
);


ALTER TABLE demo_first.message_reads OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE demo_first.messages OWNER TO postgres;

--
-- Name: notes; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.notes (
    id integer NOT NULL,
    contact_id integer NOT NULL,
    utilisateur_id uuid NOT NULL,
    contenu jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE demo_first.notes OWNER TO postgres;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.notes_id_seq OWNER TO postgres;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.notes_id_seq OWNED BY demo_first.notes.id;


--
-- Name: notes_replies; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.notes_replies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    note_id integer NOT NULL,
    utilisateur_id uuid NOT NULL,
    contenu jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE demo_first.notes_replies OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.notifications (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    note_id integer NOT NULL,
    status character varying(20) DEFAULT 'unread'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE demo_first.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.notifications_id_seq OWNED BY demo_first.notifications.id;


--
-- Name: projets; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.projets (
    id integer NOT NULL,
    entreprise_id integer,
    nom character varying(255) NOT NULL,
    description text,
    statut character varying(50) DEFAULT 'en cours'::character varying,
    budget numeric(12,2),
    date_debut date,
    date_fin date,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE demo_first.projets OWNER TO postgres;

--
-- Name: projets_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.projets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.projets_id_seq OWNER TO postgres;

--
-- Name: projets_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.projets_id_seq OWNED BY demo_first.projets.id;


--
-- Name: roles; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.roles (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    label character varying(120) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE demo_first.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.roles_id_seq OWNED BY demo_first.roles.id;


--
-- Name: submissions; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.submissions (
    id integer NOT NULL,
    form_id text NOT NULL,
    submission_data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    form_version integer
);


ALTER TABLE demo_first.submissions OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.submissions_id_seq OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.submissions_id_seq OWNED BY demo_first.submissions.id;


--
-- Name: tags; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.tags (
    id bigint NOT NULL,
    name character varying(64) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE demo_first.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.tags_id_seq OWNED BY demo_first.tags.id;


--
-- Name: user_roles; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE demo_first.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: demo_first; Owner: postgres
--

CREATE TABLE demo_first.users (
    id bigint NOT NULL,
    username character varying(80) NOT NULL,
    email character varying(255) NOT NULL,
    display_name character varying(120),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE demo_first.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: demo_first; Owner: postgres
--

CREATE SEQUENCE demo_first.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE demo_first.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: demo_first; Owner: postgres
--

ALTER SEQUENCE demo_first.users_id_seq OWNED BY demo_first.users.id;


--
-- Name: activites id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.activites ALTER COLUMN id SET DEFAULT nextval('demo_first.activites_id_seq'::regclass);


--
-- Name: audit_log id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.audit_log ALTER COLUMN id SET DEFAULT nextval('demo_first.audit_log_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.contacts ALTER COLUMN id SET DEFAULT nextval('demo_first.contacts_id_seq'::regclass);


--
-- Name: document_versions id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.document_versions ALTER COLUMN id SET DEFAULT nextval('demo_first.document_versions_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.documents ALTER COLUMN id SET DEFAULT nextval('demo_first.documents_id_seq'::regclass);


--
-- Name: entreprises id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.entreprises ALTER COLUMN id SET DEFAULT nextval('demo_first.entreprises_id_seq'::regclass);


--
-- Name: exports id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.exports ALTER COLUMN id SET DEFAULT nextval('demo_first.exports_id_seq'::regclass);


--
-- Name: form_versions id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.form_versions ALTER COLUMN id SET DEFAULT nextval('demo_first.form_versions_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.leave_requests ALTER COLUMN id SET DEFAULT nextval('demo_first.leave_requests_id_seq'::regclass);


--
-- Name: listes id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.listes ALTER COLUMN id SET DEFAULT nextval('demo_first.listes_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.notes ALTER COLUMN id SET DEFAULT nextval('demo_first.notes_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.notifications ALTER COLUMN id SET DEFAULT nextval('demo_first.notifications_id_seq'::regclass);


--
-- Name: projets id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.projets ALTER COLUMN id SET DEFAULT nextval('demo_first.projets_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.roles ALTER COLUMN id SET DEFAULT nextval('demo_first.roles_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.submissions ALTER COLUMN id SET DEFAULT nextval('demo_first.submissions_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.tags ALTER COLUMN id SET DEFAULT nextval('demo_first.tags_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.users ALTER COLUMN id SET DEFAULT nextval('demo_first.users_id_seq'::regclass);


--
-- Name: activites activites_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.activites
    ADD CONSTRAINT activites_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: contact_projet contact_projet_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.contact_projet
    ADD CONSTRAINT contact_projet_pkey PRIMARY KEY (contact_id, projet_id);


--
-- Name: contact_tags contact_tags_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.contact_tags
    ADD CONSTRAINT contact_tags_pkey PRIMARY KEY (contact_id, tag_id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: document_tags document_tags_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.document_tags
    ADD CONSTRAINT document_tags_pkey PRIMARY KEY (document_id, tag_id);


--
-- Name: document_versions document_versions_document_id_version_no_key; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.document_versions
    ADD CONSTRAINT document_versions_document_id_version_no_key UNIQUE (document_id, version_no);


--
-- Name: document_versions document_versions_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.document_versions
    ADD CONSTRAINT document_versions_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: entreprises entreprises_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.entreprises
    ADD CONSTRAINT entreprises_pkey PRIMARY KEY (id);


--
-- Name: exports exports_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.exports
    ADD CONSTRAINT exports_pkey PRIMARY KEY (id);


--
-- Name: form_versions form_versions_form_id_version_key; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.form_versions
    ADD CONSTRAINT form_versions_form_id_version_key UNIQUE (form_id, version);


--
-- Name: form_versions form_versions_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.form_versions
    ADD CONSTRAINT form_versions_pkey PRIMARY KEY (id);


--
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (id);


--
-- Name: keycloak_users keycloak_users_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.keycloak_users
    ADD CONSTRAINT keycloak_users_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: listes listes_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.listes
    ADD CONSTRAINT listes_pkey PRIMARY KEY (id);


--
-- Name: message_reads message_reads_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.message_reads
    ADD CONSTRAINT message_reads_pkey PRIMARY KEY (message_id, user_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: notes_replies notes_replies_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.notes_replies
    ADD CONSTRAINT notes_replies_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: projets projets_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.projets
    ADD CONSTRAINT projets_pkey PRIMARY KEY (id);


--
-- Name: roles roles_code_key; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.roles
    ADD CONSTRAINT roles_code_key UNIQUE (code);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_audit_log_entity; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_audit_log_entity ON demo_first.audit_log USING btree (entity_type, entity_id);


--
-- Name: idx_audit_log_occurred_at; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_audit_log_occurred_at ON demo_first.audit_log USING btree (occurred_at);


--
-- Name: idx_conversations_is_group; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_conversations_is_group ON demo_first.conversations USING btree (is_group);


--
-- Name: idx_document_versions_doc_version; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_document_versions_doc_version ON demo_first.document_versions USING btree (document_id, version_no);


--
-- Name: idx_documents_owner_user_id; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_documents_owner_user_id ON demo_first.documents USING btree (owner_user_id);


--
-- Name: idx_documents_status; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_documents_status ON demo_first.documents USING btree (status);


--
-- Name: idx_listes_type; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_listes_type ON demo_first.listes USING btree (type);


--
-- Name: idx_tags_name; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_tags_name ON demo_first.tags USING btree (name);


--
-- Name: idx_users_email; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_users_email ON demo_first.users USING btree (email);


--
-- Name: idx_users_username; Type: INDEX; Schema: demo_first; Owner: postgres
--

CREATE INDEX idx_users_username ON demo_first.users USING btree (username);


--
-- Name: documents trg_documents_updated_at; Type: TRIGGER; Schema: demo_first; Owner: postgres
--

CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON demo_first.documents FOR EACH ROW EXECUTE FUNCTION demo_first.update_updated_at_column();


--
-- Name: roles trg_roles_updated_at; Type: TRIGGER; Schema: demo_first; Owner: postgres
--

CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON demo_first.roles FOR EACH ROW EXECUTE FUNCTION demo_first.update_updated_at_column();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: demo_first; Owner: postgres
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON demo_first.users FOR EACH ROW EXECUTE FUNCTION demo_first.update_updated_at_column();


--
-- Name: activites activites_contact_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.activites
    ADD CONSTRAINT activites_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES demo_first.contacts(id) ON DELETE SET NULL;


--
-- Name: activites activites_projet_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.activites
    ADD CONSTRAINT activites_projet_id_fkey FOREIGN KEY (projet_id) REFERENCES demo_first.projets(id) ON DELETE SET NULL;


--
-- Name: audit_log audit_log_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.audit_log
    ADD CONSTRAINT audit_log_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES demo_first.users(id) ON DELETE SET NULL;


--
-- Name: contact_projet contact_projet_contact_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.contact_projet
    ADD CONSTRAINT contact_projet_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES demo_first.contacts(id) ON DELETE CASCADE;


--
-- Name: contact_projet contact_projet_projet_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.contact_projet
    ADD CONSTRAINT contact_projet_projet_id_fkey FOREIGN KEY (projet_id) REFERENCES demo_first.projets(id) ON DELETE CASCADE;


--
-- Name: contact_tags contact_tags_contact_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.contact_tags
    ADD CONSTRAINT contact_tags_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES demo_first.contacts(id) ON DELETE CASCADE;


--
-- Name: contact_tags contact_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.contact_tags
    ADD CONSTRAINT contact_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES demo_first.tags(id) ON DELETE CASCADE;


--
-- Name: contacts contacts_entreprise_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.contacts
    ADD CONSTRAINT contacts_entreprise_id_fkey FOREIGN KEY (entreprise_id) REFERENCES demo_first.entreprises(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES demo_first.conversations(id) ON DELETE CASCADE;


--
-- Name: document_tags document_tags_document_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.document_tags
    ADD CONSTRAINT document_tags_document_id_fkey FOREIGN KEY (document_id) REFERENCES demo_first.documents(id) ON DELETE CASCADE;


--
-- Name: document_tags document_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.document_tags
    ADD CONSTRAINT document_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES demo_first.tags(id) ON DELETE CASCADE;


--
-- Name: document_versions document_versions_document_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.document_versions
    ADD CONSTRAINT document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES demo_first.documents(id) ON DELETE CASCADE;


--
-- Name: documents documents_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.documents
    ADD CONSTRAINT documents_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES demo_first.users(id);


--
-- Name: form_versions form_versions_form_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.form_versions
    ADD CONSTRAINT form_versions_form_id_fkey FOREIGN KEY (form_id) REFERENCES demo_first.forms(id) ON DELETE CASCADE;


--
-- Name: listes listes_parent_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.listes
    ADD CONSTRAINT listes_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES demo_first.listes(id) ON DELETE CASCADE;


--
-- Name: message_reads message_reads_message_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.message_reads
    ADD CONSTRAINT message_reads_message_id_fkey FOREIGN KEY (message_id) REFERENCES demo_first.messages(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES demo_first.conversations(id) ON DELETE CASCADE;


--
-- Name: notes notes_contact_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.notes
    ADD CONSTRAINT notes_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES demo_first.contacts(id) ON DELETE CASCADE;


--
-- Name: notes_replies notes_replies_note_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.notes_replies
    ADD CONSTRAINT notes_replies_note_id_fkey FOREIGN KEY (note_id) REFERENCES demo_first.notes(id) ON DELETE CASCADE;


--
-- Name: notes_replies notes_replies_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.notes_replies
    ADD CONSTRAINT notes_replies_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES demo_first.keycloak_users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_note_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.notifications
    ADD CONSTRAINT notifications_note_id_fkey FOREIGN KEY (note_id) REFERENCES demo_first.notes(id) ON DELETE CASCADE;


--
-- Name: projets projets_entreprise_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.projets
    ADD CONSTRAINT projets_entreprise_id_fkey FOREIGN KEY (entreprise_id) REFERENCES demo_first.entreprises(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES demo_first.roles(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: demo_first; Owner: postgres
--

ALTER TABLE ONLY demo_first.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES demo_first.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict fwQMsvFOB9Fqjy2MX7mjgqRzCJnRZcqF0TenYI7Yc90jh5SzJZnVYAxNYBcnLzk

