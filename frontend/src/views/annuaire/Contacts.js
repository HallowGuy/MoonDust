import React, { useEffect, useState, useContext, useMemo } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput,
  CToaster, CToast, CToastBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { Link } from 'react-router-dom'
import { cilTrash, cilPlus, cilEnvelopeClosed, cilSearch } from '@coreui/icons'
import ConfirmDeleteModal from "src/components/confirmations/ConfirmDeleteModal"
import ProtectedButton from "src/components/protected/ProtectedButton"
import { PermissionsContext } from 'src/context/PermissionsContext'
import { API_CONTACTS, API_ENTREPRISES, API_FORM_CONFIG } from 'src/api'
import { fetchWithAuth } from 'src/utils/auth'
import FormioRenderer from 'src/views/forms/FormioRenderer'

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [entreprises, setEntreprises] = useState([])
  const [visible, setVisible] = useState(false)
  const [editContact, setEditContact] = useState(null)
  const [form, setForm] = useState(null)

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
  const toText = (v) => (v == null ? "" : String(v)) // safe pour toLowerCase
const fdOf = (c) => c?.form_data || {}
  // ---------- FETCH ----------
  const fetchContacts = async () => {
    try {
      const res = await fetchWithAuth(`${API_CONTACTS}`)
      if (!res.ok) throw new Error('Impossible de charger les contacts')
      setContacts(await res.json())
    } catch (e) { showError(e.message) }
  }

  const fetchEntreprises = async () => {
    try {
      const res = await fetchWithAuth(`${API_ENTREPRISES}`)
      if (!res.ok) throw new Error('Impossible de charger les entreprises')
      setEntreprises(await res.json())
    } catch (e) { showError(e.message) }
  }
  const entreprisesMap = useMemo(
  () => Object.fromEntries(entreprises.map(e => [e.id, e.nom])),
  [entreprises]
)
  const fetchForm = async () => {
    try {
      // ⚠️ utilise l'id de ton formulaire contact (ici "toto")
      const res = await fetchWithAuth(`${API_FORM_CONFIG}/contact`)
      if (!res.ok) throw new Error('Form contact introuvable')
      setForm(await res.json())
    } catch (e) { showError(e.message) }
  }

  useEffect(() => {
    fetchContacts()
    fetchEntreprises()
    fetchForm()
  }, [])

  // ---------- OPEN SIDEBAR ----------
  const openOffcanvas = (contact = null) => {
    setEditContact(contact) // null = nouveau
    setVisible(true)
  }

  // ---------- SAVE from Formio ----------
  const saveFromFormio = async (data) => {
    // data = JSON brut { prenom?, nom?, email?, telephone?, poste?, entreprise_id?, ... }
    const clean = { ...data }
    delete clean.submit

    // Colonnes "fixes" connues (si présentes dans le JSON)
    const fixed = {
      entreprise_id: clean.entreprise_id ?? (editContact?.entreprise_id ?? null),
      prenom:        clean.prenom        ?? (editContact?.prenom ?? null),
      nom:           clean.nom           ?? (editContact?.nom ?? null),
      email:         clean.email         ?? (editContact?.email ?? null),
      telephone:     clean.telephone     ?? (editContact?.telephone ?? null),
      poste:         clean.poste         ?? (editContact?.poste ?? null),
      civilite:      clean.civilite      ?? (editContact?.civilite ?? null),
      adresse:       clean.adresse       ?? (editContact?.adresse ?? null),
      ville:         clean.ville         ?? (editContact?.ville ?? null),
      pays:          clean.pays          ?? (editContact?.pays ?? null),
      tags:          clean.tags          ?? (editContact?.tags ?? null),
      source:        clean.source        ?? (editContact?.source ?? null),
      statut:        clean.statut        ?? (editContact?.statut ?? null),
      notes:         clean.notes         ?? (editContact?.notes ?? null),
    }

    try {
      if (editContact) {
        const res = await fetchWithAuth(`${API_CONTACTS}/${editContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editContact, ...fixed, form_data: clean }),
        })
        if (!res.ok) throw new Error('Mise à jour impossible')
        showSuccess('Contact mis à jour')
      } else {
        const res = await fetchWithAuth(`${API_CONTACTS}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fixed, form_data: clean }),
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
  const fd = fdOf(c)
  const term = search.toLowerCase()
  return (
    toText(fd.prenom).toLowerCase().includes(term) ||
    toText(fd.nom).toLowerCase().includes(term) ||
    toText(fd.email).toLowerCase().includes(term) ||
    toText(fd.telephone).toLowerCase().includes(term) ||
    toText(fd.poste).toLowerCase().includes(term) ||
    toText(fd.entreprise).toLowerCase().includes(term) ||
    toText(entreprisesMap[c.entreprise_id]).toLowerCase().includes(term)
  )
})


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
              {filteredContacts.length ? filteredContacts.map((c) => {
  const fd = fdOf(c)
  const entrepriseNom = c.entreprise_id
    ? (entreprisesMap[c.entreprise_id] || fd.entreprise || "-")
    : (fd.entreprise || "-")

  return (
                  <CTableRow key={c.id}>
                    <CTableDataCell>{`${fd.prenom || ""} ${fd.nom || ""}`}</CTableDataCell>
      <CTableDataCell>{fd.email || "-"}</CTableDataCell>
      <CTableDataCell>{fd.telephone || "-"}</CTableDataCell>
      <CTableDataCell>{fd.poste || "-"}</CTableDataCell>
                    <CTableDataCell>
                      {c.entreprise_id ? (
                        <Link to={`/entreprises/${c.entreprise_id}`} className="text-primary fw-bold">
                          {c.entreprise_nom || 'Entreprise'}
                        </Link>
                      ) : ('-')}
                    </CTableDataCell>
                    <CTableDataCell style={{ textAlign: 'center' }}>
                      <ProtectedButton action="contact.view" actionsConfig={actionsConfig} currentUserRoles={currentUserRoles}>
                        <Link to={`/annuaire/contacts/${c.id}`}>
                          <CButton size="sm" className="me-2" color="success" variant="ghost">
                            <CIcon icon={cilSearch} size="lg" />
                          </CButton>
                        </Link>
                      </ProtectedButton>

                      <CButton size="sm" color="info" className="me-2" variant="ghost"
                        onClick={() => window.location.href = `mailto:${c.email}`}>
                        <CIcon icon={cilEnvelopeClosed} size="lg" />
                      </CButton>

                      <ProtectedButton action="contact.delete" actionsConfig={actionsConfig} currentUserRoles={currentUserRoles}>
                        <ConfirmDeleteModal
                          title="Supprimer le contact"
                          message="Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible."
                          trigger={<CButton size="sm" color="danger" variant="ghost"><CIcon icon={cilTrash} size="lg" /></CButton>}
                          onConfirm={async () => {
                            const res = await fetch(`${API_CONTACTS}/${c.id}`, { method: "DELETE" })
                            if (!res.ok) throw new Error(await res.text() || "Suppression impossible")
                            setContacts(prev => prev.filter(x => x.id !== c.id))
                            showSuccess("Contact supprimé")
                          }}
                        />
                      </ProtectedButton>
                    </CTableDataCell>
                  </CTableRow>
                )
}) : (
  <CTableRow>
    <CTableDataCell colSpan={6} className="text-center">Aucun contact trouvé</CTableDataCell>
  </CTableRow>
)}

            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* OFFCANVAS = Formio */}
      <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)} style={{ width: "33%" }}>
        <COffcanvasHeader>
          <h5>{editContact ? 'Éditer contact' : 'Nouveau contact'}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          {!form ? (
            <p>Chargement du formulaire…</p>
          ) : (
            <FormioRenderer
              form={form}
              submission={editContact?.form_data || {}}
              onSave={saveFromFormio}
            />
          )}
          <div className="text-end mt-3">
            <CButton color="secondary" variant="ghost" onClick={() => setVisible(false)}>Fermer</CButton>
          </div>
        </COffcanvasBody>
      </COffcanvas>

      {/* TOASTER */}
      <CToaster placement="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((t) => (
          <CToast key={t.id} visible autohide delay={3000} color={t.color} onClose={() => removeToast(t.id)}>
            <CToastBody className="text-white">{t.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>
    </div>
  )
}

export default Contacts
