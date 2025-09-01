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
export const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL
export const REALM = import.meta.env.VITE_KEYCLOAK_REALM
export const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID

// Base URL Admin Keycloak
export const BASE_URL = `${KEYCLOAK_URL}/admin/realms/${REALM}`

// ---------- ENDPOINTS UTILISATEURS ----------
export const API_USERS = `${API_BASE}/users`
export const API_USER_ROLES = (userId) => `${API_BASE}/users/${userId}/roles`

// ---------- ENDPOINTS ROLES ----------
export const API_ROLES = `${API_BASE}/roles`
export const API_ROLE_USERS = (roleName) => `${API_ROLES}/${roleName}/users`

// ---------- ENDPOINTS ROUTES CONFIG ----------
export const API_ROUTES_CONFIG = `${API_BASE}/routes-config`
