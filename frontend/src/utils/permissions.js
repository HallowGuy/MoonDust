// src/utils/permissions.js
export function canPerform(userRoles, entity, action, config) {
  if (!userRoles || !entity || !action) return false
  const allowedRoles = config[entity]?.[action] || []
  return userRoles.some((r) => allowedRoles.includes(r))
}
