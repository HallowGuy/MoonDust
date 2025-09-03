// ProtectedButton.js
import React from "react"

const ProtectedButton = ({ actionsConfig, currentUserRoles, action, children }) => {
  if (!actionsConfig || !currentUserRoles) {
    console.log("❌ Missing actionsConfig or currentUserRoles")
    return null
  }

  const actionConf = actionsConfig[action]
  let allowedRoles = []

  if (Array.isArray(actionConf)) {
    allowedRoles = actionConf
  } else if (actionConf && Array.isArray(actionConf.roles)) {
    allowedRoles = actionConf.roles
  }

  console.log("🔎 ProtectedButton check", {
    action,
    actionConf,
    allowedRoles,
    currentUserRoles,
  })

  const hasAccess = currentUserRoles.some((role) => allowedRoles.includes(role))

  console.log(`➡️ Action "${action}" => accès ${hasAccess ? "✅ AUTORISÉ" : "⛔ REFUSÉ"}`)

  if (!hasAccess) return null
  return <>{children}</>
}

export default ProtectedButton
