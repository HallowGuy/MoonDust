// src/components/ProtectedRoute.js
import React, { useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { PermissionsContext } from "../context/PermissionsContext"
import { isTokenExpired } from "../lib/http"
import { rolesFromToken } from "../lib/jwt"
import { CLIENT_ID } from "../api"

const norm = (arr = []) =>
  arr
    .map((r) => String(r).toLowerCase())
    .filter(Boolean)
    .filter((r) => r !== "uma_authorization")

const ProtectedRoute = ({ action, children }) => {
  // 1) Auth basique
  const token = localStorage.getItem("access_token")
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("access_token")
    console.log("🔑 Token actuel:", token)
console.log("⏳ Expiré ?", isTokenExpired(token))
console.log("👤 Rôles détectés:", userRoles)

    return <Navigate to="/login" replace />
  }

  // 2) Rôles : contexte si dispo, sinon fallback depuis le JWT
  const { routesConfig, currentUserRoles } = useContext(PermissionsContext)
  const userRoles = norm(
    currentUserRoles && currentUserRoles.length
      ? currentUserRoles
      : rolesFromToken(token, CLIENT_ID)
  )

  // 3) Autorisation par routesConfig
  const location = useLocation()
  const currentPath = action || location.pathname

  if (!routesConfig || Object.keys(routesConfig).length === 0) {
    return children
  }

  const allowedRoles = norm(routesConfig?.[currentPath] || routesConfig?.["*"] || [])

  if (allowedRoles.length === 0) return children

  const canAccess = userRoles.some((role) => allowedRoles.includes(role))
  if (!canAccess) {
    console.warn(`⛔ Accès refusé à la route: ${currentPath}`, { userRoles, allowedRoles })
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
