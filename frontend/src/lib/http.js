// src/lib/http.js (extrait utile)
export function isTokenExpired(token) {
  try {
    const [, payload] = token.split(".")
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    // marge de 30s pour éviter la frontière d'expiration
    return (json.exp * 1000) - 30000 < Date.now()
  } catch {
    return true
  }
}
