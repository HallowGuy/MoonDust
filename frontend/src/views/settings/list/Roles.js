import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilUser } from '@coreui/icons'
import { API_ROLES, API_ROLE_USERS } from 'src/api'
import ConfirmDeleteModal from "../../../components/confirmations/ConfirmDeleteModal"
import ProtectedButton from "../../../components/protected/ProtectedButton"
import { PermissionsContext } from '/src/context/PermissionsContext'
import { fetchWithAuth } from "../../../utils/auth";

const Roles = () => {
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')

  const { actionsConfig, currentUserRoles } = useContext(PermissionsContext)

  // --- TOASTS
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // --- Création
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')

  // --- Voir utilisateurs d’un rôle
  const [showUsers, setShowUsers] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [usersByRole, setUsersByRole] = useState([])

  // --- Édition
  const [showEdit, setShowEdit] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // --- FETCH ROLES ---
  const fetchRoles = async () => {
    try {
      const res = await fetchWithAuth(API_ROLES)
      if (!res.ok) throw new Error('Impossible de charger les rôles')
      const data = await res.json()
      setRoles(data)
    } catch (e) {
      showError(e.message || 'Erreur réseau lors du chargement')
    }
  }

  useEffect(() => { fetchRoles() }, [])

  const openCreate = () => {
    setCreateName('')
    setCreateDescription('')
    setShowCreate(true)
  }

  const openUsers = async (roleName) => {
    if (!roleName) return
    setSelectedRole(roleName)
    setShowUsers(true)
    try {
      const res = await fetchWithAuth(API_ROLE_USERS(roleName))
      if (!res.ok) throw new Error("Impossible de charger les utilisateurs du rôle")
      const data = await res.json()
      setUsersByRole(data)
    } catch (e) {
      showError(e.message || "Erreur chargement utilisateurs")
    }
  }

  const handleCreate = async () => {
    if (!createName) return showError('Nom requis')
    try {
      const res = await fetchWithAuth(API_ROLES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, description: createDescription }),
      })
      if (!res.ok) {
        const payload = await safeJson(res)
        throw new Error(payload?.error || 'Création impossible')
      }
      await fetchRoles()
      setShowCreate(false)
      showSuccess('Rôle créé avec succès')
    } catch (e) {
      showError(e.message || 'Erreur lors de la création')
    }
  }

  const openEdit = (r) => {
    setEditRole(r)
    setEditName(r.name || '')
    setEditDescription(r.description || '')
    setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    if (!editRole) return
    if (!editName) return showError('Nom requis')
    try {
      const res = await fetchWithAuth(`${API_ROLES}/${editRole.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDescription }),
      })
      if (!res.ok) {
        const payload = await safeJson(res)
        throw new Error(payload?.error || 'Mise à jour impossible')
      }
      await fetchRoles()
      setShowEdit(false)
      setEditRole(null)
      showSuccess('Rôle mis à jour')
    } catch (e) {
      showError(e.message || 'Erreur lors de la mise à jour')
    }
  }

  const filtered = roles.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <><div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Rôles</span>
          <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="role.new">
            <CButton color="primary" onClick={openCreate}>
              <CIcon icon={cilPlus} className="me-2" /> Nouveau rôle
            </CButton>
          </ProtectedButton>
        </CCardHeader>

        <CCardBody>
          <CFormInput
            className="mb-3"
            type="text"
            placeholder="Rechercher par nom ou description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow className="align-middle">
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '160px', textAlign: 'center' }}>
                  Actions
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.length ? (
                filtered.map((r) => (
                  <CTableRow key={r.id}>
                    <CTableDataCell className="align-middle">{r.name}</CTableDataCell>
                    <CTableDataCell className="align-middle">{r.description}</CTableDataCell>
                    <CTableDataCell className="text-center align-middle">
                      <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="role.edit">
                        <CButton size="sm" color="success" variant="ghost" onClick={() => openEdit(r)}>
                          <CIcon icon={cilPencil} size="lg" />
                        </CButton>
                      </ProtectedButton>

                      <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="role.viewUsers">
                        <CButton size="sm" color="info" variant="ghost" onClick={() => openUsers(r.name)}>
                          <CIcon icon={cilUser} size="lg" />
                        </CButton>
                      </ProtectedButton>

                      <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="role.delete">
                        <ConfirmDeleteModal
                          title="Supprimer le rôle"
                          message="Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible."
                          trigger={
                            <CButton size="sm" color="danger" variant="ghost">
                              <CIcon icon={cilTrash} size="lg" />
                            </CButton>
                          }
                          onConfirm={async () => {
                            try {
                              const res = await fetchWithAuth(`${API_ROLES}/${r.name}`, { method: "DELETE" })
                              if (!res.ok) throw new Error("Suppression impossible")
                              setRoles((prev) => prev.filter((rr) => rr.name !== r.name))
                              showSuccess("✅ Rôle supprimé")
                            } catch (e) {
                              showError(e.message || "Erreur lors de la suppression")
                            }
                          }}
                        />
                      </ProtectedButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={4} className="text-center">
                    Aucun rôle
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          {/* Sidebar création */}
          <COffcanvas placement="end" visible={showCreate} onHide={() => setShowCreate(false)} style={{ width: "20%" }}>
            <COffcanvasHeader>
              <h5 className="mb-0">Nouveau rôle</h5>
            </COffcanvasHeader>
            <COffcanvasBody>
              <div className="d-flex flex-column gap-3">
                <CFormInput label="Nom" value={createName} onChange={(e) => setCreateName(e.target.value)} />
                <CFormInput label="Description" value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} />

                <div className="d-flex gap-2 justify-content-end">
                  <CButton color="secondary" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</CButton>
                  <CButton color="primary" onClick={handleCreate}>Créer</CButton>
                </div>
              </div>
            </COffcanvasBody>
          </COffcanvas>

          {/* Sidebar utilisateurs */}
          <COffcanvas placement="end" visible={showUsers} onHide={() => setShowUsers(false)} style={{ width: "20%" }}>
            <COffcanvasHeader>
              <h5 className="mb-0">Utilisateurs du rôle : {selectedRole}</h5>
            </COffcanvasHeader>
            <COffcanvasBody>
              {usersByRole.length ? (
                <CTable striped hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Username</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {usersByRole.map((u) => (
                      <CTableRow key={u.id}>
                        <CTableDataCell>{u.username}</CTableDataCell>
                        <CTableDataCell>{u.email}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p>Aucun utilisateur associé</p>
              )}
            </COffcanvasBody>
          </COffcanvas>

          {/* Sidebar édition */}
          <COffcanvas placement="end" visible={showEdit} onHide={() => setShowEdit(false)} style={{ width: "20%" }}>
            <COffcanvasHeader>
              <h5 className="mb-0">Éditer : {editRole?.name}</h5>
            </COffcanvasHeader>
            <COffcanvasBody>
              <div className="d-flex flex-column gap-4">
                <CFormInput label="Nom" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <CFormInput label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />

                <div className="d-flex gap-2 justify-content-end">
                  <CButton color="secondary" variant="ghost" onClick={() => setShowEdit(false)}>Annuler</CButton>
                  <CButton color="primary" onClick={handleSaveEdit}>Enregistrer</CButton>
                </div>
              </div>
            </COffcanvasBody>
          </COffcanvas>
        </CCardBody>
      </CCard>

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
    </>
  )
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export default Roles
