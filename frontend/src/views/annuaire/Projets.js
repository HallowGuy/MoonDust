import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput, CFormSelect,
  CToaster, CToast, CToastBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { API_PROJETS, API_ENTREPRISES } from 'src/api'
import ConfirmDeleteModal from "../../components/confirmations/ConfirmDeleteModal"
import ProtectedButton from "../../components/protected/ProtectedButton"
import { PermissionsContext } from '/src/context/PermissionsContext'

const Projets = () => {
  const [projets, setProjets] = useState([])
  const [entreprises, setEntreprises] = useState([])
  const [visible, setVisible] = useState(false)

  // form state
  const [editProjet, setEditProjet] = useState(null)
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [statut, setStatut] = useState('')
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

  // ---------- FETCH ----------
  const fetchProjets = async () => {
    try {
      const res = await fetch(API_PROJETS, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Impossible de charger les projets')
      setProjets(await res.json())
    } catch (e) { showError(e.message) }
  }

  const fetchEntreprises = async () => {
    try {
      const res = await fetch(API_ENTREPRISES, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Impossible de charger les entreprises')
      setEntreprises(await res.json())
    } catch (e) { showError(e.message) }
  }

  useEffect(() => { fetchProjets(); fetchEntreprises() }, [])

  // ---------- OPEN SIDEBAR ----------
  const openOffcanvas = (p = null) => {
    if (p) {
      setEditProjet(p)
      setNom(p.nom || ''); setDescription(p.description || ''); setStatut(p.statut || ''); setEntrepriseId(p.entreprise_id || null)
    } else {
      setEditProjet(null); setNom(''); setDescription(''); setStatut(''); setEntrepriseId(null)
    }
    setVisible(true)
  }

  const handleSave = async () => {
    const payload = { nom, description, statut, entreprise_id: entrepriseId }
    try {
      if (editProjet) {
        const res = await fetch(`${API_PROJETS}/${editProjet.id}`, { method: 'PUT', headers:getAuthHeaders(), body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Mise à jour impossible')
        showSuccess('Projet mis à jour')
      } else {
        const res = await fetch(API_PROJETS, { method: 'POST', headers:getAuthHeaders(), body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Création impossible')
        showSuccess('Projet créé')
      }
      await fetchProjets()
      setVisible(false)
    } catch (e) { showError(e.message) }
  }

  // ---------- SEARCH ----------
  const [search, setSearch] = useState('')
  const filtered = projets.filter(p =>
    [p.nom, p.description, p.statut].some(val => val?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container py-4">
      <CCard>
        <CCardHeader className="d-flex justify-content-between">
          <span>Projets</span>
          <ProtectedButton action="projet.new" actionsConfig={actionsConfig} currentUserRoles={currentUserRoles}>
            <CButton color="primary" onClick={() => openOffcanvas()}>
              <CIcon icon={cilPlus} className="me-2"/> Nouveau projet
            </CButton>
          </ProtectedButton>
        </CCardHeader>
        <CCardBody>
          <CFormInput placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} className="mb-3"/>

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Statut</CTableHeaderCell>
                <CTableHeaderCell>Entreprise</CTableHeaderCell>
                <CTableHeaderCell style={{textAlign:'center'}}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.length ? filtered.map(p =>
                <CTableRow key={p.id}>
                  <CTableDataCell>{p.nom}</CTableDataCell>
                  <CTableDataCell>{p.description}</CTableDataCell>
                  <CTableDataCell>{p.statut}</CTableDataCell>
                  <CTableDataCell>{entreprises.find(e=>e.id===p.entreprise_id)?.nom || '—'}</CTableDataCell>
                  <CTableDataCell style={{textAlign:'center'}}>
                    <ProtectedButton action="projet.edit" actionsConfig={actionsConfig} currentUserRoles={currentUserRoles}>
                      <CButton size="sm" color="success" variant="ghost" onClick={() => openOffcanvas(p)}>
                        <CIcon icon={cilPencil}/>
                      </CButton>
                    </ProtectedButton>
                    <ProtectedButton action="projet.delete" actionsConfig={actionsConfig} currentUserRoles={currentUserRoles}>
                      <ConfirmDeleteModal
                        title="Supprimer le projet"
                        message="Êtes-vous sûr de vouloir supprimer ce projet ?"
                        trigger={<CButton size="sm" color="danger" variant="ghost"><CIcon icon={cilTrash}/></CButton>}
                        onConfirm={async () => {
                          const res = await fetch(`${API_PROJETS}/${p.id}`, { method:"DELETE", headers:getAuthHeaders() })
                          if(!res.ok) throw new Error("Suppression impossible")
                          setProjets(prev => prev.filter(prj => prj.id !== p.id))
                          showSuccess("Projet supprimé")
                        }}
                      />
                    </ProtectedButton>
                  </CTableDataCell>
                </CTableRow>
              ) : <CTableRow><CTableDataCell colSpan={5} className="text-center">Aucun projet</CTableDataCell></CTableRow>}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* OFFCANVAS */}
      <COffcanvas placement="end" visible={visible} onHide={()=>setVisible(false)} style={{width:"33%"}}>
        <COffcanvasHeader><h5>{editProjet ? 'Éditer projet' : 'Nouveau projet'}</h5></COffcanvasHeader>
        <COffcanvasBody>
          <CFormInput label="Nom" value={nom} onChange={e=>setNom(e.target.value)} className="mb-3"/>
          <CFormInput label="Description" value={description} onChange={e=>setDescription(e.target.value)} className="mb-3"/>
          <CFormSelect label="Statut" value={statut} onChange={e=>setStatut(e.target.value)} className="mb-3">
            <option value="">-- Sélectionner --</option>
            <option value="en cours">En cours</option>
            <option value="terminé">Terminé</option>
            <option value="annulé">Annulé</option>
          </CFormSelect>
          <CFormSelect label="Entreprise" value={entrepriseId||''} onChange={e=>setEntrepriseId(e.target.value)} className="mb-3">
            <option value="">-- Sélectionner --</option>
            {entreprises.map(e=><option key={e.id} value={e.id}>{e.nom}</option>)}
          </CFormSelect>
          <div className="d-flex justify-content-end gap-2">
            <CButton color="secondary" variant="ghost" onClick={()=>setVisible(false)}>Annuler</CButton>
            <CButton color="primary" onClick={handleSave}>Enregistrer</CButton>
          </div>
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

export default Projets
