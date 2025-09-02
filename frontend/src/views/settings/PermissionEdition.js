import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody, CFormCheck, CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilSave } from '@coreui/icons'

import { API_ROLES, API_ACTIONS_CONFIG } from 'src/api'

// 🔹 Couleurs associées aux rôles (optionnel)
const ROLE_COLORS = {
  admin: 'danger',
  read: 'info',
  manager: 'warning',
  user: 'success',
}

const PermissionEdition = () => {
  const [search, setSearch] = useState('')
  const [config, setConfig] = useState({})
  const [toasts, setToasts] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])

  // --- TOASTS
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // --- LISTE DES ACTIONS (clé JSON) ---
  const allActions = Object.keys(config || {})

  const filtered = allActions.filter((a) =>
    a.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination appliquée après filtrage
  const [page, setPage] = useState(1)
  const perPage = 10
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)
  const [selectedActions, setSelectedActions] = useState([])

  // --- EDITION
  const [showEdit, setShowEdit] = useState(false)
  const [editAction, setEditAction] = useState(null)
  const [editRoles, setEditRoles] = useState([])

  // Charger config des actions depuis backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(API_ACTIONS_CONFIG)
        if (!res.ok) throw new Error("Impossible de charger la config des actions")
        const data = await res.json()
        setConfig(data)
      } catch (err) {
        console.error(err)
        addToast(err.message)
      }
    }
    fetchConfig()
  }, [])

  // Charger les rôles depuis backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(API_ROLES)
        if (!res.ok) throw new Error("Impossible de charger les rôles")
        const data = await res.json()
        setAvailableRoles(data.map((r) => r.name))
      } catch (err) {
        console.error(err)
        addToast(err.message)
      }
    }
    fetchRoles()
  }, [])

  // Sauvegarder config
const saveConfig = async (newConfig) => {
  try {
    setConfig(newConfig) // maj immédiate
    const res = await fetch(API_ACTIONS_CONFIG, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    })
    if (!res.ok) throw new Error("Erreur lors de la sauvegarde")

    // 🔥 recharge depuis backend après save
    const refreshed = await fetch(API_ACTIONS_CONFIG).then(r => r.json())
    setConfig(refreshed)

    showSuccess("Configuration sauvegardée")
  } catch (err) {
    addToast(err.message)
  }
}



  // Ouvrir l’édition
  const openEdit = (actionKey) => {
    setEditAction(actionKey)
    const currentRoles = config[actionKey] ?? []
    setEditRoles(currentRoles)
    setShowEdit(true)
  }

  // Toggle checkbox
  const toggleRole = (role) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  // Sauvegarde
  const handleSaveEdit = () => {
    if (!editAction) return
    let newConfig = { ...config }

    if (Array.isArray(editAction)) {
      editAction.forEach((a) => {
        newConfig[a] = editRoles
      })
    } else {
      newConfig[editAction] = editRoles
    }

    saveConfig(newConfig)
    setShowEdit(false)
    setEditAction(null)
    setSelectedActions([])
    showSuccess("Permissions mises à jour")
  }

  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader>
          <span>Éditeur des permissions des actions</span>
        </CCardHeader>
        <CCardBody>
          <CButton
            color="primary"
            disabled={selectedActions.length === 0}
            onClick={() => {
              setEditAction(selectedActions)
              setEditRoles([])
              setShowEdit(true)
            }}
          >
            Modifier en masse ({selectedActions.length})
          </CButton>

          <CFormInput
            className="mb-3"
            type="text"
            placeholder="Rechercher une action…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell></CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
                <CTableHeaderCell>Rôles</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '80px', textAlign: 'center' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginated.length ? (
                paginated.map((a, idx) => {
                  const currentRoles = config[a] ?? []
                  return (
                    <CTableRow key={idx}>
                      <CTableDataCell>
                        <CFormCheck
                          checked={selectedActions.includes(a)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedActions((prev) => [...prev, a])
                            } else {
                              setSelectedActions((prev) => prev.filter((p) => p !== a))
                            }
                          }}
                        />
                      </CTableDataCell>
                      <CTableDataCell>{a}</CTableDataCell>
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
                          onClick={() => openEdit(a)}
                        >
                          <CIcon icon={cilPencil} size="lg" />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={3} className="text-center">
                    Aucune action trouvée
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
            <CButton disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
              Précédent
            </CButton>
            <span>
              Page {page} / {totalPages}
            </span>
            <CButton disabled={page === totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
              Suivant
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      {/* Sidebar édition */}
      <COffcanvas placement="end" visible={showEdit} onHide={() => setShowEdit(false)} style={{ width: '33%' }}>
        <COffcanvasHeader>
          <h5 className="mb-0">Éditer : {Array.isArray(editAction) ? "Plusieurs actions" : editAction}</h5>
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
              <CButton color="primary" onClick={handleSaveEdit}>
                <CIcon icon={cilSave} className="me-2" />
                Enregistrer
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

export default PermissionEdition
