import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody, CFormCheck, CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilSave } from '@coreui/icons'
import routes from '../../routes'
import { PermissionsContext } from "src/context/PermissionsContext"

import { API_ROLES, API_ROUTES_CONFIG } from 'src/api'

// 🔹 Couleurs associées aux rôles (optionnel)
const ROLE_COLORS = {
  admin: 'danger',
  read: 'info',
  manager: 'warning',
  user: 'success',
}



const RouteEdition = () => {
  const [search, setSearch] = useState('')
  const [config, setConfig] = useState({})
  const [toasts, setToasts] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])
  const { setRoutesConfig } = useContext(PermissionsContext)
  const [saving, setSaving] = useState(false)
const [editAction, setEditAction] = useState(null)


  // --- TOASTS
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

const filtered = routes.filter(
  (r) =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.path?.toLowerCase().includes(search.toLowerCase())
)

// Pagination appliquée après filtrage
const [page, setPage] = useState(1)
const perPage = 10
const paginated = filtered.slice((page - 1) * perPage, page * perPage)
const totalPages = Math.ceil(filtered.length / perPage)
const [selectedRoutes, setSelectedRoutes] = useState([])

  // --- EDITION
  const [showEdit, setShowEdit] = useState(false)
  const [editRoute, setEditRoute] = useState(null)
  const [editRoles, setEditRoles] = useState([])

  // Charger config depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('routesConfig')
    if (stored) {
      setConfig(JSON.parse(stored))
    }
  }, [])

  // 🔹 Charger les rôles disponibles depuis backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(API_ROLES)
        if (!res.ok) throw new Error("Impossible de charger les rôles depuis l’API")
        const data = await res.json()
        setAvailableRoles(data.map(r => r.name)) // garder juste le nom
      } catch (err) {
        console.error(err)
        addToast(err.message)
      }
    }
    fetchRoles()
  }, [])

  // Charger config depuis backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(API_ROUTES_CONFIG)
        if (!res.ok) throw new Error("Impossible de charger la config des routes")
        const data = await res.json()
        setConfig(data)
        setRoutesConfig(data)
      } catch (err) {
        console.error(err)
        addToast(err.message)
      }
    }
    fetchConfig()
  }, [])

  // Sauvegarder config dans backend
const saveConfig = async (newConfig) => {
  try {
    setSaving(true)

    setConfig(JSON.parse(JSON.stringify(newConfig)))


    const res = await fetch(API_ROUTES_CONFIG, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    })
    if (!res.ok) throw new Error("Erreur lors de la sauvegarde")

    const refreshed = await fetch(`${API_ROUTES_CONFIG}?t=${Date.now()}`)
      .then(r => r.json())

    setConfig(JSON.parse(JSON.stringify(refreshed)))
    setRoutesConfig(refreshed) // 👈 update aussi le context

    showSuccess("Configuration sauvegardée")
  } catch (err) {
    addToast(err.message)
  } finally {
    setSaving(false)
  }
}

  // Ouvrir l'édition
  const openEdit = (route) => {
    setEditRoute(route)
    const currentRoles = config[route.path] ?? route.roles ?? []
    setEditRoles(currentRoles)
    setShowEdit(true)
  }

  // Toggle checkbox
  const toggleRole = (role) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  // Sauvegarder l'édition
const handleSaveEdit = async () => {
  if (!editRoute) return
  let newConfig = { ...config }

  if (Array.isArray(editRoute.path)) {
    // édition en masse
    editRoute.path.forEach((p) => {
      newConfig[p] = editRoles
    })
  } else {
    // édition simple
    newConfig[editRoute.path] = editRoles
  }

  await saveConfig(newConfig)
  setShowEdit(false)
  setEditRoute(null)
  setSelectedRoutes([])
}





  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Éditeur des accès aux routes</span>
        </CCardHeader>

        <CCardBody>
          <CButton
  color="primary"
  disabled={selectedRoutes.length === 0}
  onClick={() => {
    setEditRoute({ path: selectedRoutes }) // on passe plusieurs paths
    setEditRoles([]) // ou roles communs si tu veux
    setShowEdit(true)
  }}
>
  Modifier en masse ({selectedRoutes.length})
</CButton>

          {/* Champ recherche */}
          <CFormInput
            className="mb-3"
            type="text"
            placeholder="Rechercher par nom ou chemin…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Tableau des routes */}
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell></CTableHeaderCell>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Chemin</CTableHeaderCell>
                <CTableHeaderCell>Rôles</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '80px', textAlign: 'center' }}>
                  Actions
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.length ? (
                paginated.map((r, idx) => {
                  const currentRoles = config[r.path] ?? r.roles ?? []
                  return (
                    <CTableRow key={idx}>
                        <CTableDataCell>
                        <CFormCheck
                          checked={selectedRoutes.includes(r.path)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRoutes((prev) => [...prev, r.path])
                            } else {
                              setSelectedRoutes((prev) => prev.filter((p) => p !== r.path))
                            }
                          }}
                        />
                      </CTableDataCell>
                      <CTableDataCell>{r.name}</CTableDataCell>
                      <CTableDataCell>{r.path}</CTableDataCell>
                      <CTableDataCell>
                        {currentRoles.length
                          ? currentRoles.map((role) => (
                              <CBadge
                                key={role}
                                color={ROLE_COLORS[role] || 'secondary'}
                                className="me-1"
                              >
                                {role}
                              </CBadge>
                            ))
                          : 'Aucun'}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          size="sm"
                          color="success"
                          variant="ghost"
                          onClick={() => openEdit(r)}
                        >
                          <CIcon icon={cilPencil} size="lg" />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={4} className="text-center">
                    Aucune route trouvée
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
          <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
  <CButton
    disabled={page === 1}
    onClick={() => setPage((p) => Math.max(p - 1, 1))}
  >
    Précédent
  </CButton>

  <span>
    Page {page} / {totalPages}
  </span>

  <CButton
    disabled={page === totalPages}
    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
  >
    Suivant
  </CButton>
</div>

        </CCardBody>
      </CCard>

      {/* Sidebar édition */}
      <COffcanvas
        placement="end"
        visible={showEdit}
        onHide={() => setShowEdit(false)}
        style={{ width: '33%' }}
      >
        <COffcanvasHeader>
          <h5 className="mb-0">Éditer : {editRoute?.name}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          <div className="d-flex flex-column gap-3">
            {availableRoles.map((role) => (
              <CFormCheck
                key={role}
                label={role}
                checked={editRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />
            ))}

            <div className="d-flex gap-2 justify-content-end mt-3">
              <CButton color="secondary" variant="ghost" onClick={() => setShowEdit(false)}>
                Annuler
              </CButton>
              <CButton color="primary" onClick={handleSaveEdit} disabled={saving}>
  {saving ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" />
      Sauvegarde…
    </>
  ) : (
    <>
      <CIcon icon={cilSave} className="me-2" />
      Enregistrer
    </>
  )}
</CButton>
            </div>
          </div>
        </COffcanvasBody>
      </COffcanvas>

      {/* TOASTER */}
      <CToaster placement="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((t) => (
          <CToast
            key={t.id}
            visible
            autohide
            delay={3000}
            color={t.color}
            onClose={() => removeToast(t.id)}
          >
            <CToastBody className="text-white">{t.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>
    </div>
  )
}

export default RouteEdition
