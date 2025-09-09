// src/App.js
import React, { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

import "./scss/style.scss"
import "./scss/examples.scss"
import './scss/custom.css';
import "./formio-setup"
import "formiojs/dist/formio.full.min.css"
import "./style/formio-overrides.scss"
import { CButton } from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilChatBubble } from "@coreui/icons"
import keycloak from "./keycloak.js";

import ProtectedRoute from "./components/ProtectedRoute"
import { API_THEME, API_ACTIONS_CONFIG, API_ROUTES_CONFIG, CLIENT_ID } from "./api"
import { rolesFromToken, decodeJwt } from "./lib/http"
import { PermissionsContext } from "./context/PermissionsContext"
import MessengerWidget from "./views/widgets/WidgetMessenger"
import { useMessenger } from "src/context/MessengerContext"
import WidgetMessenger from "src/views/widgets/WidgetMessenger"
import { MessengerProvider } from "src/context/MessengerContext"
import FloatingMessengerButton from "src/components/FloatingMessengerButton"


// imports directs
import DefaultLayout from "./layout/DefaultLayout"
import Page404 from "./views/pages/page404/Page404"
import Page500 from "./views/pages/page500/Page500"
import Unauthorized from "./views/pages/unauthorized/Unauthorized"
import Login from "./views/pages/login/Login"
import Register from "./views/pages/register/Register"
import Callback from "./views/pages/login/Callback"


function MessengerWrapper() {
  const location = useLocation()
  const hiddenRoutes = ["/login", "/register", "/callback"]

  // Vérifie si on est dans une route cachée
  if (hiddenRoutes.includes(location.pathname)) {
    return null
  }

  return <FloatingMessengerButton />
}
function App() {
  useSelector((s) => s.theme)

  const [actionsConfig, setActionsConfig] = useState({})
  const [routesConfig, setRoutesConfig] = useState({})
  const [currentUserRoles, setCurrentUserRoles] = useState(
    rolesFromToken(localStorage.getItem("access_token"), CLIENT_ID)
  )
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Vérifie le token dans le localStorage au démarrage
  // Vérifie le token dans le localStorage au démarrage
useEffect(() => {
  const token = localStorage.getItem("access_token")
  if (token) {
    const payload = decodeJwt(token)
    if (payload && payload.exp * 1000 > Date.now()) {
      setIsAuthenticated(true)
      setCurrentUserRoles(rolesFromToken(token, CLIENT_ID))

      // 🔎 Debug
      console.log("✅ Token trouvé au démarrage :", token)
      console.log("👤 Payload :", payload)
      console.log("📌 Rôles utilisateur :", rolesFromToken(token, CLIENT_ID))
    } else {
      localStorage.removeItem("access_token")
      setIsAuthenticated(false)
      console.warn("⚠️ Token expiré au démarrage → suppression")
    }
  } else {
    console.log("ℹ️ Aucun token trouvé au démarrage")
  }
}, [])


  // ✅ écouter les changements de token (multi-onglets)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "access_token") {
        const token = localStorage.getItem("access_token")
        if (token) {
          setIsAuthenticated(true)
          setCurrentUserRoles(rolesFromToken(token, CLIENT_ID))
        } else {
          setIsAuthenticated(false)
          setCurrentUserRoles([])
        }
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // Couleurs dynamiques
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API_THEME}/current`, { cache: "no-store" })
        const colors = await res.json()
        Object.entries(colors).forEach(([k, v]) =>
          document.documentElement.style.setProperty(`--bs-${k}`, v)
        )
      } catch (e) {
        console.error("❌ Impossible de charger les couleurs dynamiques", e)
      }
    })()
  }, [])

  // Config actions
  useEffect(() => {
    fetch(API_ACTIONS_CONFIG, { cache: "no-store" })
      .then((r) => r.json())
      .then(setActionsConfig)
      .catch((e) => console.error("❌ Erreur fetch actions config:", e))
  }, [])

  // Config routes
  useEffect(() => {
    fetch(API_ROUTES_CONFIG, { cache: "no-store" })
      .then((r) => r.json())
      .then(setRoutesConfig)
      .catch((e) => console.error("❌ Erreur fetch routes config:", e))
  }, [])

  return (
    <PermissionsContext.Provider
    value={{
      actionsConfig,
      setActionsConfig,
      routesConfig,
      setRoutesConfig,
      currentUserRoles,
      setCurrentUserRoles,
    }}
  >
    <MessengerProvider>
      <BrowserRouter>
        <Routes>
          {/* Pages publiques */}

  {/* Pages publiques */}
  <Route path="/register" element={<Register />} />
  <Route path="/callback" element={<Callback />} />
  <Route path="/unauthorized" element={<Unauthorized />} />
  <Route path="/404" element={<Page404 />} />
  <Route path="/500" element={<Page500 />} />
    <Route
  path="/login"
  element={
    isAuthenticated ? (
      <Navigate to="/" replace />
    ) : (
      <Login />
    )
  }
/>


  {/* Autres pages protégées */}
  <Route
    path="/*"
    element={
      <ProtectedRoute>
        <DefaultLayout />
      </ProtectedRoute>
    }
  />
</Routes>

        {/* ✅ Bouton flottant et widget */}
        <MessengerWrapper />
        <WidgetMessenger />
      </BrowserRouter>
    </MessengerProvider>
  </PermissionsContext.Provider>
)
}

export default App
