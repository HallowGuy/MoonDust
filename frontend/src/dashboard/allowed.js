import { rolesFromToken } from 'src/lib/jwt'
import { CLIENT_ID } from 'src/api'

// Coerce n'importe quoi -> array plate
const toArrayDeep = (v) => {
  if (!v) return []
  if (Array.isArray(v)) return v.flat ? v.flat(Infinity) : v.reduce((a, b) => a.concat(b), [])
  if (v instanceof Set) return Array.from(v)
  if (typeof v === 'object') return Object.values(v).flat ? Object.values(v).flat(Infinity) : [].concat(...Object.values(v))
  return [v]
}

export const norm = (v) =>
  toArrayDeep(v)
    .map((r) => String(r).toLowerCase().trim())
    .filter(Boolean)
    .filter((r) => r !== 'uma_authorization')

// Rôles utilisateur (préférence aux rôles passés en paramètre)
export function getCurrentUserRoles(fallbackRoles) {
  const fb = norm(fallbackRoles)
  if (fb.length) return fb

  const token = localStorage.getItem('access_token')
  const fromJwt = rolesFromToken(token, CLIENT_ID)
  // Peut être: array, {roles:[]}, {all:[]}, {realm:[], client:[]}, etc.
  return norm(
    Array.isArray(fromJwt)
      ? fromJwt
      : (fromJwt?.roles ??
         fromJwt?.all ??
         Object.values(fromJwt || {})) // ex: realm/client
  )
}

export function hasAccessForAction(action, actionsConfig, userRoles) {
  if (!action) return true // pas d'action => visible pour tous
  const conf = actionsConfig?.[action]
  const allowed = Array.isArray(conf) ? conf : (Array.isArray(conf?.roles) ? conf.roles : [])
  const allowedN = norm(allowed)
  const userN = norm(userRoles)
  return userN.some((r) => allowedN.includes(r))
}

export function computeAllowedIds(WIDGETS_REGISTRY, actionsConfig, userRoles) {
  const userN = norm(userRoles)
  return Object.entries(WIDGETS_REGISTRY)
    .filter(([, def]) => hasAccessForAction(def.action, actionsConfig, userN))
    .map(([id]) => id)
}
