import React, { useEffect, useState, useContext, useMemo } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput,
  CToaster, CToast, CToastBody,CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CFormCheck, CRow, CCol
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { Link } from 'react-router-dom'
import { cilTrash, cilPlus, cilEnvelopeClosed, cilSearch } from '@coreui/icons'
import ConfirmDeleteModal from "src/components/confirmations/ConfirmDeleteModal"
import ProtectedButton from "src/components/protected/ProtectedButton"
import { PermissionsContext } from 'src/context/PermissionsContext'
import { API_CONTACTS, API_ENTREPRISES, API_FORMS, API_FORM_DETAIL } from 'src/api'
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
// ✅ remplace TOUTE ta fonction fetchContacts par ceci
const fetchContacts = async () => {
  try {
    const res = await fetchWithAuth(`${API_CONTACTS}`)
    if (!res.ok) throw new Error('Impossible de charger les contacts')
    setContacts(await res.json())
  } catch (e) {
    showError(e.message || 'Erreur lors du chargement des contacts')
  }
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
      const resForm = await fetchWithAuth(API_FORM_DETAIL("contact"));
      if (!resForm.ok) throw new Error('Form contact introuvable')
      const meta = await resForm.json(); // { id, name, current_version, current_schema }
setForm({ id: meta.id, name: meta.name, schema: meta.current_schema });
    } catch (e) { showError(e.message) }
  }

  useEffect(() => {
    fetchContacts()
    fetchEntreprises()
    fetchForm()
  }, [])


// --------- COLONNES CUSTOM ---------

// --- Helpers préférences utilisateur ---
// Essaie de récupérer un identifiant stable d'utilisateur (JWT dans localStorage).
// Adapte 'access_token' si ton projet utilise un autre nom.
const getUserKey = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return 'anon'
    const payload = JSON.parse(atob(token.split('.')[1] || ''))
    return payload.sub || payload.user_id || payload.email || 'anon'
  } catch {
    return 'anon'
  }
}
const STORAGE_KEY = (uid) => `contacts.visibleCols.${uid}`
const loadCols = (uid, defaults) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(uid))
    return raw ? JSON.parse(raw) : defaults
  } catch {
    return defaults
  }
}
const saveCols = (uid, cols) => {
  try {
    localStorage.setItem(STORAGE_KEY(uid), JSON.stringify(cols))
  } catch {}
}

// 1. Config des colonnes
const allColumns = [
  { id: "name", label: "Nom complet", render: (c, fd) => `${fd.prenom || ""} ${fd.nom || ""}` },
  { id: "email", label: "Email", render: (c, fd) => fd.email || "-" },
  { id: "telephone", label: "Téléphone", render: (c, fd) => fd.telephone || "-" },
  { id: "poste", label: "Poste", render: (c, fd) => fd.poste || "-" },
  {
    id: "entreprise",
    label: "Entreprise",
    render: (c, fd) =>
      c.entreprise_id ? (
        <Link to={`/entreprises/${c.entreprise_id}`} className="text-primary fw-bold">
          {c.entreprise_nom || "Entreprise"}
        </Link>
      ) : (fd.entreprise || "-"),
  },
]

// 2. Colonnes visibles avec persistance par user
const userKey = useMemo(() => getUserKey(), [])
const defaultCols = useMemo(() => allColumns.map(c => c.id), [])
const [visibleCols, setVisibleCols] = useState(() => loadCols(userKey, defaultCols))

// Sauvegarde automatique à chaque changement
useEffect(() => {
  saveCols(userKey, visibleCols)
}, [userKey, visibleCols])

// 3. Toggle
const toggleCol = (colId) => {
  setVisibleCols(prev =>
    prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
  )
}

// (Optionnel) Reset aux valeurs par défaut
const resetCols = () => setVisibleCols(defaultCols)






  // ---------- OPEN SIDEBAR ----------
  const openOffcanvas = (contact = null) => {
    setEditContact(contact) // null = nouveau
    setVisible(true)
  }

  // ---------- SAVE from Formio ----------
 // ✅ remplace TOUTE ta fonction saveFromFormio par ceci
const saveFromFormio = async (data) => {
  try {
    const clean = { ...data }
    delete clean.submit

    if (editContact) {
      const res = await fetchWithAuth(`${API_CONTACTS}/${editContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editContact, form_data: clean }),
      })
      if (!res.ok) throw new Error('Mise à jour impossible')
      showSuccess('Contact mis à jour')
    } else {
      const res = await fetchWithAuth(`${API_CONTACTS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_data: clean }),
      })
      if (!res.ok) throw new Error('Création impossible')
      showSuccess('Contact créé')
    }

    await fetchContacts()
    setVisible(false)
  } catch (e) {
    console.error('❌ saveFromFormio:', e)
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
       
          <div className="d-flex gap-2">
  <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="contact.new">
    <CButton color="primary" onClick={() => openOffcanvas()}>
      <CIcon icon={cilPlus} className="me-2" /> Nouveau contact
    </CButton>
  </ProtectedButton>

  
</div>

        </CCardHeader>

        <CCardBody>
          <CRow className="g-2 mb-3 align-middle">
  <CCol md>
          <CFormInput
            className="mb-3"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          /></CCol>
          <CCol md="auto">
          <CDropdown>
    <CDropdownToggle color="secondary">Colonnes</CDropdownToggle>
    <CDropdownMenu>
      {allColumns.map(col => (
        <CDropdownItem key={col.id} className="d-flex align-items-center">
          <CFormCheck
            id={`col-${col.id}`}
            checked={visibleCols.includes(col.id)}
            onChange={() => toggleCol(col.id)}
            label={col.label}
          />
        </CDropdownItem>
      ))}
      <CDropdownItem onClick={resetCols} className="text-danger">Réinitialiser</CDropdownItem>
    </CDropdownMenu>
  </CDropdown></CCol>
</CRow>
          <CTable striped hover responsive className="align-middle">
            <CTableHead>
              <CTableRow>
                {allColumns
                  .filter((col) => visibleCols.includes(col.id))
                  .map((col) => (
                    <CTableHeaderCell key={col.id}>{col.label}</CTableHeaderCell>
                  ))}
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
                   {allColumns
                      .filter((col) => visibleCols.includes(col.id))
                      .map((col) => (
                        <CTableDataCell key={col.id}>{col.render(c, fd)}</CTableDataCell>
                      ))}
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
    <CTableDataCell colSpan={visibleCols.length + 1} className="text-center">Aucun contact trouvé</CTableDataCell>
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
  key={`${form?.id}-${editContact?.id || 'new'}`}
  form={form}
  submission={editContact?.form_data ? { data: editContact.form_data } : { data: {} }}
  onSave={saveFromFormio}
/>

          )}
          
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
