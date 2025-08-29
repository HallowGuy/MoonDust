// Centralized API base with sensible default for Nginx proxy
export const API_BASE = import.meta.env?.VITE_API_URL || '/api'

