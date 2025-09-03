import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

const PrivateRoute = ({ children, routePath, routesConfig }) => {
  const token = localStorage.getItem("access_token")
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} />
  }

  try {
    const decoded = jwtDecode(token)
    const userRoles = decoded?.realm_access?.roles || []

    // Rôles autorisés pour cette route
    const allowedRoles = routesConfig[routePath] || []

    console.log("🔑 Rôles utilisateur:", userRoles)
    console.log("✅ Rôles requis pour", routePath, ":", allowedRoles)

    // Vérifie si intersection
    if (allowedRoles.length && !allowedRoles.some(r => userRoles.includes(r))) {
      return <Navigate to="/unauthorized" />
    }

    return children
  } catch (e) {
    console.error("❌ Token invalide", e)
    return <Navigate to="/login" />
  }
}

export default PrivateRoute
