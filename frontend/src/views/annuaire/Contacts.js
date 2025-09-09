import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput,
  CToaster, CToast, CToastBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { Link } from 'react-router-dom'

import { cilPencil, cilTrash, cilPlus, cilEnvelopeClosed,cilSearch } from '@coreui/icons'
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal"
import ProtectedButton from "../../components/ProtectedButton"
import { PermissionsContext } from '/src/context/PermissionsContext'
import { API_CONTACTS, API_ENTREPRISES } from 'src/api'
import Select from 'react-select'

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [entreprises, setEntreprises] = useState([])
  const [visible, setVisible] = useState(false)

  // form state
  const [editContact, setEditContact] = useState(null)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [poste, setPoste] = useState('')
  const [entrepriseId, setEntrepriseId] = useState(null)

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

  // ---------- FETCH DATA ----------
  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_CONTACTS}`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Impossible de charger les contacts')
      const data = await res.json()
      setContacts(data)
    } catch (e) {
      showError(e.message || 'Erreur lors du chargement des contacts')
    }
  }

  const fetchEntreprises = async () => {
    try {
      const res = await fetch(`${API_ENTREPRISES}`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Impossible de charger les entreprises')
      const data = await res.json()
      setEntreprises(data)
    } catch (e) {
      showError(e.message || 'Erreur lors du chargement des entreprises')
    }
  }

  useEffect(() => {
    fetchContacts()
    fetchEntreprises()
  }, [])

  // ---------- OPEN SIDEBAR ----------
  const openOffcanvas = (contact = null) => {
    if (contact) {
      setEditContact(contact)
      setPrenom(contact.prenom || '')
      setNom(contact.nom || '')
      setEmail(contact.email || '')
      setTelephone(contact.telephone || '')
      setPoste(contact.poste || '')
      setEntrepriseId(contact.entreprise_id || null)
    } else {
      setEditContact(null)
      setPrenom('')
      setNom('')
      setEmail('')
      setTelephone('')
      setPoste('')
      setEntrepriseId(null)
    }
    setVisible(true)
  }

  const handleSave = async () => {
    const payload = { prenom, nom, email, telephone, poste, entreprise_id: entrepriseId }
    try {
      if (editContact) {
        const res = await fetch(`${API_CONTACTS}/${editContact.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Mise à jour impossible')
        showSuccess('Contact mis à jour')
      } else {
        const res = await fetch(`${API_CONTACTS}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Création impossible')
        showSuccess('Contact créé')
      }
      await fetchContacts()
      setVisible(false)
    } catch (e) {
      showError(e.message || 'Erreur lors de la sauvegarde')
    }
  }

  // ---------- SEARCH ----------
  const [search, setSearch] = useState('')
  const filteredContacts = contacts.filter((c) => {
    const term = search.toLowerCase()
    return (
      c.prenom?.toLowerCase().includes(term) ||
      c.nom?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.telephone?.toLowerCase().includes(term) ||
      c.poste?.toLowerCase().includes(term) ||
      c.entreprise_nom?.toLowerCase().includes(term)
    )
  })

  // Options pour react-select
  const entrepriseOptions = entreprises.map(e => ({ value: e.id, label: e.nom }))

  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Contacts</span>
          <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="contact.new">
            <CButton color="primary" onClick={() => openOffcanvas()}>
              <CIcon icon={cilPlus} className="me-2" /> Nouveau contact
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
                <CTableHeaderCell>Nom complet</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Téléphone</CTableHeaderCell>
                <CTableHeaderCell>Poste</CTableHeaderCell>
                <CTableHeaderCell>Entreprise</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: 'center' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredContacts.length ? (
                filteredContacts.map((c) => (
                  <CTableRow key={c.id}>
                    <CTableDataCell>{`${c.prenom || ''} ${c.nom || ''}`}</CTableDataCell>
                    <CTableDataCell>{c.email}</CTableDataCell>
                    <CTableDataCell>{c.telephone}</CTableDataCell>
                    <CTableDataCell>{c.poste}</CTableDataCell>
                    <CTableDataCell>{c.entreprise_id ? (
    <Link to={`/entreprises/${c.entreprise_id}`} className="text-primary fw-bold">
      {c.entreprise_nom || "Entreprise"}
    </Link>
  ) : (
    "-"
  )}</CTableDataCell>
                    <CTableDataCell style={{ textAlign: 'center' }}>
                        <ProtectedButton
                        action="contact.view"
                        actionsConfig={actionsConfig}
                        currentUserRoles={currentUserRoles}
                      >
                        <Link to={`/annuaire/contacts/${c.id}`}>
  <CButton size="sm" className="me-2" color="success" variant="ghost"><CIcon icon={cilSearch} size="lg" /></CButton>
</Link>
                      </ProtectedButton>
                        <CButton size="sm" color="info" className="me-2" variant="ghost" onClick={() => window.location.href = `mailto:${c.email}`} >
    <CIcon icon={cilEnvelopeClosed} size="lg" /> 
      </CButton>
                      
                      <ProtectedButton
                        action="contact.delete"
                        actionsConfig={actionsConfig}
                        currentUserRoles={currentUserRoles}
                      >
                        <ConfirmDeleteModal
                          title="Supprimer le contact"
                          message="Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible."
                          trigger={
                            <CButton size="sm" color="danger" variant="ghost">
                              <CIcon icon={cilTrash} size="lg" />
                            </CButton>
                          }
                          onConfirm={async () => {
                            const res = await fetch(`${API_CONTACTS}/${c.id}`, { method: "DELETE" })
                            if (!res.ok) {
                              const errorText = await res.text()
                              throw new Error(errorText || "Suppression impossible")
                            }
                            setContacts((prev) => prev.filter((contact) => contact.id !== c.id))
                            showSuccess("Contact supprimé")
                          }}
                        />
                      </ProtectedButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={6} className="text-center">
                    Aucun contact trouvé
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* OFFCANVAS FORM */}
      <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)} style={{ width: "33%" }}>
        <COffcanvasHeader>
          <h5>{editContact ? 'Éditer contact' : 'Nouveau contact'}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          <div className="d-flex flex-column gap-3">
            <div className="row">
              <div className="col-md-6">
                <CFormInput
                  label="Prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <CFormInput
                  label="Nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <CFormInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <CFormInput
                  label="Téléphone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <CFormInput
                  label="Poste"
                  value={poste}
                  onChange={(e) => setPoste(e.target.value)}
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <label className="form-label">Entreprise</label>
                <Select
                  options={entrepriseOptions}
                  value={entrepriseOptions.find(opt => opt.value === entrepriseId) || null}
                  onChange={(opt) => setEntrepriseId(opt?.value || null)}
                  placeholder="Sélectionner une entreprise"
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
  )
}

export default Contacts
