import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput, CFormSwitch, CFormSelect,
  CToaster, CToast, CToastBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilCheckCircle, cilXCircle } from '@coreui/icons'
import Select from 'react-select'
import { API_BASE } from 'src/api'

const API = API_BASE

const Users = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [visible, setVisible] = useState(false)

  // form state
  const [editUser, setEditUser] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [userRoles, setUserRoles] = useState([])

  // ---------- TOASTS ----------
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // ---------- FETCH DATA ----------
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`)
      if (!res.ok) throw new Error('Impossible de charger les utilisateurs')
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      showError(e.message || 'Erreur lors du chargement des utilisateurs')
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API}/roles`)
      if (!res.ok) throw new Error('Impossible de charger les rôles')
      const data = await res.json()
      setRoles(data)
    } catch (e) {
      showError(e.message || 'Erreur lors du chargement des rôles')
    }
  }

  const fetchUserRoles = async (id) => {
    try {
      const res = await fetch(`${API}/users/${id}/roles`)
      if (!res.ok) return []
      return await res.json()
    } catch (e) {
      showError('Impossible de charger les rôles utilisateur')
      return []
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  // ---------- OPEN SIDEBAR ----------
  const openOffcanvas = async (user = null) => {
    if (user) {
      setEditUser(user)
      setUsername(user.username)
      setEmail(user.email)
      setDisplayName(user.display_name || '')
      setIsActive(user.is_active)

      // Charger ses rôles
      const r = await fetchUserRoles(user.id)
      setUserRoles(r.map((role) => role.id))
    } else {
      setEditUser(null)
      setUsername('')
      setEmail('')
      setDisplayName('')
      setIsActive(true)
      setUserRoles([])
    }
    setVisible(true)
  }

  // ---------- SAVE USER ----------
  const handleSave = async () => {
    const payload = { username, email, display_name: displayName, is_active: isActive }
    try {
      let userSaved
      if (editUser) {
        const res = await fetch(`${API}/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        userSaved = await res.json()
        if (!res.ok) throw new Error(userSaved?.error || 'Mise à jour impossible')
        setUsers((prev) => prev.map((u) => (u.id === userSaved.id ? userSaved : u)))
        showSuccess('Utilisateur mis à jour')
      } else {
        const res = await fetch(`${API}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        userSaved = await res.json()
        if (!res.ok) throw new Error(userSaved?.error || 'Création impossible')
        setUsers((prev) => [...prev, userSaved])
        showSuccess('Utilisateur créé')
      }

      // Sauvegarder les rôles associés
      if (userSaved?.id) {
        const resRoles = await fetch(`${API}/users/${userSaved.id}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roles: userRoles }),
        })
        if (!resRoles.ok) showError('Erreur lors de l’association des rôles')
      }

      setVisible(false)
    } catch (e) {
      showError(e.message || 'Erreur lors de la sauvegarde')
    }
  }

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    try {
      const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' })
      if (!(res.ok || res.status === 204)) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || 'Suppression impossible')
      }
      setUsers((prev) => prev.filter((u) => u.id !== id))
      showSuccess('Utilisateur supprimé')
    } catch (e) {
      showError(e.message || 'Erreur lors de la suppression')
    }
  }
  // Styles dynamiques pour react-select (clair/sombre)
  const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--cui-body-bg'),
    color: getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color'),
    borderColor: '#444',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--cui-body-bg'),
    color: getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color'),
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#1a43a1' // violet sélectionné (comme Editor)
      : state.isFocused
      ? '#1a43a1' // violet plus clair au hover
      : getComputedStyle(document.documentElement).getPropertyValue('--cui-body-bg'),
    color: state.isSelected || state.isFocused ? '#fff' : getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color'),
    cursor: 'pointer',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#1a43a1', // violet pour les tags
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#fff',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#fff',
    ':hover': {
      backgroundColor: '#1a43a1',
      color: 'white',
    },
  }),
}


  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0">Utilisateurs</h2>

          <CButton color="primary" onClick={() => openOffcanvas()}>
            <CIcon icon={cilPlus} className="me-2" /> Nouvel utilisateur
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Username</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Display Name</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px', textAlign: 'center' }}>Actif</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px', textAlign: 'center' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map((u) => (
                <CTableRow key={u.id}>
                  <CTableDataCell>{u.id}</CTableDataCell>
                  <CTableDataCell>{u.username}</CTableDataCell>
                  <CTableDataCell>{u.email}</CTableDataCell>
                  <CTableDataCell>{u.display_name}</CTableDataCell>
                  <CTableDataCell style={{ width: '100px', textAlign: 'center' }}>{u.is_active ? (<CIcon icon={cilCheckCircle} className="text-success" />
  ) : (<CIcon icon={cilXCircle} className="text-danger" />)}</CTableDataCell>
                  <CTableDataCell style={{ width: '100px', textAlign: 'center' }}>
                    <CButton size="sm" color="secondary" className="me-2" variant="ghost"
                      onClick={() => openOffcanvas(u)}>
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton size="sm" color="danger" variant="ghost" onClick={() => handleDelete(u.id)}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* OFFCANVAS FORM */}
      <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)}  style={{ width: "33%" }}>
        <COffcanvasHeader>
          <h5>{editUser ? 'Éditer utilisateur' : 'Nouvel utilisateur'}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          <div className="d-flex flex-column gap-3">
            <div className="row">
  <div className="col-md-6">
    <CFormInput
      label="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
  </div>
  <div className="col-md-6">
    <CFormInput
      label="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>
</div>

<div className="row mt-3">
  <div className="col-md-6">
    <CFormInput
      label="Display Name"
      value={displayName}
      onChange={(e) => setDisplayName(e.target.value)}
    />
  </div>
  <div className="col-md-6 d-flex align-items-center">
    <CFormSwitch
      label="Actif"
      checked={isActive}
      onChange={(e) => setIsActive(e.target.checked)}
    />
  </div>
</div>

<div className="row mt-3">
   <div className="col-12">
    <label className="form-label">Rôles</label>
   <Select
  isMulti
  options={roles.map(r => ({ value: r.id, label: r.label }))}
  value={roles.filter(r => userRoles.includes(r.id)).map(r => ({ value: r.id, label: r.label }))}
  onChange={(selected) => {
    setUserRoles(selected.map(s => s.value))
  }}
  classNamePrefix="react-select"
  styles={customStyles}   // ✅ applique les styles dynamiques
/>

  </div>
</div>


            <div className="d-flex gap-2 justify-content-end mt-3">
              <CButton color="secondary" variant="ghost" onClick={() => setVisible(false)}>Annuler</CButton>
              <CButton color="primary" onClick={handleSave}>Enregistrer</CButton>
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
    </>
  )
}

export default Users
