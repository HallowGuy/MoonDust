// Base API (backend proxy)
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
export const API_THEME_LOGO = `${API_BASE}/theme/logo`

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
export const API_USER_ME_ROLES = `${API_USERS}/me/roles`

// ---------- ENDPOINTS ROLES ----------
export const API_GROUPES = `${API_BASE}/groupes`
export const API_GROUPE_USERS = (groupeId) => `${API_GROUPES}/${groupeId}/users`

export const API_GROUPE_SUBGROUPS = (id) => `${API_GROUPES}/${id}/subgroups`


// ---------- ENDPOINTS ROUTES CONFIG ----------
export const API_ROUTES_CONFIG = `${API_BASE}/routes-config`
export const API_ACTIONS_CONFIG = `${API_BASE}/actions-config`

// ---------- ENDPOINTS FORM CONFIG ----------
export const API_FORM_CONFIG = `${API_BASE}/forms`

