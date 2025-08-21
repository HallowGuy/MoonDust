import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilUserPlus } from '@coreui/icons'

const API = 'http://localhost:3001/api/users'

const Users = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  // --- TOASTS (bottom-right, z-index 9999, autohide 3s)
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // --- Création (offcanvas)
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')

  // --- Édition (offcanvas)
  const [showEdit, setShowEdit] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('Impossible de charger les utilisateurs')
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      showError(e.message || 'Erreur réseau lors du chargement')
    }
  }

  useEffect(() => { fetchUsers() }, [])

  // ---------- CREATE ----------
  const openCreate = () => {
    setCreateName('')
    setCreateEmail('')
    setShowCreate(true)
  }

  const handleCreate = async () => {
    if (!createName || !createEmail) return showError('Nom et email requis')

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, email: createEmail }),
      })
      const payload = await safeJson(res)
      if (!res.ok) throw new Error(payload?.error || 'Création impossible')

      setUsers((prev) => [...prev, payload])
      setShowCreate(false)
      showSuccess('Utilisateur créé avec succès')
    } catch (e) {
      showError(e.message || 'Erreur lors de la création')
    }
  }

  // ---------- EDIT ----------
  const openEdit = (u) => {
    setEditUser(u)
    setEditName(u.name || '')
    setEditEmail(u.email || '')
    setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    if (!editUser) return
    if (!editName || !editEmail) return showError('Nom et email requis')

    try {
      const res = await fetch(`${API}/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail }),
      })
      const payload = await safeJson(res)
      if (!res.ok) throw new Error(payload?.error || 'Mise à jour impossible')

      setUsers((prev) => prev.map((u) => (u.id === payload.id ? payload : u)))
      setShowEdit(false)
      setEditUser(null)
      showSuccess('Utilisateur mis à jour')
    } catch (e) {
      showError(e.message || 'Erreur lors de la mise à jour')
    }
  }

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!(res.ok || res.status === 204)) {
        const payload = await safeJson(res)
        throw new Error(payload?.error || 'Suppression impossible')
      }
      setUsers((prev) => prev.filter((u) => u.id !== id))
      showSuccess('Utilisateur supprimé')
    } catch (e) {
      showError(e.message || 'Erreur lors de la suppression')
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Utilisateurs</span>
          <CButton color="primary" onClick={openCreate}>
            <CIcon icon={cilUserPlus} className="me-2" />
            Nouvel utilisateur
          </CButton>
        </CCardHeader>

        <CCardBody>
          <CFormInput
            className="mb-3"
            type="text"
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow className="align-middle">
                <CTableHeaderCell style={{ textAlign: 'center' }}>ID</CTableHeaderCell>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px', textAlign: 'center' }}>
                  Actions
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.length ? (
                filtered.map((u) => (
                  <CTableRow key={u.id}>
                    <CTableDataCell style={{ width: '50px', textAlign: 'center' }} className="align-middle">
                      {u.id}
                    </CTableDataCell>
                    <CTableDataCell className="align-middle">{u.name}</CTableDataCell>
                    <CTableDataCell className="align-middle">{u.email}</CTableDataCell>
                    <CTableDataCell className="text-center align-middle">
                      <CButton size="sm" color="secondary" variant="ghost" onClick={() => openEdit(u)}>
                        <CIcon icon={cilPencil} size="lg" />
                      </CButton>
                      <CButton size="sm" color="danger" variant="ghost" onClick={() => handleDelete(u.id)}>
                        <CIcon icon={cilTrash} size="lg" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={4} className="text-center">
                    Aucun utilisateur
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          {/* Sidebar création */}
          <COffcanvas placement="end" visible={showCreate} onHide={() => setShowCreate(false)}>
            <COffcanvasHeader>
              <h5 className="mb-0">Nouvel utilisateur</h5>
            </COffcanvasHeader>
            <COffcanvasBody>
              <div className="d-flex flex-column gap-3">
                <CFormInput
                  label="Nom"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
                <CFormInput
                  label="Email"
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
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

          {/* Sidebar édition */}
          <COffcanvas placement="end" visible={showEdit} onHide={() => setShowEdit(false)}>
            <COffcanvasHeader>
              <h5 className="mb-0">Éditer : {editUser?.name}</h5>
            </COffcanvasHeader>
            <COffcanvasBody>
              <div className="d-flex flex-column gap-4">
                <CFormInput
                  label="Nom"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <CFormInput
                  label="Email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
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

      {/* TOASTER en bas à droite */}
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

export default Users
