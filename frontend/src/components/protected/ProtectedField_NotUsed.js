// src/components/ProtectedField.js
import React from "react"

const norm = (arr = []) =>
  arr
    .map((r) => String(r).toLowerCase())
    .filter(Boolean)
    .filter((r) => r !== "uma_authorization")

/**
 * strategy:
 *  - "disable": rend les champs désactivés (par défaut)
 *  - "readonly": applique readOnly aux champs texte
 *  - "hide": masque complètement le/les enfant(s)
 */
const ProtectedField = ({
  actionsConfig,
  currentUserRoles,
  action,
  strategy = "disable",
  children,
}) => {
  if (!actionsConfig || !action) return null

  const actionConf = actionsConfig[action]
  const allowedRoles = Array.isArray(actionConf)
    ? actionConf
    : actionConf && Array.isArray(actionConf.roles)
      ? actionConf.roles
      : []

  const token = localStorage.getItem("access_token")
  let roles = currentUserRoles
  if (!roles || !roles.length) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      roles =
        payload.roles ||
        payload.authorities ||
        payload["realm_access"]?.roles ||
        payload["cognito:groups"] ||
        (typeof payload.scope === "string" ? payload.scope.split(" ") : []) ||
        []
    } catch {
      roles = []
    }
  }

  const allowedN = norm(allowedRoles)
  const userN = norm(roles)
  const hasAccess = userN.some((r) => allowedN.includes(r))

  if (hasAccess) return <>{children}</>
  if (strategy === "hide") return null

  // disable / readonly : clone chaque enfant et applique les props
  const applyLock = (child) => {
    if (!React.isValidElement(child)) return child
    const extraProps =
      strategy === "readonly"
        ? { readOnly: true, "data-protected": "readonly" }
        : { disabled: true, "aria-disabled": true, "data-protected": "disabled" }
    return React.cloneElement(child, { ...extraProps })
  }

  return (
    <>
      {React.Children.map(children, (child) => applyLock(child))}
    </>
  )
}

export default ProtectedField
