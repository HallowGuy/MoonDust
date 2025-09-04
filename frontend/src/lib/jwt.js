// Decode base64url → JSON
function b64urlDecode(b64url) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  return atob(b64);
}
export function decodeJwt(token) {
  try { return JSON.parse(b64urlDecode(token.split(".")[1])); } catch { return null; }
}
/** Rôles Keycloak (realm + client) en minuscules et uniques */
export function rolesFromToken(token, clientId) {
  const p = decodeJwt(token);
  if (!p) return [];
  const realm = Array.isArray(p?.realm_access?.roles) ? p.realm_access.roles : [];
  const client = Array.isArray(p?.resource_access?.[clientId]?.roles) ? p.resource_access[clientId].roles : [];
  return [...new Set([...realm, ...client].map(r => r.toLowerCase()))];
}
