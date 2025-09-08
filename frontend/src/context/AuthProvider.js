// src/context/AuthProvider.js
import React, { createContext, useEffect, useState } from "react"
import keycloak from "../keycloak"   // ⚡ on utilise ton fichier keycloak existant

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Initialisation Keycloak
    keycloak.init({
      onLoad: "login-required",   // force le login si pas connecté
      checkLoginIframe: true,     // vérifie la session côté serveur
      pkceMethod: "S256",         // PKCE pour plus de sécurité
    }).then(auth => {
      setAuthenticated(auth)
      if (auth) {
        setToken(keycloak.token)
      }
    }).catch(err => {
      console.error("❌ Erreur Keycloak init:", err)
    })

    // Rafraîchissement auto du token
    const refreshInterval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak.updateToken(60).then(refreshed => {
          if (refreshed) {
            console.log("🔄 Token rafraîchi")
            setToken(keycloak.token)
          }
        }).catch(() => {
          console.error("❌ Token refresh échoué, logout")
          keycloak.logout()
        })
      }
    }, 20000) // toutes les 20s, vérifie si le token expire dans <60s

    return () => clearInterval(refreshInterval)
  }, [])

  return (
    <AuthContext.Provider value={{ keycloak, authenticated, token }}>
      {children}
    </AuthContext.Provider>
  )
}
