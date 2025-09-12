// Base API (backend proxy)
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
export const API_THEME_LOGO = `${API_BASE}/theme/logo`
export const API_BACKEND = `http://localhost:5001`

// ---------------------
// Endpoints spécifiques
// ---------------------
export const API_CONGES = `${API_BASE}/conges`
export const API_DOCS = `${API_BASE}/documents`
export const API_THEME = `${API_BASE}/theme`

// ---------------------
// Keycloak
// ---------------------
// Align with frontend/.env keys and add safe fallbacks
// Allows runtime override via window.__ENV if served statically.
const runtimeEnv = typeof window !== 'undefined' ? (window.__ENV || {}) : {}
export const KEYCLOAK_URL =
  import.meta.env.VITE_KEYCLOAK_URL || runtimeEnv.VITE_KEYCLOAK_URL || 'http://localhost:8081'
export const REALM =
  import.meta.env.VITE_REALM || runtimeEnv.VITE_REALM || 'REALM_REUNION'
export const CLIENT_ID =
  import.meta.env.VITE_FRONT_ID || runtimeEnv.VITE_FRONT_ID || 'react-app'

if (typeof window !== 'undefined') {
  if (!import.meta.env.VITE_KEYCLOAK_URL && !runtimeEnv.VITE_KEYCLOAK_URL) {
    console.warn('[config] VITE_KEYCLOAK_URL missing – using default', KEYCLOAK_URL)
  }
  if (!import.meta.env.VITE_REALM && !runtimeEnv.VITE_REALM) {
    console.warn('[config] VITE_REALM missing – using default', REALM)
  }
  if (!import.meta.env.VITE_FRONT_ID && !runtimeEnv.VITE_FRONT_ID) {
    console.warn('[config] VITE_FRONT_ID missing – using default', CLIENT_ID)
  }
}

// Base URL Admin Keycloak
export const BASE_URL = `${KEYCLOAK_URL}/admin/realms/${REALM}`

// ---------- ENDPOINTS UTILISATEURS ----------
export const API_USERS = `${API_BASE}/users`
export const API_USER_ROLES = (userId) => `${API_BASE}/users/${userId}/roles`

// ---------- ENDPOINTS ROLES ----------
export const API_ROLES = `${API_BASE}/roles`
export const API_ROLE_USERS = (roleName) => `${API_ROLES}/${roleName}/users`

// ---------- ENDPOINTS ROLES ----------
export const API_GROUPES = `${API_BASE}/groupes`
export const API_GROUPE_USERS = (groupeId) => `${API_GROUPES}/${groupeId}/users`

export const API_GROUPE_SUBGROUPS = (id) => `${API_GROUPES}/${id}/subgroups`


// ---------- ENDPOINTS ROUTES CONFIG ----------
export const API_ROUTES_CONFIG = `${API_BASE}/routes-config`
export const API_ACTIONS_CONFIG = `${API_BASE}/actions-config`

// ---------- ENDPOINTS FORM CONFIG ----------

// ---------- ENDPOINTS ACTIVITÉS ----------
export const API_ACTIVITES = `${API_BASE}/activites`
export const API_ACTIVITE_DETAIL = (id) => `${API_ACTIVITES}/${id}`

// ---------- ENDPOINTS CONTACTS ----------
export const API_CONTACTS = `${API_BASE}/contacts`
export const API_CONTACT_DETAIL = (id) => `${API_CONTACTS}/${id}`

// ---------- ENDPOINTS ENTREPRISES ----------
export const API_ENTREPRISES = `${API_BASE}/entreprises`
export const API_ENTREPRISE_DETAIL = (id) => `${API_ENTREPRISES}/${id}`

// ---------- ENDPOINTS EXPORTS ----------
export const API_EXPORTS = `${API_BASE}/exports`
export const API_EXPORT_DETAIL = (id) => `${API_EXPORTS}/${id}`

// ---------- ENDPOINTS PROJETS ----------
export const API_PROJETS = `${API_BASE}/projets`
export const API_PROJET_DETAIL = (id) => `${API_PROJETS}/${id}`

// ---------- ENDPOINTS TAGS ----------
export const API_TAGS = `${API_BASE}/tags`
export const API_TAG_DETAIL = (id) => `${API_TAGS}/${id}`

// ---------- ENDPOINTS LISTES ----------
export const API_LISTES = `${API_BASE}/listes`
export const API_LISTE_DETAIL = (id) => `${API_LISTES}/${id}`

// Récupérer toutes les valeurs d’un type
export const API_LISTES_BY_TYPE = (type) => `${API_LISTES}/${type}`

// Récupérer les sous-enfants d’un parent pour un type donné
export const API_LISTES_CHILDREN = (type, parentId) => `${API_LISTES}/${type}/${parentId}`

export const API_NOTES = `${API_BASE}/notes`
export const API_NOTES_BY_CONTACT = (contactId) => `${API_NOTES}/${contactId}`
export const API_MY_NOTIFICATIONS = `${API_NOTES}/notifications/me`

export const API_CONVERSATIONS = `${API_BASE}/conversations`

export const API_CONVERSATION = (id) => `${API_CONVERSATIONS}/${id}`

// Messages d'une conversation
export const API_CONVERSATION_MESSAGES = (id) =>
  `${API_CONVERSATIONS}/${id}/messages`

// Marquer comme lu
export const API_CONVERSATION_READ = (id) =>
  `${API_CONVERSATIONS}/${id}/read`

export const API_SUBMISSIONS = `${API_BASE}/submissions`
export const API_SUBMISSIONS_BY_FORM = (formId) => `${API_SUBMISSIONS}/${formId}`

// === Forms versionnés ===
export const API_FORMS = `${API_BASE}/forms`;
export const API_FORM_DETAIL = (id) => `${API_FORMS}/${id}`;
export const API_FORM_VERSIONS = (id) => `${API_FORMS}/${id}/versions`;
export const API_FORM_VERSION = (id, v) => `${API_FORMS}/${id}/versions/${v}`;
export const API_FORM_VERSION_PUBLISH = (id, v) => `${API_FORMS}/${id}/versions/${v}/publish`;
export const API_FORM_VERSION_ARCHIVE = (id, v) => `${API_FORMS}/${id}/versions/${v}/archive`;
export const API_FORM_VERSION_RESTORE = (id, v) => `${API_FORMS}/${id}/versions/${v}/restore`;

// Suppression
export const API_FORM_DELETE = (id) => `${API_FORMS}/${id}`;
export const API_FORM_VERSION_DELETE = (id, v) => `${API_FORMS}/${id}/versions/${v}`;

// Renommage (name only)
export const API_FORM_RENAME = (id) => `${API_FORMS}/${id}`; // via PATCH