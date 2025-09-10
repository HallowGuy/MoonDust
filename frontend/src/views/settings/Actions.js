import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody, CFormCheck, CBadge,CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilSave } from '@coreui/icons'

import { API_ROLES, API_ACTIONS_CONFIG } from 'src/api'
import ProtectedButton from "/src/components/protected/ProtectedButton"
import { PermissionsContext } from '/src/context/PermissionsContext'

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
  const [saving, setSaving] = useState(false)

  const { actionsConfig, currentUserRoles, setActionsConfig } = useContext(PermissionsContext)

  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

 const allActions = Object.keys(config || {})

const filtered = allActions.filter((a) => {
  const actionKey = a.toLowerCase()
  const thematique = (config[a]?.thematique || "").toLowerCase()
  const roles = (config[a]?.roles || []).join(" ").toLowerCase()

  const searchTerm = search.toLowerCase()

  return (
    actionKey.includes(searchTerm) ||
    thematique.includes(searchTerm) ||
    roles.includes(searchTerm)
  )
})


  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
const totalPages = Math.ceil(filtered.length / perPage)

  const [selectedActions, setSelectedActions] = useState([])

  const [showEdit, setShowEdit] = useState(false)
  const [editAction, setEditAction] = useState(null)
  const [editRoles, setEditRoles] = useState([])
  const [editThematique, setEditThematique] = useState("")

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(API_ACTIONS_CONFIG)
        if (!res.ok) throw new Error("Impossible de charger la config des actions")
        const data = await res.json()
        setConfig(data)
        setActionsConfig(data)
      } catch (err) {
        console.error(err)
        addToast(err.message)
      }
    }
    fetchConfig()
  }, [setActionsConfig])

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

  const saveConfig = async (newConfig) => {
    try {
      setSaving(true)

      setConfig({ ...newConfig })
      setActionsConfig({ ...newConfig })

      const res = await fetch(API_ACTIONS_CONFIG, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      })
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde")

      const refreshed = await fetch(`${API_ACTIONS_CONFIG}?t=${Date.now()}`).then((r) => r.json())

      setConfig({ ...refreshed })
      setActionsConfig({ ...refreshed })

      showSuccess("Configuration sauvegardée")
    } catch (err) {
      addToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (actionKey) => {
    setEditAction(actionKey)
    setEditRoles(config[actionKey]?.roles ?? [])
    setEditThematique(config[actionKey]?.thematique || "")
    setShowEdit(true)
  }

  const toggleRole = (role) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleSaveEdit = async () => {
    if (!editAction) return
    let newConfig = { ...config }

    if (Array.isArray(editAction)) {
      editAction.forEach((a) => {
        newConfig[a] = {
          roles: editRoles,
          thematique: editThematique || "Autre",
        }
      })
    } else {
      newConfig[editAction] = {
        roles: editRoles,
        thematique: editThematique || "Autre",
      }
    }

    await saveConfig(newConfig)
    setShowEdit(false)
    setEditAction(null)
    setSelectedActions([])
  }

  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Édition des permissions des actions</span>
          <ProtectedButton
            actionsConfig={actionsConfig}
            currentUserRoles={currentUserRoles}
            action="actions.editMasse"
          >
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
          </ProtectedButton>
        </CCardHeader>
        <CCardBody>
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
                <CTableHeaderCell>
                  <CFormCheck
                    checked={paginated.length > 0 && selectedActions.length === paginated.length}
                    indeterminate={selectedActions.length > 0 && selectedActions.length < paginated.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedActions(paginated.map((a) => a))
                      } else {
                        setSelectedActions([])
                      }
                    }}
                  />
                </CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
                <CTableHeaderCell>Thématique</CTableHeaderCell>
                <CTableHeaderCell>Rôles</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '80px', textAlign: 'center' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginated.length ? (
                paginated.map((a, idx) => {
                  const currentRoles = config[a]?.roles ?? []
                  const thematique = config[a]?.thematique || "Aucune"
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
                      <CTableDataCell>{thematique}</CTableDataCell>
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
                        <ProtectedButton
                          actionsConfig={actionsConfig}
                          currentUserRoles={currentUserRoles}
                          action="actions.edit"
                        >
                          <CButton
                            size="sm"
                            color="success"
                            variant="ghost"
                            onClick={() => openEdit(a)}
                          >
                            <CIcon icon={cilPencil} size="lg" />
                          </CButton>
                        </ProtectedButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center">
                    Aucune action trouvée
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
      setPage(1) // on repart à la première page
    }}
    options={[
      { label: '10 / page', value: 10 },
      { label: '20 / page', value: 20 },
      { label: '30 / page', value: 30 },
    ]}
  />
</div>
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
            <CFormInput
              label="Thématique"
              value={editThematique}
              onChange={(e) => setEditThematique(e.target.value)}
            />

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

export default PermissionEdition
