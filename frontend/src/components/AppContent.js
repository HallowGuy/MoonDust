import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'

import routes from '../routes'
import PrivateRoute from './PrivateRoute'

const AppContent = () => {
  return (
    <Suspense fallback={<CSpinner color="primary" />}>
      <Routes>
        {routes.map((route, idx) => {
          const Element = route.element
          if (!Element) return null
          
          return (
            <Route
              key={idx}
              path={route.path}
              exact={route.exact}
              name={route.name}
              element={
                route.roles ? (
                  <PrivateRoute roles={route.roles}>
                    <Element />
                  </PrivateRoute>
                ) : (
                  <Element />
                )
              }
            />
          )
        })}
        <Route path="/" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default React.memo(AppContent)
