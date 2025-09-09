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
  const token = localStorage.getItem("access_token")

  // 🚩 Vérif token AVANT tout le reste
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("access_token")
    console.log("🔑 Token invalide → redirection login")
    return <Navigate to="/login" replace />
  }

  // ✅ Si token valide, seulement là on calcule les rôles
  const { routesConfig, currentUserRoles } = useContext(PermissionsContext)
  const userRoles = norm(
    currentUserRoles && currentUserRoles.length
      ? currentUserRoles
      : rolesFromToken(token, CLIENT_ID)
  )

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
