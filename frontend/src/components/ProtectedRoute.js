// src/components/ProtectedRoute.js
import React, { useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { PermissionsContext } from "../context/PermissionsContext"
import { CSpinner } from "@coreui/react"

const ProtectedRoute = ({ action, children }) => {
  const { routesConfig, currentUserRoles } = useContext(PermissionsContext)
  const location = useLocation()

  const currentPath = action || location.pathname
  const userRoles = (currentUserRoles || []).map(r => r.toLowerCase())
  const allowedRoles = (routesConfig?.[currentPath] || routesConfig?.["*"] || []).map(r =>
    r.toLowerCase()
  )

  console.log("🔒 Vérification ProtectedRoute", {
    currentPath,
    allowedRoles,
    userRoles,
  })

  // Si la config ou les rôles ne sont pas encore chargés → on attend
  if (!routesConfig || Object.keys(routesConfig).length === 0 || userRoles.length === 0) {
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    )
  }

  // Vérifie si l'utilisateur a le droit
  const canAccess = userRoles.some(role => allowedRoles.includes(role))

  if (!canAccess) {
    console.warn(`⛔ Accès refusé à la route: ${currentPath}`)
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
