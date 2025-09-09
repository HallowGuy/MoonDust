import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody, CFormCheck, CBadge, CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilSave } from '@coreui/icons'
import routes from '../../routes'
import { PermissionsContext } from "src/context/PermissionsContext"
import ProtectedButton from "src/components/ProtectedButton"
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
  const { setRoutesConfig, currentUserRoles, actionsConfig } = useContext(PermissionsContext)

  const [saving, setSaving] = useState(false)

  // Pagination
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const [selectedRoutes, setSelectedRoutes] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [editRoute, setEditRoute] = useState(null)
  const [editRoles, setEditRoles] = useState([])

  // --- TOASTS
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

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
  }, [setRoutesConfig])

  // Charger les rôles disponibles depuis backend
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

  // Sauvegarder config dans backend
  const saveConfig = async (newConfig) => {
    try {
      setSaving(true)
      const res = await fetch(API_ROUTES_CONFIG, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde")

      // 👉 recharger depuis backend avec cache buster
      const refreshed = await fetch(`${API_ROUTES_CONFIG}?t=${Date.now()}`).then(r => r.json())
      setConfig(refreshed)
      setRoutesConfig({ ...refreshed })
      showSuccess("Configuration sauvegardée")
    } catch (err) {
      addToast(err.message)
    } finally {
      setSaving(false)
    }
  }

 // Filtrage basé uniquement sur la config backend
const allRoutes = Object.keys(config).map(path => ({
  path,
  name: path, // pas de "name" dans le JSON → on prend le path comme libellé
  roles: config[path] ?? []
}))

const filtered = allRoutes.filter(
  (r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.path.toLowerCase().includes(search.toLowerCase())
)

const paginated = filtered.slice((page - 1) * perPage, page * perPage)
const totalPages = Math.ceil(filtered.length / perPage)

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
      editRoute.path.forEach((p) => {
        newConfig[p] = editRoles
      })
    } else {
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
          <ProtectedButton
            actionsConfig={actionsConfig}
            currentUserRoles={currentUserRoles}
            action="routes.editMasse"
          >
            <CButton
              color="primary"
              disabled={selectedRoutes.length === 0}
              onClick={() => {
                setEditRoute({ path: selectedRoutes })
                setEditRoles([])
                setShowEdit(true)
              }}
            >
              Modifier en masse ({selectedRoutes.length})
            </CButton>
          </ProtectedButton>
        </CCardHeader>

        <CCardBody>
          <CFormInput
            className="mb-3"
            type="text"
            placeholder="Rechercher par nom ou chemin…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>
                  <CFormCheck
                    checked={paginated.length > 0 && selectedRoutes.length === paginated.length}
                    indeterminate={selectedRoutes.length > 0 && selectedRoutes.length < paginated.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoutes(paginated.map((r) => r.path))
                      } else {
                        setSelectedRoutes([])
                      }
                    }}
                  />
                </CTableHeaderCell>
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
                paginated.map((r, idx) => (
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
                      {r.roles.length
                        ? r.roles.map((role) => (
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
                      <ProtectedButton
                        actionsConfig={actionsConfig}
                        currentUserRoles={currentUserRoles}
                        action="routes.edit"
                      >
                        <CButton
                          size="sm"
                          color="success"
                          variant="ghost"
                          onClick={() => openEdit(r)}
                        >
                          <CIcon icon={cilPencil} size="lg" />
                        </CButton>
                      </ProtectedButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center">
                    Aucune route trouvée
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <span>Résultats : {filtered.length}</span>
            <CFormSelect
              value={perPage}
              style={{ width: '120px' }}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              options={[
                { label: '10 / page', value: 10 },
                { label: '20 / page', value: 20 },
                { label: '30 / page', value: 30 },
              ]}
            />
          </div>

          <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
            <CButton
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Précédent
            </CButton>
            <span>Page {page} / {totalPages}</span>
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
