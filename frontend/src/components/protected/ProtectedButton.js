// src/components/ProtectedButton.js
import React from "react"
import { rolesFromToken } from "../../lib/jwt"   // adapte si alias
import { CLIENT_ID } from "../../api"

const norm = (arr = []) =>
  arr
    .map((r) => String(r).toLowerCase())
    .filter(Boolean)
    .filter((r) => r !== "uma_authorization")

const ProtectedButton = ({ actionsConfig, currentUserRoles, action, children }) => {
  if (!actionsConfig || !action) return null

  const actionConf = actionsConfig[action]
  const allowedRoles = Array.isArray(actionConf)
    ? actionConf
    : actionConf && Array.isArray(actionConf.roles)
      ? actionConf.roles
      : []

  // Fallback : si le contexte est vide, on lit les rôles dans le JWT
  const token = localStorage.getItem("access_token")
  const roles =
    currentUserRoles && currentUserRoles.length
      ? currentUserRoles
      : rolesFromToken(token, CLIENT_ID)

  const allowedN = norm(allowedRoles)
  const userN = norm(roles)

  // Debug utile
  //console.debug("ProtectedButton check", { action, actionConf, allowedRoles: allowedN, currentUserRoles: userN })

  const hasAccess = userN.some((r) => allowedN.includes(r))
  return hasAccess ? <>{children}</> : null
}

export default ProtectedButton
