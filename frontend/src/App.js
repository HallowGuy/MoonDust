// src/App.js
import React, { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

import "./scss/style.scss"
import "./scss/examples.scss"
import "./scss/custom.css"
import "./formio-setup"
import "formiojs/dist/formio.full.min.css"
import "./style/formio-overrides.scss"

import ProtectedRoute from "./components/protected/ProtectedRoute"
import { API_THEME, API_ACTIONS_CONFIG, API_ROUTES_CONFIG, CLIENT_ID } from "./api"
import { rolesFromToken, decodeJwt } from "./lib/http"
import { PermissionsContext } from "./context/PermissionsContext"
import WidgetMessenger from "src/views/widgets/WidgetMessenger"
import { MessengerProvider } from "src/context/MessengerContext"
import FloatingMessengerButton from "src/components/messenger/FloatingMessengerButton"

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

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    const payload = decodeJwt(token)
    if (payload && payload.exp * 1000 > Date.now()) {
      setIsAuthenticated(true)
      setCurrentUserRoles(rolesFromToken(token, CLIENT_ID))
      return
    }

    localStorage.removeItem("access_token")
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "access_token") return

      const token = localStorage.getItem("access_token")
      if (token) {
        setIsAuthenticated(true)
        setCurrentUserRoles(rolesFromToken(token, CLIENT_ID))
      } else {
        setIsAuthenticated(false)
        setCurrentUserRoles([])
      }
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await fetch(`${API_THEME}/current`, { cache: "no-store" })
        const colors = await res.json()
        for (const [key, value] of Object.entries(colors)) {
          document.documentElement.style.setProperty(`--bs-${key}`, value)
        }
      } catch (err) {
        console.error("Unable to load dynamic colors", err)
      }
    }

    loadTheme()
  }, [])

  useEffect(() => {
    fetch(API_ACTIONS_CONFIG, { cache: "no-store" })
      .then((r) => r.json())
      .then(setActionsConfig)
      .catch((err) => console.error("Failed to load actions config", err))
  }, [])

  useEffect(() => {
    fetch(API_ROUTES_CONFIG, { cache: "no-store" })
      .then((r) => r.json())
      .then(setRoutesConfig)
      .catch((err) => console.error("Failed to load routes config", err))
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
            <Route path="/register" element={<Register />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<Page404 />} />
            <Route path="/500" element={<Page500 />} />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DefaultLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
          <MessengerWrapper />
          <WidgetMessenger />
        </BrowserRouter>
      </MessengerProvider>
    </PermissionsContext.Provider>
  )
}

export default App
