export const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5001/api'

// Endpoints spécifiques
export const API_USERS = `${API_BASE}/users`
export const API_ROLES = `${API_BASE}/roles`
export const API_CONGES = `${API_BASE}/conges`
export const API_DOCS = `${API_BASE}/documents`
