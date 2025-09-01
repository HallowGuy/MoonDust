import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilUser } from '@coreui/icons'
import { API_ROLES, API_ROLE_USERS } from 'src/api'

const Roles = () => {
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')

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
      const res = await fetch(API_ROLES)
      if (!res.ok) throw new Error('Impossible de charger les rôles')
      const data = await res.json()
      setRoles(data)
    } catch (e) {
      showError(e.message || 'Erreur réseau lors du chargement')
    }
  }

  const fetchUsersByRole = async (roleName) => {
  try {
    const res = await fetch(API_ROLE_USERS(roleName))
    if (!res.ok) throw new Error("Impossible de charger les utilisateurs du rôle")
    return await res.json()
  } catch (e) {
    console.error(e)
    return []
  }
}


  useEffect(() => { fetchRoles() }, [])


  // ---------- CREATE ----------
  const openCreate = () => {
    setCreateName('')
    setCreateDescription('')
    setShowCreate(true)
  }

const openUsers = async (roleName) => {
  console.log("👉 roleName reçu:", roleName)
  if (!roleName) {
    console.error("⚠️ Aucun roleName reçu !");
    return
  }

  setSelectedRole(roleName)
  setShowUsers(true)

  try {
    const res = await fetch(API_ROLE_USERS(roleName))
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
      const res = await fetch(API_ROLES, {
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

  // ---------- EDIT ----------
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
      const res = await fetch(`${API_ROLES}/${editRole.name}`, {
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

  // ---------- DELETE ----------
  const handleDelete = async (name) => {
    if (!window.confirm('Supprimer ce rôle ?')) return
    try {
      const res = await fetch(`${API_ROLES}/${name}`, { method: 'DELETE' })
      if (!(res.ok || res.status === 204)) {
        const payload = await safeJson(res)
        throw new Error(payload?.error || 'Suppression impossible')
      }
      setRoles((prev) => prev.filter((r) => r.name !== name))
      showSuccess('Rôle supprimé')
    } catch (e) {
      showError(e.message || 'Erreur lors de la suppression')
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
          <CButton color="primary" onClick={openCreate}>
            <CIcon icon={cilPlus} className="me-2" />
            Nouveau rôle
          </CButton>
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
                <CTableHeaderCell style={{ width: '130px', textAlign: 'center' }}>
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
                      <CButton size="sm" color="success" variant="ghost" onClick={() => openEdit(r)}>
                        <CIcon icon={cilPencil} size="lg" />
                      </CButton>
                      <CButton size="sm" color="info" variant="ghost" onClick={() => openUsers(r.name)}><CIcon icon={cilUser} size="lg" /></CButton>

                      <CButton size="sm" color="danger" variant="ghost" onClick={() => handleDelete(r.name)}>
                        <CIcon icon={cilTrash} size="lg" />
                      </CButton>
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
          <COffcanvas placement="end" visible={showCreate} onHide={() => setShowCreate(false)} style={{ width: "33%" }}>
            <COffcanvasHeader>
              <h5 className="mb-0">Nouveau rôle</h5>
            </COffcanvasHeader>
            <COffcanvasBody>
              <div className="d-flex flex-column gap-3">
                <CFormInput
                  label="Nom"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
                <CFormInput
                  label="Description"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                />

                <div className="d-flex gap-2 justify-content-end">
                  <CButton color="secondary" variant="ghost" onClick={() => setShowCreate(false)}>
                    Annuler
                  </CButton>
                  <CButton color="primary" onClick={handleCreate}>
                    Créer
                  </CButton>
                </div>
              </div>
            </COffcanvasBody>
          </COffcanvas>
          <COffcanvas
  placement="end"
  visible={showUsers}
  onHide={() => setShowUsers(false)}
  style={{ width: "33%" }}
>
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
          <COffcanvas placement="end" visible={showEdit} onHide={() => setShowEdit(false)} style={{ width: "33%" }}>
            <COffcanvasHeader>
              <h5 className="mb-0">Éditer : {editRole?.name}</h5>
            </COffcanvasHeader>
            <COffcanvasBody>
              <div className="d-flex flex-column gap-4">
                <CFormInput
                  label="Nom"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <CFormInput
                  label="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />

                <div className="d-flex gap-2 justify-content-end">
                  <CButton color="secondary" variant="ghost" onClick={() => setShowEdit(false)}>
                    Annuler
                  </CButton>
                  <CButton color="primary" onClick={handleSaveEdit}>
                    Enregistrer
                  </CButton>
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
