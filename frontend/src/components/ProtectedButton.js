import React, { useEffect, useState,useContext } from "react"
import { PermissionsContext } from "src/context/PermissionsContext"
const ProtectedButton = ({ action, children }) => {
  const { actionsConfig, currentUserRoles } = useContext(PermissionsContext)

  if (!actionsConfig || !currentUserRoles) return null

  const allowedRoles = (actionsConfig[action] || []).map(r => r.toLowerCase())
  const userRoles = currentUserRoles.map(r => r.toLowerCase())

  const canAccess = userRoles.some(role => allowedRoles.includes(role))
  if (!canAccess) return null

  return <>{children}</>
}

export default ProtectedButton
