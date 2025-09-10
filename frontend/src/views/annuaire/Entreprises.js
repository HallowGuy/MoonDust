import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput,
  CToaster, CToast, CToastBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilPeople } from '@coreui/icons'
import { API_ENTREPRISES, API_CONTACTS } from 'src/api'
import ConfirmDeleteModal from "../../components/confirmations/ConfirmDeleteModal"
import ProtectedButton from "../../components/protected/ProtectedButton"
import { PermissionsContext } from '/src/context/PermissionsContext'

const Entreprises = () => {
  const [entreprises, setEntreprises] = useState([])
  const [contacts, setContacts] = useState([])
  const [visible, setVisible] = useState(false)
  const [visibleContacts, setVisibleContacts] = useState(false)
  const [selectedEntreprise, setSelectedEntreprise] = useState(null)

  // form state
  const [editEntreprise, setEditEntreprise] = useState(null)
  const [nom, setNom] = useState('')
  const [secteur, setSecteur] = useState('')
  const [adresse, setAdresse] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [siteWeb, setSiteWeb] = useState('')

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

  // ---------- FETCH ----------
  const fetchEntreprises = async () => {
    try {
      const res = await fetch(API_ENTREPRISES, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Impossible de charger les entreprises')
      setEntreprises(await res.json())
    } catch (e) { showError(e.message) }
  }

  const fetchContacts = async () => {
    try {
      const res = await fetch(API_CONTACTS, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Impossible de charger les contacts')
      setContacts(await res.json())
    } catch (e) { showError(e.message) }
  }

  useEffect(() => { 
    fetchEntreprises()
    fetchContacts()
  }, [])

  // ---------- OPEN SIDEBAR ENTREPRISE ----------
  const openOffcanvas = (e = null) => {
    if (e) {
      setEditEntreprise(e)
      setNom(e.nom || '')
      setSecteur(e.secteur || '')
      setAdresse(e.adresse || '')
      setTelephone(e.telephone || '')
      setEmail(e.email || '')
      setSiteWeb(e.site_web || '')
    } else {
      setEditEntreprise(null)
      setNom(''); setSecteur(''); setAdresse(''); setTelephone(''); setEmail(''); setSiteWeb('')
    }
    setVisible(true)
  }

  // ---------- OPEN CONTACTS VIEW ----------
  const openContactsView = (entreprise) => {
    setSelectedEntreprise(entreprise)
    setVisibleContacts(true)
  }

  const handleSave = async () => {
    const payload = { nom, secteur, adresse, telephone, email, site_web: siteWeb }
    try {
      if (editEntreprise) {
        const res = await fetch(`${API_ENTREPRISES}/${editEntreprise.id}`, {
          method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Mise à jour impossible')
        showSuccess('Entreprise mise à jour')
      } else {
        const res = await fetch(API_ENTREPRISES, {
          method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Création impossible')
        showSuccess('Entreprise créée')
      }
      await fetchEntreprises()
      setVisible(false)
    } catch (e) { showError(e.message) }
  }

  // ---------- SEARCH ----------
  const [search, setSearch] = useState('')
  const filtered = entreprises.filter(e =>
    [e.nom, e.secteur, e.adresse, e.telephone, e.email, e.site_web]
      .some(val => val?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container py-4">
      <CCard>
        <CCardHeader className="d-flex justify-content-between">
          <span>Entreprises</span>
          <ProtectedButton action="entreprise.new" actionsConfig={actionsConfig} currentUserRoles={currentUserRoles}>
            <CButton color="primary" onClick={() => openOffcanvas()}>
              <CIcon icon={cilPlus} className="me-2"/> Nouvelle entreprise
            </CButton>
          </ProtectedButton>
        </CCardHeader>
        <CCardBody>
          <CFormInput placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="mb-3"/>

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Secteur</CTableHeaderCell>
                <CTableHeaderCell>Adresse</CTableHeaderCell>
                <CTableHeaderCell>Téléphone</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Site web</CTableHeaderCell>
                <CTableHeaderCell style={{textAlign:'center'}}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.length ? filtered.map(e =>
                <CTableRow key={e.id}>
                  <CTableDataCell>{e.nom}</CTableDataCell>
                  <CTableDataCell>{e.secteur}</CTableDataCell>
                  <CTableDataCell>{e.adresse}</CTableDataCell>
                  <CTableDataCell>{e.telephone}</CTableDataCell>
                  <CTableDataCell>{e.email}</CTableDataCell>
                  <CTableDataCell>{e.site_web}</CTableDataCell>
                  <CTableDataCell style={{textAlign:'center'}}>
                    <CButton size="sm" color="info" variant="ghost" onClick={() => openContactsView(e)}>
                      <CIcon icon={cilPeople} size="lg"/>
                    </CButton>
                    <ProtectedButton action="entreprise.edit" actionsConfig={actionsConfig} currentUserRoles={currentUserRoles}>
                      <CButton size="sm" color="success" variant="ghost" onClick={() => openOffcanvas(e)}>
                        <CIcon icon={cilPencil} size="lg"/>
                      </CButton>
                    </ProtectedButton>
                    <ProtectedButton action="entreprise.delete" actionsConfig={actionsConfig} currentUserRoles={currentUserRoles}>
                      <ConfirmDeleteModal
                        title="Supprimer l'entreprise"
                        message="Êtes-vous sûr de vouloir supprimer cette entreprise ?"
                        trigger={<CButton size="sm" color="danger" variant="ghost"><CIcon icon={cilTrash} size="lg"/></CButton>}
                        onConfirm={async () => {
                          const res = await fetch(`${API_ENTREPRISES}/${e.id}`, { method:"DELETE", headers:getAuthHeaders() })
                          if(!res.ok) throw new Error("Suppression impossible")
                          setEntreprises(prev => prev.filter(ent => ent.id !== e.id))
                          showSuccess("Entreprise supprimée")
                        }}
                      />
                    </ProtectedButton>
                  </CTableDataCell>
                </CTableRow>
              ) : <CTableRow><CTableDataCell colSpan={7} className="text-center">Aucune entreprise</CTableDataCell></CTableRow>}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* OFFCANVAS FORM ENTREPRISE */}
      <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)} style={{width:"25%"}}>
        <COffcanvasHeader><h5>{editEntreprise ? 'Éditer entreprise' : 'Nouvelle entreprise'}</h5></COffcanvasHeader>
        <COffcanvasBody>
          <CFormInput label="Nom" value={nom} onChange={e=>setNom(e.target.value)} className="mb-3"/>
          <CFormInput label="Secteur" value={secteur} onChange={e=>setSecteur(e.target.value)} className="mb-3"/>
          <CFormInput label="Adresse" value={adresse} onChange={e=>setAdresse(e.target.value)} className="mb-3"/>
          <CFormInput label="Téléphone" value={telephone} onChange={e=>setTelephone(e.target.value)} className="mb-3"/>
          <CFormInput label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mb-3"/>
          <CFormInput label="Site web" value={siteWeb} onChange={e=>setSiteWeb(e.target.value)} className="mb-3"/>
          <div className="d-flex justify-content-end gap-2">
            <CButton color="secondary" variant="ghost" onClick={()=>setVisible(false)}>Annuler</CButton>
            <CButton color="primary" onClick={handleSave}>Enregistrer</CButton>
          </div>
        </COffcanvasBody>
      </COffcanvas>

      {/* OFFCANVAS CONTACTS */}
      <COffcanvas placement="end" visible={visibleContacts} onHide={() => setVisibleContacts(false)} style={{width:"40%"}}>
        <COffcanvasHeader>
          <h5>Contacts de {selectedEntreprise?.nom}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Téléphone</CTableHeaderCell>
                <CTableHeaderCell>Poste</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {contacts.filter(c => c.entreprise_id === selectedEntreprise?.id).length ? (
                contacts.filter(c => c.entreprise_id === selectedEntreprise?.id).map(c =>
                  <CTableRow key={c.id}>
                    <CTableDataCell>{c.prenom} {c.nom}</CTableDataCell>
                    <CTableDataCell>{c.email}</CTableDataCell>
                    <CTableDataCell>{c.telephone}</CTableDataCell>
                    <CTableDataCell>{c.poste}</CTableDataCell>
                  </CTableRow>
                )
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={4} className="text-center">
                    Aucun contact lié
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </COffcanvasBody>
      </COffcanvas>

      {/* TOASTER */}
      <CToaster placement="bottom-end" className="p-3">
        {toasts.map(t=>(
          <CToast key={t.id} visible autohide delay={3000} color={t.color} onClose={()=>removeToast(t.id)}>
            <CToastBody className="text-white">{t.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>
    </div>
  )
}

export default Entreprises
