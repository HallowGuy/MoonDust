// Decode base64url → JSON
function b64urlDecode(b64url) {
  const b64 = b64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(b64url.length / 4) * 4, "=")
  return atob(b64)
}

export function decodeJwt(token) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    return JSON.parse(b64urlDecode(parts[1]))
  } catch (e) {
    console.error("❌ Erreur decodeJwt :", e)
    return null
  }
}

export function isTokenExpired(token) {
  try {
    const payload = decodeJwt(token)
    if (!payload || !payload.exp) return true

    const expMs = payload.exp * 1000
    const now = Date.now()

    console.log("🕑 Vérif token", {
      exp: new Date(expMs).toISOString(),
      now: new Date(now).toISOString(),
    })

    return expMs < now
  } catch (e) {
    console.error("❌ Erreur isTokenExpired :", e)
    return true
  }
}

/** Rôles Keycloak (realm + client) en minuscules et uniques */
export function rolesFromToken(token, clientId) {
  const p = decodeJwt(token)
  if (!p) return []

  const realm = Array.isArray(p?.realm_access?.roles) ? p.realm_access.roles : []
  const client = Array.isArray(p?.resource_access?.[clientId]?.roles)
    ? p.resource_access[clientId].roles
    : []

  return [...new Set([...realm, ...client].map((r) => r.toLowerCase()))]
}
