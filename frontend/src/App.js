import React, { Suspense, useEffect, useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useSelector } from "react-redux"
import { CSpinner, useColorModes } from "@coreui/react"

import "./scss/style.scss"
import "./scss/examples.scss"
import "./formio-setup"
import "formiojs/dist/formio.full.min.css"
import "./style/formio-overrides.scss"

import ProtectedRoute from "./components/ProtectedRoute"
import { API_THEME, API_ACTIONS_CONFIG, API_BASE, API_ROUTES_CONFIG } from "src/api"
import { PermissionsContext } from "./context/PermissionsContext"

// Containers
const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"))

// Pages
const Login = React.lazy(() => import("./views/pages/login/Login"))
const Register = React.lazy(() => import("./views/pages/register/Register"))
const Callback = React.lazy(() => import("./views/pages/login/Callback"))
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"))
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"))
const Unauthorized = React.lazy(() => import("./views/pages/unauthorized/Unauthorized"))

const App = () => {
  const { setColorMode } = useColorModes("coreui-free-react-admin-template-theme")
  const storedTheme = useSelector((state) => state.theme)
  const [actionsConfig, setActionsConfig] = useState({})
  const [routesConfig, setRoutesConfig] = useState({})
  const [currentUserRoles, setCurrentUserRoles] = useState([])

  // Charger les couleurs dynamiques
  useEffect(() => {
    const loadColors = async () => {
      try {
        const res = await fetch(`${API_THEME}/current`)
        const colors = await res.json()
        const root = document.documentElement
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--bs-${key}`, value)
        })
      } catch (err) {
        console.error("❌ Impossible de charger les couleurs dynamiques", err)
      }
    }
    loadColors()
  }, [])

  // Charger la config des actions
  useEffect(() => {
    fetch(API_ACTIONS_CONFIG, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setActionsConfig(data))
      .catch((err) => console.error("❌ Erreur fetch actions config:", err))
  }, [])

  // Charger la config des routes
  useEffect(() => {
    fetch(API_ROUTES_CONFIG, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setRoutesConfig(data))
      .catch((err) => console.error("❌ Erreur fetch routes config:", err))
  }, [])

  // Charger les rôles utilisateur
  useEffect(() => {
    fetch(`${API_BASE}/me/roles`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔑 Rôles reçus:", data.roles)
        setCurrentUserRoles(data.roles || [])
      })
      .catch((err) => console.error("❌ Erreur fetch roles:", err))
  }, [])

  return (
    <PermissionsContext.Provider value={{ actionsConfig, setActionsConfig, routesConfig,setRoutesConfig, currentUserRoles, setCurrentUserRoles }}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <Routes>
            {/* Pages publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<Page404 />} />
            <Route path="/500" element={<Page500 />} />

            {/* Toutes les autres passent par ProtectedRoute */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <DefaultLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </PermissionsContext.Provider>
  )
}

export default App
