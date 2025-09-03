import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"

import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilSettings, cilSearch } from '@coreui/icons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import { API_FORM_CONFIG } from 'src/api'
import FormioBuilder from './FormioBuilder'
import FormioRenderer from "./FormioRenderer"

const EditionForm = () => {
  const [forms, setForms] = useState([])
  const [search, setSearch] = useState('')
      const navigate = useNavigate()

  // TOASTS
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // CREATE
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createId, setCreateId] = useState('')
  // EditionForm.js
const [showViewer, setShowViewer] = useState(false)
const [viewerForm, setViewerForm] = useState(null)

  // EDIT
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [editName, setEditName] = useState('')
  const [editId, setEditId] = useState('')

  // BUILD (Formio)
  const [showBuilder, setShowBuilder] = useState(false)
  const [builderForm, setBuilderForm] = useState(null)

  // FETCH FORMS
  const fetchForms = async () => {
    try {
      const res = await fetch(API_FORM_CONFIG)
      if (!res.ok) throw new Error('Impossible de charger les formulaires')
      const data = await res.json()
      setForms(Array.isArray(data) ? data : [])
    } catch (e) {
      showError(e.message || 'Erreur réseau')
      setForms([])
    }
  }

  useEffect(() => { fetchForms() }, [])

  // CREATE
  const handleCreate = async () => {
  if (!createName) return showError("Nom requis")

  const generatedId = createName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")

  if (forms.some(f => f.id === generatedId)) {
    return showError("⚠️ Un formulaire avec ce nom existe déjà.")
  }

  try {
    const res = await fetch(API_FORM_CONFIG, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: generatedId,
        name: createName,
        schema: { display: "form", components: [] },
      }),
    })
    if (!res.ok) throw new Error("Création impossible")

    await fetchForms()
    setShowCreate(false)
    resetCreateForm() // ✅ vide les champs
    showSuccess("Formulaire créé avec succès")
  } catch (e) {
    showError(e.message || "Erreur création")
  }
}

  // EDIT
  const openEdit = (f) => {
    setEditForm(f)
    setEditId(f.id || "")
    setEditName(f.name || "")
    setShowEdit(true)
  }

const resetCreateForm = () => {
  setCreateName("")
  setCreateId("")
}


  const handleSaveEdit = async () => {
    if (!editForm) return
    if (!editId || !editName) return showError("Nom requis")

    try {
      const res = await fetch(`${API_FORM_CONFIG}/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      })

      if (!res.ok) throw new Error("Mise à jour impossible")

      await fetchForms()
      setShowEdit(false)
      setEditForm(null)
      showSuccess("Formulaire mis à jour")
    } catch (e) {
      showError(e.message || "Erreur lors de la mise à jour")
    }
  }

  const openBuilder = (f) => {
    navigate(`/forms/${f.id}/builder`)
  }

  const filtered = forms.filter(
    (f) =>
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.id?.toLowerCase().includes(search.toLowerCase())
  )
const openViewer = (f) => {
  setViewerForm(f)
  setShowViewer(true)
}

  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Liste des formulaires</span>
          <CButton color="primary" onClick={() => setShowCreate(true)}>
            <CIcon icon={cilPlus} className="me-2" />
            Nouveau formulaire
          </CButton>
        </CCardHeader>

        <CCardBody>
          <CFormInput
            className="mb-3"
            type="text"
            placeholder="Rechercher par nom ou ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '180px', textAlign: 'center' }}>
                  Actions
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.length ? (
                filtered.map((f) => (
                  <CTableRow key={f.id}>
                    <CTableDataCell>{f.id}</CTableDataCell>
                    <CTableDataCell>{f.name}</CTableDataCell>
                    <CTableDataCell className="text-center">
                        <CButton size="sm" color="secondary" variant="ghost" onClick={() => openViewer(f)}>
                        <CIcon icon={cilSearch} size="lg" />
                        </CButton>

                      {/* Construire */}
                      <CButton size="sm" color="info" variant="ghost" onClick={() => openBuilder(f)}>
                        <CIcon icon={cilSettings} size="lg" />
                     </CButton>

                      {/* Éditer */}
                      <CButton size="sm" color="success" variant="ghost" onClick={() => openEdit(f)}>
                        <CIcon icon={cilPencil} size="lg" />
                      </CButton>
                      {/* Supprimer */}
                      <ConfirmDeleteModal
                        title="Supprimer le formulaire"
                        message="Êtes-vous sûr de vouloir supprimer ce formulaire ?"
                        trigger={
                          <CButton size="sm" color="danger" variant="ghost">
                            <CIcon icon={cilTrash} size="lg" />
                          </CButton>
                        }
                        onConfirm={async () => {
                          try {
                            const res = await fetch(`${API_FORM_CONFIG}/${f.id}`, {
                              method: 'DELETE',
                            })
                            if (!res.ok) throw new Error('Suppression impossible')
                            setForms((prev) => prev.filter((ff) => ff.id !== f.id))
                            showSuccess('Formulaire supprimé')
                          } catch (e) {
                            showError(e.message || 'Erreur suppression')
                          }
                        }}
                      />
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={3} className="text-center">
                    Aucun formulaire
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Sidebar Builder */}
      <COffcanvas placement="end" visible={showBuilder} onHide={() => setShowBuilder(false)} style={{ width: '75%' }}>
        <COffcanvasHeader>
          <h5 className="mb-0">Construire : {builderForm?.name}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          {builderForm && <FormioBuilder form={builderForm} />}
        </COffcanvasBody>
      </COffcanvas>
      <COffcanvas
  placement="end"
  visible={showViewer}
  onHide={() => setShowViewer(false)}
  style={{ width: "50%" }}
>
  <COffcanvasHeader>
    <h5 className="mb-0">Aperçu : {viewerForm?.name}</h5>
  </COffcanvasHeader>
  <COffcanvasBody>
    {viewerForm && <FormioRenderer form={viewerForm} />}
  </COffcanvasBody>
</COffcanvas>


      {/* Sidebar Édition */}
      <COffcanvas placement="end" visible={showEdit} onHide={() => setShowEdit(false)} style={{ width: "33%" }}>
        <COffcanvasHeader>
          <h5 className="mb-0">✏️ Éditer : {editForm?.name}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          <div className="d-flex flex-column gap-3">
            <CFormInput label="ID" value={editId} disabled /> {/* champ ID figé */}
            <CFormInput label="Nom" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <div className="d-flex gap-2 justify-content-end">
              <CButton color="secondary" variant="ghost" onClick={() => setShowEdit(false)}>
                Annuler
              </CButton>
              <CButton color="primary" onClick={handleSaveEdit}>Enregistrer</CButton>
            </div>
          </div>
        </COffcanvasBody>
      </COffcanvas>
    {/* Sidebar Création */}
<COffcanvas
  placement="end"
  visible={showCreate}
  onHide={() => setShowCreate(false)}
  style={{ width: "20%" }}
>
  <COffcanvasHeader>
    <h5 className="mb-0">Nouveau formulaire</h5>
  </COffcanvasHeader>
  <COffcanvasBody>
    <div className="d-flex flex-column gap-3">
      <CFormInput
        label="Nom"
        value={createName}
        onChange={(e) => setCreateName(e.target.value)}
      />

      <div className="d-flex gap-2 justify-content-end">
        <CButton
          color="secondary"
          variant="ghost"
          onClick={() => setShowCreate(false)}
        >
          Annuler
        </CButton>
        <CButton color="primary" onClick={handleCreate}>
          Créer
        </CButton>
      </div>
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

export default EditionForm
