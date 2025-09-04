// src/App.js
import React, { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useSelector } from "react-redux"

import "./scss/style.scss"
import "./scss/examples.scss"
import "./formio-setup"
import "formiojs/dist/formio.full.min.css"
import "./style/formio-overrides.scss"

import ProtectedRoute from "./components/ProtectedRoute"
import { API_THEME, API_ACTIONS_CONFIG, API_ROUTES_CONFIG, CLIENT_ID } from "./api"
import { rolesFromToken } from "./lib/jwt"
import { PermissionsContext } from "./context/PermissionsContext"

// imports directs (pas de lazy pendant le debug)
import DefaultLayout from "./layout/DefaultLayout"
import Login from "./views/pages/login/Login"
import Register from "./views/pages/register/Register"
import Callback from "./views/pages/login/Callback"
import Page404 from "./views/pages/page404/Page404"
import Page500 from "./views/pages/page500/Page500"
import Unauthorized from "./views/pages/unauthorized/Unauthorized"

function App() {
  // garde si tu utilises vraiment le thème ailleurs
  useSelector((s) => s.theme)

  const [actionsConfig, setActionsConfig] = useState({})
  const [routesConfig, setRoutesConfig] = useState({})

  // ✅ rôles init depuis le JWT (pas d'appel réseau)
  const initialRoles = rolesFromToken(localStorage.getItem("access_token"), CLIENT_ID)
  const [currentUserRoles, setCurrentUserRoles] = useState(initialRoles)

  // ✅ si le token change (login/logout/refresh), on met à jour le contexte
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "access_token") {
        setCurrentUserRoles(
          rolesFromToken(localStorage.getItem("access_token"), CLIENT_ID)
        )
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
      <BrowserRouter>
        <Routes>
          {/* Pages publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

          {/* ✅ parent avec wildcard : toutes les routes de l'app passent ici
              - si pas loggué → ProtectedRoute renvoie /login
              - si loggué → DefaultLayout rend tes sous-routes (sidebar, etc.)
          */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </PermissionsContext.Provider>
  )
}

export default App
