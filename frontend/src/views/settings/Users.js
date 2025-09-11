import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput, CFormSwitch,
  CToaster, CToast, CToastBody,CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilCheckCircle, cilXCircle, cilSend } from '@coreui/icons'
import Select from 'react-select'
import { API_USERS, API_ROLES } from 'src/api'
import ConfirmDeleteModal from "../../components/confirmations/ConfirmDeleteModal"
import ProtectedButton from "../../components/protected/ProtectedButton"
import { PermissionsContext } from '/src/context/PermissionsContext'
import { fetchWithAuth } from "../../utils/auth";

const Users = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [visible, setVisible] = useState(false)
  const [page, setPage] = useState(1)
const [perPage, setPerPage] = useState(10)

  // form state
  const [editUser, setEditUser] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [userRoles, setUserRoles] = useState([])

  const { actionsConfig, currentUserRoles } = useContext(PermissionsContext)

  // ---------- TOASTS ----------
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  })
  const [search, setSearch] = useState('')

  const filteredUsers = users.filter((u) => {
  const term = search.toLowerCase()
  return (
    u.username?.toLowerCase().includes(term) ||
    u.email?.toLowerCase().includes(term) ||
    u.firstName?.toLowerCase().includes(term) ||
    u.lastName?.toLowerCase().includes(term) ||
    (u.enabled ? 'actif' : 'inactif').includes(term) ||
    (u.roles ? u.roles.join(' ').toLowerCase() : '').includes(term)
  )
})

const totalPages = Math.ceil(filteredUsers.length / perPage)
const paginatedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage)


  // ---------- FETCH DATA ----------
  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth(`${API_USERS}`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Impossible de charger les utilisateurs')
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      showError(e.message || 'Erreur lors du chargement des utilisateurs')
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await fetchWithAuth(`${API_ROLES}`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Impossible de charger les rôles')
      const data = await res.json()
      setRoles(data)
    } catch (e) {
      showError(e.message || 'Erreur lors du chargement des rôles')
    }
  }

  const fetchUserRoles = async (id) => {
    try {
      const res = await fetchWithAuth(`${API_USERS}/${id}/roles`, { headers: getAuthHeaders() })
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
      setEmail(user.email || '')
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
      setIsActive(user.enabled)

      // Charger ses rôles
      const r = await fetchUserRoles(user.id)
      setUserRoles(r.map((role) => role.name))
    } else {
      setEditUser(null)
      setUsername('')
      setEmail('')
      setFirstName('')
      setLastName('')
      setIsActive(true)
      setUserRoles([])
    }
    setVisible(true)
  }

  const handleSave = async () => {
    const payload = {
      username,
      email,
      enabled: isActive,
      firstName,
      lastName,
    }

    try {
      let userId = editUser?.id

      // --- CREATE OR UPDATE USER ---
      if (editUser) {
        const res = await fetchWithAuth(`${API_USERS}/${editUser.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Mise à jour impossible')
        showSuccess('Utilisateur mis à jour')
      } else {
        const res = await fetchWithAuth(`${API_USERS}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Création impossible')
        const newUser = await res.json()
        userId = newUser.id
        showSuccess('Utilisateur créé')
      }

      // --- UPDATE ROLES ---
      if (userId) {
        const existingRoles = await fetchUserRoles(userId)

        // Supprimer les rôles actuels
        if (existingRoles.length > 0) {
          await fetchWithAuth(`${API_USERS}/${userId}/roles`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            body: JSON.stringify(existingRoles), // tableau direct attendu par le backend
          })
        }

        // Ajouter les rôles sélectionnés
        const selectedRoles = roles.filter((r) => userRoles.includes(r.name))
        if (selectedRoles.length > 0) {
          await fetchWithAuth(`${API_USERS}/${userId}/roles`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(selectedRoles), // tableau direct attendu par le backend
          })
        }

        showSuccess('Rôles mis à jour')
      }

      await fetchUsers()
      setVisible(false)
    } catch (e) {
      showError(e.message || 'Erreur lors de la sauvegarde')
    }
  }

  // ---------- SEARCH ----------
 

  // Styles dynamiques pour react-select
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
        ? '#1a43a1'
        : state.isFocused
          ? '#1a43a1'
          : getComputedStyle(document.documentElement).getPropertyValue('--cui-body-bg'),
      color: state.isSelected || state.isFocused ? '#fff' : getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color'),
      cursor: 'pointer',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#1a43a1',
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
    <><div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Édition des utilisateurs</span>
          <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="user.new">
            <CButton color="primary" onClick={() => openOffcanvas()}>
              <CIcon icon={cilPlus} className="me-2" /> Nouvel utilisateur
            </CButton>
          </ProtectedButton>
        </CCardHeader>
        <CCardBody>
          {/* Champ recherche */}
          <CFormInput
            className="mb-3"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CTable striped hover responsive className="align-middle">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Identifiant</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Nom complet</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px', textAlign: 'center' }}>Actif</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: 'center' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginatedUsers.length ? (
    paginatedUsers.map((u) => (
                  <CTableRow key={u.id}>
                    <CTableDataCell>{u.username}</CTableDataCell>
                    <CTableDataCell>{u.email}</CTableDataCell>
                    <CTableDataCell>{`${u.firstName || ''} ${u.lastName || ''}`}</CTableDataCell>
                    <CTableDataCell style={{ width: '100px', textAlign: 'center' }}>
                      {u.enabled ? (
                        <CIcon icon={cilCheckCircle} className="text-success" size="lg" />
                      ) : (
                        <CIcon icon={cilXCircle} className="text-danger" size="lg" />
                      )}
                    </CTableDataCell>
                    <CTableDataCell style={{ textAlign: 'center' }}>
                    <ProtectedButton
  action="user.sendInitMail"
  actionsConfig={actionsConfig}
  currentUserRoles={currentUserRoles}
>
  <CButton
    size="sm"
    color="info"
    className="me-2"
    variant="ghost"
    onClick={async () => {
      try {
        const res = await fetchWithAuth(`${API_USERS}/${u.id}/send-initial-email`, {
          method: "POST",
          headers: getAuthHeaders(),
        })
        if (!res.ok) {
          const errText = await res.text()
          throw new Error(errText || "Impossible d’envoyer l’email")
        }
        showSuccess("Email d’initialisation envoyé (Keycloak)")
      } catch (e) {
        showError(e.message)
      }
    }}
  >
    <CIcon icon={cilSend} size="lg" />
  </CButton>
</ProtectedButton>

                      <ProtectedButton
                        action="user.edit"
                        actionsConfig={actionsConfig}
                        currentUserRoles={currentUserRoles}
                      >
                        <CButton
                          size="sm"
                          color="success"
                          className="me-2"
                          variant="ghost"
                          onClick={() => openOffcanvas(u)}
                        >
                          <CIcon icon={cilPencil} size="lg" />
                        </CButton>
                      </ProtectedButton>
                      <ProtectedButton
                        action="user.delete"
                        actionsConfig={actionsConfig}
                        currentUserRoles={currentUserRoles}
                      >
                        {u.username.includes("reunion") ? (
                          <CButton size="sm" color="secondary" variant="ghost" disabled>
                            <CIcon icon={cilTrash} size="lg" />
                          </CButton>
                        ) : (
                          <ConfirmDeleteModal
                            title="Supprimer l'utilisateur"
                            message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
                            trigger={
                              <CButton size="sm" color="danger" variant="ghost">
                                <CIcon icon={cilTrash} size="lg" />
                              </CButton>
                            }
                            onConfirm={async () => {
                              const res = await fetchWithAuth(`${API_USERS}/${u.id}`, { method: "DELETE" })
                              if (!res.ok) {
                                const errorText = await res.text()
                                throw new Error(errorText || "Suppression impossible")
                              }
                              setUsers((prev) => prev.filter((user) => user.id !== u.id))
                              showSuccess("Utilisateur supprimé")
                            }}
                          />
                        )}
                      </ProtectedButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center">
                    Aucun utilisateur trouvé
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
<div className="d-flex justify-content-between align-items-center mt-3">
  <span>Résultats : {filteredUsers.length}</span>
  <CFormSelect
    value={perPage}
    style={{ width: '120px' }}
    onChange={(e) => {
      setPerPage(Number(e.target.value))
      setPage(1) // reset page
    }}
    options={[
      { label: '10 / page', value: 10 },
      { label: '20 / page', value: 20 },
      { label: '50 / page', value: 50 },
    ]}
  />
</div>

<div className="d-flex justify-content-center align-items-center mt-3 gap-3">
  <CButton disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
    Précédent
  </CButton>
  <span>
    Page {page} / {totalPages || 1}
  </span>
  <CButton disabled={page === totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
    Suivant
  </CButton>
</div>

        </CCardBody>
      </CCard>

      {/* OFFCANVAS FORM */}
      <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)} style={{ width: "33%" }}>
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
                  label="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <CFormInput
                  label="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="row mt-3">
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
                  options={roles.map(r => ({ value: r.name, label: r.name }))}
                  value={roles.filter(r => userRoles.includes(r.name)).map(r => ({ value: r.name, label: r.name }))}
                  onChange={(selected) => {
                    setUserRoles(selected.map(s => s.value))
                  }}
                  classNamePrefix="react-select"
                  styles={customStyles}
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
    </div>
    </>
  )
}

export default Users
