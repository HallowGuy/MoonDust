import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CRow, CCol, CFormInput, CBadge,
  CButton, CToaster, CToast, CToastBody, CSpinner
} from '@coreui/react'
import { API_USERS, CLIENT_ID } from 'src/api'
import { rolesFromToken, decodeJwt } from '@/lib/jwt'
import { isTokenExpired } from '@/lib/http'

// couleurs pour rôles
const ROLE_COLORS = {
  admin: 'danger',
  contribute: 'primary',
  read: 'info',
  manager: 'warning',
  user: 'success',
}

const Profil = () => {
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // champs modifiables
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  // toasts
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
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  })

  // charger infos utilisateur connecté (depuis le JWT) + rôles (depuis le JWT)
  useEffect(() => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem('access_token')
        window.location.replace('/login')
        return
      }

      const payload = decodeJwt(token)
      if (!payload) {
        setError('Token invalide')
        return
      }

      // infos de base depuis le token
      const userObj = {
        id: payload.sub,
        username: payload.preferred_username,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
      }
      setUser(userObj)
      setFirstName(userObj.firstName || '')
      setLastName(userObj.lastName || '')
      setEmail(userObj.email || '')

      // ✅ rôles directement depuis le JWT (realm + client)
      const r = rolesFromToken(token, CLIENT_ID) // déjà en lowercase + uniques
      setRoles(r)
    } catch (err) {
      setError(err.message || 'Erreur de lecture du token')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSave = async () => {
    if (!user) return
    try {
      const payload = {
        firstName,
        lastName,
        email,
        username: user.username,
      }
      const res = await fetch(`${API_USERS}/${user.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Impossible de mettre à jour le profil')
      showSuccess('Profil mis à jour')
    } catch (e) {
      showError(e.message)
    }
  }

  if (loading) return <CSpinner color="primary" />
  if (error) return <p className="text-danger">❌ {error}</p>

  return (
    <div className="container py-4">
      <CCard>
        <CCardHeader>
          <h2 className="mb-0">Mon Profil</h2>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput label="Nom d’utilisateur" value={user?.username || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={12}>
              <label className="form-label">Rôles</label>
              <div>
                {roles.length
                  ? roles.map((role) => (
                      <CBadge
                        key={role}
                        color={ROLE_COLORS[role.toLowerCase()] || 'secondary'}
                        className="me-2"
                      >
                        {role}
                      </CBadge>
                    ))
                  : 'Aucun'}
              </div>
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end">
            <CButton color="primary" onClick={handleSave}>
              Enregistrer
            </CButton>
          </div>
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
  )
}

export default Profil
