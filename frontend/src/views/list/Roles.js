import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'

const API = `${import.meta.env.VITE_API_URL}/roles`
console.log("👉 API utilisée (roles):", API)

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
  const [createCode, setCreateCode] = useState('')
  const [createLabel, setCreateLabel] = useState('')

  // --- Édition
  const [showEdit, setShowEdit] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [editCode, setEditCode] = useState('')
  const [editLabel, setEditLabel] = useState('')

  const fetchRoles = async () => {
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('Impossible de charger les rôles')
      const data = await res.json()
      setRoles(data)
    } catch (e) {
      showError(e.message || 'Erreur réseau lors du chargement')
    }
  }

  useEffect(() => { fetchRoles() }, [])

  // ---------- CREATE ----------
  const openCreate = () => {
    setCreateCode('')
    setCreateLabel('')
    setShowCreate(true)
  }

  const handleCreate = async () => {
    if (!createCode || !createLabel) return showError('Code et label requis')

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: createCode, label: createLabel }),
      })
      const payload = await safeJson(res)
      if (!res.ok) throw new Error(payload?.error || 'Création impossible')

      setRoles((prev) => [...prev, payload])
      setShowCreate(false)
      showSuccess('Rôle créé avec succès')
    } catch (e) {
      showError(e.message || 'Erreur lors de la création')
    }
  }

  // ---------- EDIT ----------
  const openEdit = (r) => {
    setEditRole(r)
    setEditCode(r.code || '')
    setEditLabel(r.label || '')
    setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    if (!editRole) return
    if (!editCode || !editLabel) return showError('Code et label requis')

    try {
      const res = await fetch(`${API}/${editRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editCode, label: editLabel }),
      })
      const payload = await safeJson(res)
      if (!res.ok) throw new Error(payload?.error || 'Mise à jour impossible')

      setRoles((prev) => prev.map((r) => (r.id === payload.id ? payload : r)))
      setShowEdit(false)
      setEditRole(null)
      showSuccess('Rôle mis à jour')
    } catch (e) {
      showError(e.message || 'Erreur lors de la mise à jour')
    }
  }

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce rôle ?')) return
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!(res.ok || res.status === 204)) {
        const payload = await safeJson(res)
        throw new Error(payload?.error || 'Suppression impossible')
      }
      setRoles((prev) => prev.filter((r) => r.id !== id))
      showSuccess('Rôle supprimé')
    } catch (e) {
      showError(e.message || 'Erreur lors de la suppression')
    }
  }

  const filtered = roles.filter(
    (r) =>
      r.code?.toLowerCase().includes(search.toLowerCase()) ||
      r.label?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
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
            placeholder="Rechercher par code ou label…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow className="align-middle">
                <CTableHeaderCell style={{ textAlign: 'center' }}>ID</CTableHeaderCell>
                <CTableHeaderCell>Code</CTableHeaderCell>
                <CTableHeaderCell>Label</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px', textAlign: 'center' }}>
                  Actions
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.length ? (
                filtered.map((r) => (
                  <CTableRow key={r.id}>
                    <CTableDataCell style={{ width: '50px', textAlign: 'center' }} className="align-middle">
                      {r.id}
                    </CTableDataCell>
                    <CTableDataCell className="align-middle">{r.code}</CTableDataCell>
                    <CTableDataCell className="align-middle">{r.label}</CTableDataCell>
                    <CTableDataCell className="text-center align-middle">
                      <CButton size="sm" color="secondary" variant="ghost" onClick={() => openEdit(r)}>
                        <CIcon icon={cilPencil} size="lg" />
                      </CButton>
                      <CButton size="sm" color="danger" variant="ghost" onClick={() => handleDelete(r.id)}>
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
                  <div className="row">
                    <div className="col-md-6">
                      <CFormInput
                        label="Code"
                        value={createCode}
                        onChange={(e) => setCreateCode(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <CFormInput
                        label="Label"
                        value={createLabel}
                        onChange={(e) => setCreateLabel(e.target.value)}
                      />
                    </div>
                  </div>

               
                
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
          <COffcanvas placement="end" visible={showEdit} onHide={() => setShowEdit(false)} style={{ width: "33%" }}>
            <COffcanvasHeader>
              <h5 className="mb-0">Éditer : {editRole?.code}</h5>
            </COffcanvasHeader>
            <COffcanvasBody>
              <div className="d-flex flex-column gap-4">
                <div className="row">
                <div className="col-md-6">
                  <CFormInput
                    label="Code"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <CFormInput
                    label="Label"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                  />
                </div>
              </div>

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
