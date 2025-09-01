import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'

import './scss/style.scss'
import './scss/examples.scss'

import routes from './routes'
import PrivateRoute from './components/PrivateRoute'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Callback = React.lazy(() => import('./views/pages/login/Callback'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Unauthorized = React.lazy(() => import('./views/pages/unauthorized/Unauthorized'))

import { API_THEME } from 'src/api'

const App = () => {
  const { setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

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
        console.error('❌ Impossible de charger les couleurs dynamiques', err)
      }
    }

    loadColors()
  }, [])

  return (
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

  {/* Toutes les pages privées passent par le layout */}
  <Route
    path="*"
    element={
      <PrivateRoute>
        <DefaultLayout />
      </PrivateRoute>
    }
  />
</Routes>


      </Suspense>
    </BrowserRouter>
  )
}

export default App
