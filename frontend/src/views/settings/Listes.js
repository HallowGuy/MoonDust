// Listes.jsx
import React, { useEffect, useState, useContext } from "react"
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput, CToaster, CToast, CToastBody,CFormSelect
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilPencil, cilTrash, cilPlus } from "@coreui/icons"
import ConfirmDeleteModal from "../../components/confirmations/ConfirmDeleteModal"
import { API_LISTES, API_LISTES_BY_TYPE, API_LISTES_CHILDREN } from "src/api"
import { PermissionsContext } from '/src/context/PermissionsContext'
import { fetchWithAuth } from "../../utils/auth";
import ProtectedButton from "../../components/protected/ProtectedButton"

const Listes = () => {
  const [listes, setListes] = useState([])
const [types, setTypes] = useState([])
const [search, setSearch] = useState("")
    const { actionsConfig, currentUserRoles } = useContext(PermissionsContext)
  
  const [visible, setVisible] = useState(false)
  const [editType, setEditType] = useState(null)
  const [newTypeName, setNewTypeName] = useState("")
  const [values, setValues] = useState([])
const [newValue, setNewValue] = useState("")
const [liste, setListe] = useState([])
  // Enfants
  const [manageChildren, setManageChildren] = useState(null)
  const [children, setChildren] = useState([])
const [newChild, setNewChild] = useState("")

  // Toasts
  const [toasts, setToasts] = useState([])
  const addToast = (msg, color = "danger") => setToasts((p) => [...p, { id: Date.now(), msg, color }])
  const showSuccess = (m) => addToast(m, "success")
  const showError = (m) => addToast(m, "danger")
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id))
  
  const [page, setPage] = useState(1)
const [perPage, setPerPage] = useState(10)



const filtered = types.filter((t) =>
  t?.toLowerCase().includes(search.toLowerCase())
)
const totalPages = Math.ceil(filtered.length / perPage)
const paginated = filtered.slice((page - 1) * perPage, page * perPage)


  // API
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  })
 const addValue = async () => {
  if (!newValue.trim()) return

  if (editType) {
    // --- Mode édition : direct DB ---
    await fetchWithAuth(API_LISTES, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ type: editType, valeur: newValue }),
    })
    showSuccess("Valeur ajoutée")
    openOffcanvas(editType) // recharge les valeurs
        fetchAll()              // refresh global du tableau principal

  } else {
    // --- Mode création : seulement en local ---
    setValues([...values, { id: Date.now(), valeur: newValue }])
  }

  setNewValue("")
}


  const fetchAll = async () => {
    try {
      const res = await fetchWithAuth(API_LISTES, { headers: getAuthHeaders() })
      const data = await res.json()
      setListes(data)
      setTypes([...new Set(data.map((l) => l.type).filter(Boolean))])
    } catch (e) {
      showError(e.message)
    }
  }

  useEffect(() => { fetchAll() }, [])

   const fetchListe = async () => {
      try {
        const res = await fetchWithAuth(API_LISTES)
        if (!res.ok) throw new Error('Impossible de charger les rôles')
        const data = await res.json()
        setListe(data)
      } catch (e) {
        showError(e.message || 'Erreur réseau lors du chargement')
      }
    }
  
    useEffect(() => { fetchListe() }, [])
  
    const openCreate = () => {
      setCreateName('')
      setCreateDescription('')
      setShowCreate(true)
    }

  // --- LISTE ---
  const openOffcanvas = async (type) => {
    setEditType(type)
  setNewTypeName(type || "")
    setVisible(true)
    const res = await fetchWithAuth(API_LISTES_BY_TYPE(type), { headers: getAuthHeaders() })
    const data = await res.json()
    setValues(data.filter(v => !v.parent_id))
  }
  const addChild = async () => {
  if (!newChild.trim()) return
  try {
    await fetchWithAuth(API_LISTES, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        type: manageChildren.type,
        valeur: newChild,
        parent_id: manageChildren.id,
      }),
    })
    showSuccess("Enfant ajouté")
    setNewChild("")
    openChildren(manageChildren) // recharge la liste
    fetchAll() // refresh global

  } catch (e) {
    showError(e.message)
  }
}

  const handleSave = async () => {
  try {
    if (editType) {
      // --- RENOMMER une liste existante ---
      await fetchWithAuth(`${API_LISTES}/rename`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ oldType: editType, newType: newTypeName }),
      })
      showSuccess("Liste renommée")
    } else {
      // --- CRÉER une nouvelle liste ---
      if (!newTypeName.trim()) {
        showError("Nom de liste requis")
        return
      }
      if (!values.length) {
        showError("Ajoutez au moins une valeur")
        return
      }

      // enregistrer chaque valeur
      for (let v of values) {
        await fetchWithAuth(API_LISTES, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ type: newTypeName, valeur: v.valeur }),
        })
      }
      showSuccess("Liste créée avec ses valeurs")
    }

    setVisible(false)
    fetchAll()
  } catch (e) {
    showError(e.message)
  }
}




  const deleteType = async (type) => {
    await fetchWithAuth(`${API_LISTES}/delete-type/${encodeURIComponent(type)}`, {
      method: "DELETE", headers: getAuthHeaders(),
    })
    showSuccess("Liste supprimée")
    fetchAll()
  }

  // --- VALEURS ---
  const renameValue = async (val) => {
    const newName = prompt("Nouveau nom :", val.valeur)
    if (!newName) return
    await fetchWithAuth(`${API_LISTES}/${val.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ valeur: newName, ordre: val.ordre, actif: true }),
    })
    showSuccess("Valeur renommée")
    openOffcanvas(editType)
  }

  const deleteValue = async (id) => {
    await fetchWithAuth(`${API_LISTES}/${id}`, { method: "DELETE", headers: getAuthHeaders() })
    showSuccess("Valeur supprimée")
    openOffcanvas(editType)
        fetchAll()              // refresh global du tableau principal

  }

  // --- ENFANTS ---
  const openChildren = async (val) => {
    setManageChildren(val)
    const res = await fetchWithAuth(API_LISTES_CHILDREN(val.type, val.id), { headers: getAuthHeaders() })
    setChildren(await res.json())
  }

  const renameChild = async (c) => {
    const newName = prompt("Nouveau nom enfant :", c.valeur)
    if (!newName) return
    await fetchWithAuth(`${API_LISTES}/${c.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ valeur: newName, ordre: c.ordre, actif: true }),
    })
    showSuccess("Enfant renommé")
    openChildren(manageChildren)
  }

  const deleteChild = async (id) => {
    await fetchWithAuth(`${API_LISTES}/${id}`, { method: "DELETE", headers: getAuthHeaders() })
    showSuccess("Enfant supprimé")
    openChildren(manageChildren)
    fetchAll() // refresh global

  }

  return (
    <div className="container py-4">
      <CCard>
<CCardHeader className="d-flex justify-content-between align-items-center">
  <span>Édition des listes</span>
  
  <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="list.new">
            <CButton color="primary" onClick={() => openOffcanvas()}>
              <CIcon icon={cilPlus} className="me-2" /> Créer une liste
            </CButton>
          </ProtectedButton>
</CCardHeader>        <CCardBody>
  <CFormInput
              className="mb-3"
              type="text"
              placeholder="Rechercher par nom ou chemin…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          <CTable striped hover>
  <CTableHead>
    <CTableRow>
      <CTableHeaderCell>Nom de la liste</CTableHeaderCell>
      <CTableHeaderCell>Valeurs</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '160px', textAlign: 'center' }}>
      Actions</CTableHeaderCell>
    </CTableRow>
  </CTableHead>
  <CTableBody>
  {paginated.length ? (
    paginated.map((t) => {
      const valeurs = listes.filter((l) => l.type === t && !l.parent_id)

      return (
        <CTableRow key={t}>
          <CTableDataCell>{t}</CTableDataCell>
          <CTableDataCell>
            {valeurs.length ? (
              <ul className="mb-0">
                {valeurs.map((v) => (
                  <li key={v.id}>
                    {v.valeur}
                    {/* enfants */}
                    {listes.some((c) => c.parent_id === v.id) && (
                      <ul>
                        {listes
                          .filter((c) => c.parent_id === v.id)
                          .map((c) => <li key={c.id}>{c.valeur}</li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <i>Aucune valeur</i>
            )}
          </CTableDataCell>
          <CTableDataCell className="text-center align-middle">
            <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="list.edit">
              <CButton className="me-2" color="success" variant="ghost" onClick={() => openOffcanvas(t)}>
                <CIcon icon={cilPencil} size="lg" />
              </CButton>
            </ProtectedButton>
            <ConfirmDeleteModal
              title="Supprimer la liste"
              message="Supprimer cette liste ?"
              trigger={
                <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="list.delete">
                  <CButton className="me-2" color="danger" variant="ghost">
                    <CIcon icon={cilTrash} size="lg" />
                  </CButton>
                </ProtectedButton>
              }
              onConfirm={() => deleteType(t)}
            />
          </CTableDataCell>
        </CTableRow>
      )
    })
  ) : (
    <CTableRow>
      <CTableDataCell colSpan={4} className="text-center">
        Aucune liste
      </CTableDataCell>
    </CTableRow>
  )}
</CTableBody>

</CTable>
<div className="d-flex justify-content-between align-items-center mt-3">
  <span>Résultats : {filtered.length}</span>
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

      {/* OFFCANVAS LISTE */}
      <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)} style={{ width: "20%" }}>
        <COffcanvasHeader><h5>{editType ? `Éditer la liste "${editType}"` : "Créer une nouvelle liste"}</h5></COffcanvasHeader>
        <COffcanvasBody>
          <CFormInput label="Nom de la liste" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} />
          <div className="d-flex gap-2 justify-content-end mt-3">
            <CButton color="secondary" variant="ghost" onClick={() => setVisible(false)}>Annuler</CButton>
            <CButton color="primary" onClick={handleSave}>{editType ? "Renommer" : "Créer"}</CButton>
          </div>

          <h6 className="mt-4">Valeurs</h6>
          <div className="d-flex mb-3">
  <CFormInput
    placeholder="Nouvelle valeur"
    value={newValue}
    onChange={(e) => setNewValue(e.target.value)}
  />
  <CButton color="primary" className="ms-2" onClick={addValue}>
    <CIcon icon={cilPlus} />
  </CButton>
</div>
          <CTable striped small>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Valeur</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: "center" }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {values.map((v) => (
                <CTableRow key={v.id}>
                  <CTableDataCell onDoubleClick={() => renameValue(v)} style={{ cursor: "pointer" }}>
                    {v.valeur}
                  </CTableDataCell>
                  <CTableDataCell style={{ textAlign: "center" }}>
                    <CButton size="sm" color="info" variant="ghost" onClick={() => openChildren(v)}>
                      <CIcon icon={cilPlus} /> Enfants
                    </CButton>
                    <CButton size="sm" color="danger" variant="ghost" onClick={() => deleteValue(v.id)}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </COffcanvasBody>
      </COffcanvas>

      {/* OFFCANVAS ENFANTS */}
      <COffcanvas placement="end" visible={!!manageChildren} onHide={() => setManageChildren(null)} style={{ width: "20%" }}>
        <COffcanvasHeader><h5>Enfants de "{manageChildren?.valeur}"</h5></COffcanvasHeader>
        <div className="d-flex mb-3">
    <CFormInput
      placeholder="Nouvel enfant"
      value={newChild}
      onChange={(e) => setNewChild(e.target.value)}
    />
    <CButton color="primary" className="ms-2" onClick={addChild}>
      <CIcon icon={cilPlus} />
    </CButton>
  </div>
        <COffcanvasBody>
          <CTable striped small>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Valeur enfant</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: "center" }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {children.map((c) => (
                <CTableRow key={c.id}>
                  <CTableDataCell onDoubleClick={() => renameChild(c)} style={{ cursor: "pointer" }}>
                    {c.valeur}
                  </CTableDataCell>
                  <CTableDataCell style={{ textAlign: "center" }}>
                    <CButton size="sm" color="danger" variant="ghost" onClick={() => deleteChild(c.id)}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </COffcanvasBody>
      </COffcanvas>

      {/* TOASTER */}
      <CToaster placement="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((t) => (
          <CToast key={t.id} visible autohide delay={3000} color={t.color} onClose={() => removeToast(t.id)}>
            <CToastBody className="text-white">{t.msg}</CToastBody>
          </CToast>
        ))}
      </CToaster>
    </div>
  )
}

export default Listes
