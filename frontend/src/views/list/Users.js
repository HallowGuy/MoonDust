import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput, CFormSwitch, CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'

const API = import.meta.env.VITE_API_URL

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

  // ---------- FETCH DATA ----------
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`)
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      console.error('❌ Impossible de charger les utilisateurs', e)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API}/roles`)
      const data = await res.json()
      setRoles(data)
    } catch (e) {
      console.error('❌ Impossible de charger les rôles', e)
    }
  }

  const fetchUserRoles = async (id) => {
    try {
      const res = await fetch(`${API}/users/${id}/roles`)
      if (!res.ok) return []
      return await res.json()
    } catch (e) {
      console.error('❌ Impossible de charger les rôles utilisateur', e)
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
        setUsers((prev) => prev.map((u) => (u.id === userSaved.id ? userSaved : u)))
      } else {
        const res = await fetch(`${API}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        userSaved = await res.json()
        setUsers((prev) => [...prev, userSaved])
      }

      // Sauvegarder les rôles associés
      if (userSaved?.id) {
        await fetch(`${API}/users/${userSaved.id}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roles: userRoles }),
        })
      }

      setVisible(false)
    } catch (e) {
      console.error('❌ Erreur sauvegarde', e)
    }
  }

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    try {
      await fetch(`${API}/users/${id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (e) {
      console.error('❌ Erreur suppression', e)
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Utilisateurs</span>
          <CButton color="primary" onClick={() => openOffcanvas()}>
            <CIcon icon={cilPlus} className="me-2" /> Nouvel tilisateur
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
                  <CTableDataCell style={{ width: '100px', textAlign: 'center' }}>{u.is_active ? '✅' : '❌'}</CTableDataCell>
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
      <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)}>
        <COffcanvasHeader>
          <h5>{editUser ? 'Éditer utilisateur' : 'Nouvel utilisateur'}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          <div className="d-flex flex-column gap-3">
            <CFormInput label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <CFormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <CFormInput label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <CFormSwitch label="Actif" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />

            {/* Multi-select pour les rôles */}
            <CFormSelect
              label="Rôles"
              multiple
              value={userRoles}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (opt) => Number(opt.value))
                setUserRoles(selected)
              }}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </CFormSelect>

            <div className="d-flex gap-2 justify-content-end mt-3">
              <CButton color="secondary" variant="ghost" onClick={() => setVisible(false)}>Annuler</CButton>
              <CButton color="primary" onClick={handleSave}>Enregistrer</CButton>
            </div>
          </div>
        </COffcanvasBody>
      </COffcanvas>
    </>
  )
}

export default Users
