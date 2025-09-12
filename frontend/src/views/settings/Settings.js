// src/views/Dashboard.jsx
import React, { useMemo, useState, useContext } from 'react'
import {
  CRow, CCol, CCard, CCardBody, CCardHeader, CAlert, CSpinner,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasTitle, COffcanvasBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilBolt } from '@coreui/icons'
import { Link } from 'react-router-dom'
import { getCurrentUserRoles, computeAllowedIds } from 'src/dashboard/allowed'

import { DashboardDataProvider } from 'src/dashboard/dashboard-data'
import { useDashboardPrefs } from 'src/dashboard/prefs/useDashboardPrefs'
import { WIDGETS_REGISTRY } from 'src/dashboard/registry'
import ProtectedButton from 'src/components/protected/ProtectedButton'
import { PermissionsContext } from 'src/context/PermissionsContext'
import SettingsDashboard from './EditDashboard'

const getUserDisplayName = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return 'Utilisateur'
    const payload = JSON.parse(atob(token.split('.')[1] || ''))
    return (
      payload?.name ||
      payload?.preferred_username ||
      payload?.email ||
      payload?.sub ||
      'Utilisateur'
    )
  } catch {
    return 'Utilisateur'
  }
}



const Dashboard = () => {
  // Contexte permissions (peut être indisponible au 1er render)
  const perms = useContext(PermissionsContext) || {}
  const actionsConfig = perms.actionsConfig || null
  const currentUserRoles = perms.currentUserRoles || null

  // IDs réels des widgets (mémoïsés pour stabilité des deps)
  const ALL_IDS = useMemo(() => Object.keys(WIDGETS_REGISTRY), [])

  // Prefs avec upgrade auto des nouveaux IDs
  const prefsApi = useDashboardPrefs('me', ALL_IDS)
  const { loading, error, prefs } = prefsApi

  // Rôles + filtrage autorisations
  const userRoles = getCurrentUserRoles(currentUserRoles)
  const allowedIds = useMemo(() => {
    if (!actionsConfig) return ALL_IDS // pas de conf -> on ne filtre pas
    return computeAllowedIds(WIDGETS_REGISTRY, actionsConfig, userRoles)
  }, [actionsConfig, userRoles, ALL_IDS])

  const [open, setOpen] = useState(false)
  const displayName = useMemo(getUserDisplayName, [])

  return (
    <DashboardDataProvider>
      <div className="container py-4" >
        <CCard className="mb-4 border-0 text-white"
          style={{ background: 'linear-gradient(135deg, rgb(26 69 161) 0%, rgb(72 117 180) 100%)' }}>
          <CCardBody className="d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-semibold">Bienvenue sur Moondust</div>
              <h2 className="mb-0">{displayName}</h2>
            </div>
            <div className="d-none d-sm-block">
              <CIcon icon={cilBolt} height={56} className="text-white" />
            </div>
          </CCardBody>
        </CCard>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <span>Tableau de bord</span>
            <CButton color="success" variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <CIcon icon={cilSettings} size="lg" />
            </CButton>
          </CCardHeader>

          <CCardBody>
            {loading ? (
              <div className="d-flex align-items-center gap-2">
                <CSpinner size="sm" /> Chargement des préférences…
              </div>
            ) : error ? (
              <CAlert color="danger">Impossible de charger les préférences.</CAlert>
            ) : null}

            <CRow xs={{ gutter: 4 }}>
              {(prefs?.order || [])
                .filter((id) => allowedIds.includes(id))
                .filter((id) => (prefs?.visible || []).includes(id))
                .map((id) => {
                  const def = WIDGETS_REGISTRY[id]
                  if (!def) {
                    console.warn('[Dashboard] Widget inconnu dans registry:', id)
                    return null
                  }
                  const Widget = def.component
                  if (!Widget) {
                    console.error('[Dashboard] component manquant pour', id, def)
                    return null
                  }

                  const content = def.to ? (
                    <Link
                      to={def.to}
                      className="d-block text-reset text-decoration-none"
                      style={{ cursor: 'pointer' }}
                    >
                      <Widget />
                    </Link>
                  ) : def.onClick ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={def.onClick}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && def.onClick()}
                      className="d-block text-reset text-decoration-none"
                      style={{ cursor: 'pointer' }}
                    >
                      <Widget />
                    </div>
                  ) : (
                    <Widget />
                  )

                  const tile = <CCol key={id} sm={6} xl={4} xxl={3}>{content}</CCol>

                  // N’ENVELOPPE avec ProtectedButton que si la conf est disponible
                  if (actionsConfig && def.action) {
                    return (
                      <ProtectedButton
                        key={id}
                        actionsConfig={actionsConfig}
                        action={def.action}
                        currentUserRoles={currentUserRoles}
                      >
                        {tile}
                      </ProtectedButton>
                    )
                  }

                  return tile
                })}
            </CRow>
          </CCardBody>
        </CCard>
      </div>

      {/* Panneau latéral de personnalisation */}
      <COffcanvas placement="end" visible={open} onHide={() => setOpen(false)} scroll>
        <COffcanvasHeader>
          <COffcanvasTitle>Personnaliser le tableau de bord</COffcanvasTitle>
        </COffcanvasHeader>
        <COffcanvasBody>
          <SettingsDashboard prefsApi={prefsApi} allowedIds={allowedIds} />
        </COffcanvasBody>
      </COffcanvas>
    </DashboardDataProvider>
  )
}

export default Dashboard
