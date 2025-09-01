import React from 'react'
import { Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem('access_token')

  if (!token) {
    return <Navigate to="/login" />
  }

  try {
    const decoded = jwtDecode(token)
    const userRoles = decoded?.realm_access?.roles || []

    // Vérifie si l’utilisateur a au moins un rôle requis
    if (roles && !roles.some((r) => userRoles.includes(r))) {
      return <Navigate to="/unauthorized" />
    }

    return children
  } catch (e) {
    console.error('❌ Token invalide', e)
    return <Navigate to="/login" />
  }
}

export default PrivateRoute
