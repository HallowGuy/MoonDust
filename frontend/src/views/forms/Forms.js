// src/views/forms/Forms.js  (EditionForm)
import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody, CFormSelect,CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilSettings, cilSearch, cilHistory, cilSave, cilAccountLogout } from '@coreui/icons'
import ConfirmDeleteModal from 'src/components/confirmations/ConfirmDeleteModal'
import ProtectedButton from 'src/components/protected/ProtectedButton'
import { PermissionsContext } from '/src/context/PermissionsContext'
import { fetchWithAuth } from 'src/utils/auth'
import FormioBuilder from './FormioBuilder'
import FormioRenderer from './FormioRenderer'

// 🔁 nouvelles API
import {
  API_FORMS,
  API_FORM_DETAIL,
  API_FORM_VERSIONS,
  API_FORM_VERSION,
  API_FORM_VERSION_PUBLISH,
  API_FORM_VERSION_RESTORE,
  API_FORM_DELETE,
  API_FORM_VERSION_DELETE,
  API_FORM_RENAME
} from 'src/api'

const EditionForm = () => {
  const [forms, setForms] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { actionsConfig, currentUserRoles } = useContext(PermissionsContext)

  // TOASTS
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Offcanvas: Preview
 const [showViewer, setShowViewer] = useState(false)
const [viewerForm, setViewerForm] = useState(null) // { id, name, schema }
const [viewerKey, setViewerKey] = useState(0)      // force remount


  // Offcanvas: Builder (brouillon)
const [showBuilder, setShowBuilder] = useState(false)
const [builderForm, setBuilderForm] = useState(null) // { id, name, schema } (pas besoin de version ici)


  // Offcanvas: Historique
  const [showHistory, setShowHistory] = useState(false)
  const [historyItems, setHistoryItems] = useState([]) // [{version, status, ...}]
  const [historyForm, setHistoryForm] = useState(null) // { id, name }

  // CREATE (nouveau formulaire → premier brouillon)
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')

  // === FETCH LISTE ===
const fetchForms = async () => {
  try {
    const res = await fetchWithAuth(API_FORMS)
    if (!res.ok) throw new Error('Impossible de charger les formulaires')
    const raw = await res.json()
    console.log('📥 /forms =>', raw)

    // 1) normalise les clés possibles
    let list = (Array.isArray(raw) ? raw : []).map(f => ({
      ...f,
      current_version: f.current_version ?? f.published_version ?? f.version ?? null,
      current_schema:  f.current_schema  ?? f.published_schema  ?? f.schema  ?? null,
    }))

    // 2) backfill via /forms/:id si la version publiée manque
    const missing = list.filter(f => !f.current_version || !f.current_schema)
    if (missing.length) {
      const details = await Promise.all(
        missing.map(m =>
          fetchWithAuth(API_FORM_DETAIL(m.id))
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      )
      const detailMap = Object.fromEntries(missing.map((m, i) => [m.id, details[i]]))
      list = list.map(f => {
        const d = detailMap[f.id]
        if (!d) return f
        return {
          ...f,
          current_version: f.current_version ?? d.current_version ?? d.published_version ?? null,
          current_schema:  f.current_schema  ?? d.current_schema  ?? d.published_schema  ?? null,
        }
      })
    }

    setForms(list)
  } catch (e) {
    showError(e.message || 'Erreur réseau')
    setForms([])
  }
}


  useEffect(() => { fetchForms() }, [])

// ---- Rename modal state ----
const [showRename, setShowRename] = useState(false)
const [renameTarget, setRenameTarget] = useState(null) // { id, name, ... }
const [renameName, setRenameName] = useState('')
const [renaming, setRenaming] = useState(false)

const openRename = (row) => {
  setRenameTarget(row)
  setRenameName(row?.name || row?.id || '')
  setShowRename(true)
}

const confirmRename = async () => {
  const newName = (renameName || '').trim()
  if (!newName) { showError('Nom requis'); return }
  setRenaming(true)
  try {
    await renameForm(renameTarget.id, newName)   // <-- ta fonction existante
    setShowRename(false)
  } catch (e) {
    showError(e.message || 'Erreur renommage')
  } finally {
    setRenaming(false)
  }
}



  // === RECHERCHE & PAGINATION ===
  const filtered = forms.filter(
    (r) =>
      r.id?.toLowerCase().includes(search.toLowerCase()) ||
      r.name?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // === APERÇU ===
// Aperçu de la version publiée (courante)
const openViewerCurrent = async (row) => {
  try {
    let schema = row.current_schema
    let version = row.current_version

    // si pas présent sur la ligne ⇒ va le chercher via /forms/:id
    if (!schema) {
      const res = await fetchWithAuth(API_FORM_DETAIL(row.id))
      if (res.ok) {
        const meta = await res.json()
        schema  = meta.current_schema  ?? meta.published_schema ?? null
        version = meta.current_version ?? meta.published_version ?? null
      }
    }

    // dernier recours : chercher la version publiée la + récente via /forms/:id/versions
    if (!schema) {
      const r = await fetchWithAuth(API_FORM_VERSIONS(row.id))
      if (r.ok) {
        const versions = await r.json()
        const latestPub = versions.find(v => v.status === 'publiée') || null
        if (latestPub) {
          const rv = await fetchWithAuth(API_FORM_VERSION(row.id, latestPub.version))
          if (rv.ok) {
            const v = await rv.json()
            schema  = v.schema
            version = latestPub.version
          }
        }
      }
    }

    if (!schema) return showError("Aucune version publiée à prévisualiser. Ouvre l’historique pour voir les brouillons.")

    setViewerForm({ id: row.id, name: row.name || row.id, schema, version })
    setViewerKey(k => k + 1) // force le remount du renderer
    setShowViewer(true)
  } catch (e) {
    showError(e.message || "Erreur lors de l’aperçu")
  }
}

const deleteForm = async (id) => {
  const res = await fetchWithAuth(API_FORM_DELETE(id), { method: 'DELETE' });
  if (!res.ok) throw new Error('Suppression du formulaire impossible');
  showSuccess('Formulaire supprimé');
  await fetchForms();
};

const deleteVersion = async (id, version) => {
  const res = await fetchWithAuth(API_FORM_VERSION_DELETE(id, version), { method: 'DELETE' });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Suppression de la version impossible');
  }
  showSuccess(`Version ${version} supprimée`);
  // recharger l’historique si tu es dans le panneau “Historique”
  await openHistory({ id, name: id });
};

const renameForm = async (id, newName) => {
  const res = await fetchWithAuth(API_FORM_RENAME(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName }),
  });
  if (!res.ok) throw new Error('Renommage impossible');
  showSuccess('Nom mis à jour');
  await fetchForms();
};

// Aperçu d’une version précise (draft/archived)
const openViewerVersion = async (formId, version) => {
  const res = await fetchWithAuth(API_FORM_VERSION(formId, version))
  if (!res.ok) return showError('Version introuvable')
  const v = await res.json()       // { schema, version, ... }
  setViewerForm({ id: formId, name: `${formId} v${version}`, schema: v.schema })
  setViewerKey(k => k + 1)
  setShowViewer(true)
}


  // === HISTORIQUE ===
  const openHistory = async (row) => {
    try {
      const res = await fetchWithAuth(API_FORM_VERSIONS(row.id))
      if (!res.ok) throw new Error('Impossible de charger les versions')
      setHistoryItems(await res.json())
      setHistoryForm({ id: row.id, name: row.name })
      setShowHistory(true)
    } catch (e) {
      showError(e.message)
    }
  }
  const publishVersion = async (formId, version) => {
    const res = await fetchWithAuth(API_FORM_VERSION_PUBLISH(formId, version), { method: 'PUT' })
    if (!res.ok) return showError("Publication impossible")
    showSuccess(`Version ${version} publiée`)
    await fetchForms()
    await openHistory({ id: formId, name: formId })
  }
  const restoreVersion = async (formId, version) => {
    const res = await fetchWithAuth(API_FORM_VERSION_RESTORE(formId, version), { method: 'POST' })
    if (!res.ok) return showError("Restauration impossible")
    const created = await res.json() // nouveau draft
    showSuccess(`Version ${version} restaurée en brouillon v${created.version}`)
    await openHistory({ id: formId, name: formId })
  }

  // === BUILDER ===
  // Créer un brouillon à partir de la version publiée (ou vide si nouveau)
// Ouverture du builder : on charge juste le schema publié
const openBuilder = async (row) => {
  try {
    const res = await fetchWithAuth(API_FORM_DETAIL(row.id))
const meta = await res.json()
setBuilderForm({ id: row.id, name: row.name, schema: meta.current_schema || { display:'form', components:[] } })

    setShowBuilder(true);
  } catch (e) {
    showError(e.message || 'Erreur builder');
  }
};

// Enregistrer = créer une NOUVELLE version draft
const saveBuilder = async (formId, schema) => {
  try {
    const res = await fetchWithAuth(API_FORM_VERSIONS(formId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema, notes: 'save from builder' }),
    });
    if (!res.ok) throw new Error('Sauvegarde brouillon impossible');
    const draft = await res.json(); // {version,...}
    showSuccess(`Brouillon v${draft.version} créé`);
  } catch (e) {
    showError(e.message || 'Erreur sauvegarde');
  }
};


  // === CREATION D’UN NOUVEAU FORM ===
  const handleCreate = async () => {
    if (!createName) return showError("Nom requis")
    const generatedId = createName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "")
    try {
      // Crée un premier draft vide
      const post = await fetchWithAuth(API_FORM_VERSIONS(generatedId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: { display: 'form', components: [] }, notes: 'init' }),
      })
      if (!post.ok) throw new Error("Création impossible")
      await fetchForms()
      setShowCreate(false)
      setCreateName('')
      showSuccess("Formulaire créé (brouillon)")
    } catch (e) {
      showError(e.message || "Erreur création")
    }
  }

  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Gestion des formulaires</span>
          <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.new">
            <CButton color="primary" onClick={() => setShowCreate(true)}>
              <CIcon icon={cilPlus} className="me-2" /> Nouveau formulaire
            </CButton>
          </ProtectedButton>
        </CCardHeader>

        <CCardBody>
          <CFormInput className="mb-3" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />

          <CTable striped hover responsive className="align-middle">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Version publiée</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 260, textAlign: 'center' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginated.length ? paginated.map((g) => (
                <CTableRow key={g.id}>
                  <CTableDataCell>{g.id}</CTableDataCell>
                  <CTableDataCell>{g.name || g.id}</CTableDataCell>
                  <CTableDataCell>Version {g.current_version ?? '-'}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.preview">
                      <CButton color="warning" size="sm" className="me-2" variant="ghost" onClick={() => openViewerCurrent(g)}>
                        <CIcon icon={cilSearch}  size="lg" />                       </CButton>
                    </ProtectedButton>
                    <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.edit">
                      <CButton
                        size="sm"
                        color="success"
                        className="me-2"
                        variant="ghost"
                        onClick={() => openRename(g)}
                      >
                        <CIcon icon={cilPencil} size="lg" />
                      </CButton>
                    </ProtectedButton>

                    <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.build">
                      <CButton color="info" size="sm" className="me-2" variant="ghost" onClick={() => openBuilder(g)}>
                        <CIcon icon={cilSettings} size="lg" />
                      </CButton>
                    </ProtectedButton>
                    <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.history">
                      <CButton color="secondary" size="sm" className="me-2" variant="ghost" onClick={() => openHistory(g)}>
                        <CIcon icon={cilHistory} size="lg" />
                      </CButton>
                    </ProtectedButton>
                    
                    <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.delete">
                    <ConfirmDeleteModal
                      title="Supprimer le formulaire"
                      message="Cette action supprimera le formulaire et toutes ses versions. Continuer ?"
                      trigger={
                        <CButton size="sm" className="me-2" color="danger" variant="ghost">
                          <CIcon icon={cilTrash} size="lg" />
                        </CButton>
                      }
                      onConfirm={() => deleteForm(g.id)}
                    />
                  </ProtectedButton>

                  </CTableDataCell>
                </CTableRow>
              )) : (
                <CTableRow><CTableDataCell colSpan={4} className="text-center">Aucun formulaire</CTableDataCell></CTableRow>
              )}
            </CTableBody>
          </CTable>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span>Résultats : {filtered.length}</span>
            <CFormSelect
              value={perPage}
              style={{ width: '120px' }}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
              options={[{ label:'10 / page', value:10 }, { label:'20 / page', value:20 }, { label:'50 / page', value:50 }]}
            />
          </div>
          <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
            <CButton disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>Précédent</CButton>
            <span>Page {page} / {totalPages || 1}</span>
            <CButton disabled={page === totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>Suivant</CButton>
          </div>
        </CCardBody>
      </CCard>

      {/* Offcanvas Preview */}
      <COffcanvas placement="end" visible={showViewer} onHide={() => setShowViewer(false)} style={{ width: "50%" }}>
          <COffcanvasHeader><h5 className="mb-0">Aperçu : {viewerForm?.name}</h5></COffcanvasHeader>
  <COffcanvasBody>
    {viewerForm && (
      <FormioRenderer
        key={viewerKey}                 // ✅ force le rerender pour chaque version chargée
        form={viewerForm}               // { id, name, schema }
      />
    )}
  </COffcanvasBody>
      </COffcanvas>

      {/* Offcanvas Builder */}
      <COffcanvas placement="end" visible={showBuilder} onHide={() => setShowBuilder(false)} style={{ width: '75%' }}>
          <COffcanvasHeader>
    <h5 className="mb-0">Editer : {builderForm?.id}</h5>
  </COffcanvasHeader>
  <COffcanvasBody>
    {builderForm && (
      <FormioBuilder
        form={{ schema: builderForm.schema }}
        onSave={(schema) => saveBuilder(builderForm.id, schema)}  // ✅ crée la version ici
      />
    )}
    <div className="text-end mt-3">
      <CButton color="secondary" variant="ghost" onClick={() => setShowBuilder(false)}>Fermer</CButton>
    </div>
  </COffcanvasBody>
      </COffcanvas>

      {/* Offcanvas Historique */}
      <COffcanvas placement="end" visible={showHistory} onHide={() => setShowHistory(false)} style={{ width: '20%' }}>
        <COffcanvasHeader>
          <h5 className="mb-0">Historique : {historyForm?.id}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          {historyItems.length ? historyItems.map(v => (
            <div key={v.version} className="border rounded p-2 d-flex justify-content-between align-items-center mb-2">
              <div>
                <div className="fw-bold">v{v.version} <small className="text-muted">({v.status})</small></div>
                <div className="text-muted small">{new Date(v.created_at).toLocaleString()}</div>
              </div>
              <div className="d-flex gap-2">
                 <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.version.preview">
                       <CButton size="sm" color="warning" variant="ghost" onClick={() => openViewerVersion(historyForm.id, v.version)}><CIcon icon={cilSearch}  size="lg" />  </CButton>
                    </ProtectedButton>
               
                {v.status !== 'publiée' && (
                  <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.version.publish">
                  <CButton size="sm" color="success" variant="ghost" onClick={() => publishVersion(historyForm.id, v.version)}>
                          <CIcon icon={cilSave} size="lg" />
                        </CButton>
                    </ProtectedButton>
                )}
                <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.version.restore">
                <CButton size="sm" color="info" variant="ghost" onClick={() => restoreVersion(historyForm.id, v.version)}><CIcon icon={cilAccountLogout} size="lg" />
</CButton>
                    </ProtectedButton>
                {v.status !== 'publiée' && (
                <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="form.version.delete">
                  <ConfirmDeleteModal
                    title={`Supprimer v${v.version}`}
                    message={`Supprimer la version v${v.version} ? (Publié interdit)`}
                    trigger={<CButton size="sm" className="me-2" color="danger" variant="ghost">
                          <CIcon icon={cilTrash} size="lg" />
                        </CButton>}
                    onConfirm={() => deleteVersion(historyForm.id, v.version)}
                  />
                </ProtectedButton>)}

              </div>
            </div>
          )) : <p>Aucune version.</p>}
        </COffcanvasBody>
      </COffcanvas>

      {/* Offcanvas Création */}
      <COffcanvas placement="end" visible={showCreate} onHide={() => setShowCreate(false)} style={{ width: "20%" }}>
        <COffcanvasHeader><h5 className="mb-0">Nouveau formulaire</h5></COffcanvasHeader>
        <COffcanvasBody>
          <div className="d-flex flex-column gap-3">
            <CFormInput label="Nom (ID)" value={createName} onChange={(e) => setCreateName(e.target.value)} />
            <div className="text-end">
              <CButton color="secondary" variant="ghost" className="me-2" onClick={() => setShowCreate(false)}>Annuler</CButton>
              <CButton color="primary" onClick={handleCreate}>Créer</CButton>
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
      <CModal visible={showRename} onClose={() => setShowRename(false)}>
  <CModalHeader>
    <CModalTitle>Renommer le formulaire</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <div className="mb-2">
      <small className="text-muted">ID (non modifiable)</small>
      <div className="fw-bold">{renameTarget?.id}</div>
    </div>
    <CFormInput
      label="Nouveau nom"
      value={renameName}
      onChange={(e) => setRenameName(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') confirmRename() }}
      autoFocus
    />
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" variant="ghost" onClick={() => setShowRename(false)} disabled={renaming}>
      Annuler
    </CButton>
    <CButton
      color="primary"
      onClick={confirmRename}
      disabled={renaming || !renameName.trim()}
    >
      {renaming ? (<><CSpinner size="sm" className="me-2" />Enregistrement…</>) : 'Enregistrer'}
    </CButton>
  </CModalFooter>
</CModal>

    </div>
    
  )
}

export default EditionForm
