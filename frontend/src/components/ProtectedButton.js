import React from "react"

const ProtectedButton = ({ action, actionsConfig, currentUserRoles, children }) => {
  if (!actionsConfig || !currentUserRoles) return null

  // 🔎 Rôles autorisés depuis le JSON
  const allowedRoles = (actionsConfig[action] || []).map(r => r.toLowerCase())

  // 🔎 Rôles de l'utilisateur normalisés
  const userRoles = currentUserRoles.map(r => r.toLowerCase())

  console.log(`🛡️ Action: ${action}`)
  console.log("👉 AllowedRoles:", allowedRoles)
  console.log("👉 UserRoles:", userRoles)

  // ✅ Vérifie si au moins un rôle correspond
  const canAccess = userRoles.some(role => allowedRoles.includes(role))

  if (!canAccess) return null

  return <>{children}</>
}

export default ProtectedButton
