import React, { useEffect, useState, useMemo } from "react"
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CButton,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CForm, CFormInput, CToaster, CToast, CToastBody, CFormSelect
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilTrash, cilSearch, cilPlus, cilCloudUpload, cilSave } from "@coreui/icons"

import { Document as PdfDocument, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"

import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url"
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

import { API_BASE } from 'src/api'
const API = API_BASE

const Documents = () => {
  const [docs, setDocs] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [file, setFile] = useState(null)
  const [newDoc, setNewDoc] = useState({ name: "", owner_user_id: "" })

  const [pdfData, setPdfData] = useState(null)
  const [numPages, setNumPages] = useState(null)

  const [editDoc, setEditDoc] = useState(null)

  // ✅ Toaster
const [toasts, setToasts] = useState([])

const showToast = (message, color = "success") => {
  setToasts((prev) => [...prev, { id: Date.now(), message, color }])
}

const [users, setUsers] = useState([])

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`)
      if (!res.ok) throw new Error("Erreur chargement utilisateurs")
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error(err)
      showToast("Impossible de charger les utilisateurs", "danger")
    }
  }
  fetchUsers()
}, [])


  // ---- Charger la liste ----
  const fetchDocs = async () => {
    try {
      const res = await fetch(`${API}/documents`)
      if (!res.ok) throw new Error("Impossible de charger les documents")
      setDocs(await res.json())
    } catch (e) {
      console.error(e)
      showToast("Erreur lors du chargement", "danger")
    }
  }

  useEffect(() => { fetchDocs() }, [])

  // ---- Charger un document ----
  const openDoc = async (doc) => {
    try {
      const res = await fetch(`${API}/documents/${doc.id}`)
      if (!res.ok) throw new Error("Impossible de charger le document")
      const data = await res.json()
      setSelectedDoc(data)
      setEditDoc(data.document)
    } catch (e) {
      console.error(e)
      showToast("Erreur lors de l’ouverture", "danger")
    }
  }

  // ---- Charger PDF ----
  useEffect(() => {
    const loadPdf = async () => {
      setPdfData(null)
      setNumPages(null)

      if (!selectedDoc?.document?.mime_type?.includes("pdf")) return
      if (!selectedDoc?.versions?.length) return

      const file = selectedDoc.versions[0]
      const url = `${API.replace("/api", "")}/uploads/${file.storage_uri}`

      try {
        const res = await fetch(url)
        const buf = await res.arrayBuffer()
        setPdfData(buf)
      } catch (err) {
        console.error("Erreur chargement PDF:", err)
        showToast("Impossible de charger le PDF", "danger")
      }
    }
    loadPdf()
  }, [selectedDoc])

  // ---- Ajouter document ----
  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc),
      })
      if (!res.ok) throw new Error("Erreur création document")
      const doc = await res.json()

      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        await fetch(`${API}/documents/${doc.id}/upload`, { method: "POST", body: formData })
      }

      setNewDoc({ name: "", owner_user_id: "" })
      setFile(null)
      setShowAdd(false)
      fetchDocs()
      showToast("Document ajouté avec succès", "success")
    } catch (e) {
      console.error(e)
      showToast("Erreur lors de l’ajout", "danger")
    }
  }

  // ---- Supprimer ----
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce document ?")) return
    try {
      const res = await fetch(`${API}/documents/${id}`, { method: "DELETE" })
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== id))
        setSelectedDoc(null)
        showToast("Document supprimé", "success")
      } else {
        showToast("Erreur suppression", "danger")
      }
    } catch (e) {
      console.error(e)
      showToast("Erreur serveur", "danger")
    }
  }

  // ---- Update métadonnées ----
  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API}/documents/${editDoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDoc),
      })
      if (!res.ok) throw new Error("Erreur mise à jour")
      await fetchDocs()
      showToast("Document mis à jour", "success")
    } catch (err) {
      console.error(err)
      showToast("Erreur serveur", "danger")
    }
  }

  const memoizedFile = useMemo(() => (pdfData ? { data: pdfData } : null), [pdfData])

  // ---- Viewer ----
  const renderViewer = (doc) => {
    if (!doc?.versions?.length) return <p className="text-center mt-3">Aucune version disponible</p>

    const file = doc.versions[0]
    const url = `${API.replace("/api", "")}/uploads/${file.storage_uri}`
    const mime = doc.document.mime_type || ""

    if (mime.startsWith("image/")) {
      return <img src={url} alt={doc.document.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    }

    if (mime === "application/pdf") {
      return (
        <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
          {memoizedFile ? (
            <PdfDocument file={memoizedFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              {Array.from(new Array(numPages), (_, i) => (
                <Page key={i + 1} pageNumber={i + 1} width={800} />
              ))}
            </PdfDocument>
          ) : (
            <p>Chargement du PDF...</p>
          )}
        </div>
      )
    }

    if (mime.includes("word") || mime.includes("excel") || mime.includes("powerpoint")) {
      return <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`} style={{ width: "100%", height: "100%", border: "none" }} title="Office Viewer" />
    }

    return <iframe src={url} style={{ width: "100%", height: "100%", border: "none" }} title="Generic Viewer" />
  }

  return (
    <>
      {/* ✅ TOASTER */}
<CToaster placement="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
  {toasts.map((t) => (
    <CToast
      key={t.id}
      visible
      autohide
      delay={3000}
      color={t.color}
      onClose={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
    >
      <CToastBody className="text-white">{t.message}</CToastBody>
    </CToast>
  ))}
</CToaster>



      {/* Table documents */}
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Documents</span>
          <CButton color="primary" onClick={() => setShowAdd(true)}>
            <CIcon icon={cilPlus} /> Ajouter document
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Propriétaire</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell  style={{ width: '100px', textAlign: 'center' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {docs.map((d) => (
                <CTableRow key={d.id}>
                  <CTableDataCell>{d.id}</CTableDataCell>
                  <CTableDataCell>{d.name}</CTableDataCell>
                  <CTableDataCell>  {users.find((u) => u.id === d.owner_user_id)?.display_name || d.owner_user_id}</CTableDataCell>
                  <CTableDataCell>{d.status}</CTableDataCell>
                  <CTableDataCell className="d-flex gap-2" style={{ width: '100px', textAlign: 'center' }}>
                    <CButton size="sm" color="secondary" variant="ghost" onClick={() => openDoc(d)}><CIcon icon={cilSearch} /></CButton>
                    <CButton size="sm" color="danger" variant="ghost" onClick={() => handleDelete(d.id)}><CIcon icon={cilTrash} /></CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Offcanvas Ajout */}
      <COffcanvas placement="end" visible={showAdd} onHide={() => setShowAdd(false)} style={{ width: "400px" }}>
        <COffcanvasHeader><h5>Ajouter un document</h5></COffcanvasHeader>
        <COffcanvasBody>
          <CForm onSubmit={handleAdd} className="d-flex flex-column gap-3">
            <CFormInput type="text" label="Nom du document" value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })} required />
<CFormSelect
  label="Propriétaire"
  value={newDoc.owner_user_id}
  onChange={(e) => setNewDoc({ ...newDoc, owner_user_id: e.target.value })}
  required
>
  <option value="">-- Sélectionner --</option>
  {users.map((u) => (
    <option key={u.id} value={u.id}>
      {u.display_name}
    </option>
  ))}
</CFormSelect>
            <CFormInput type="file" label="Fichier" onChange={(e) => setFile(e.target.files[0])} />
            <CButton type="submit" color="primary"><CIcon icon={cilCloudUpload} /> Enregistrer</CButton>
          </CForm>
        </COffcanvasBody>
      </COffcanvas>

      {/* Offcanvas Visualisation */}
      <COffcanvas placement="end" visible={!!selectedDoc} onHide={() => setSelectedDoc(null)} style={{ width: "80%" }}>
        <COffcanvasHeader><h5 className="mb-0">Document - {selectedDoc?.document?.name}</h5></COffcanvasHeader>
        <COffcanvasBody>
          <div className="d-flex gap-4" style={{ height: "90vh" }}>
            {/* Viewer */}
            <div style={{ flex: 2, border: "1px solid #ddd", borderRadius: "8px", overflow: "auto" }}>
              {renderViewer(selectedDoc)}
            </div>
            {/* Métadonnées */}
            <div style={{ flex: 1 }}>
              <h6>Métadonnées</h6>
              {editDoc && (
                <CForm className="row g-3">
  <div className="col-md-6">
    <CFormInput label="ID" value={editDoc.id} disabled />
  </div>
  <div className="col-md-6">
            <CFormInput label="Format" value={editDoc.mime_type || "Inconnu"} disabled />

  </div>
 <div className="col-md-12">
    <CFormInput label="Nom" value={editDoc.name} onChange={(e) => setEditDoc({ ...editDoc, name: e.target.value })} />
  </div>
  <div className="col-md-6">
<CFormSelect
  label="Propriétaire"
  value={editDoc.owner_user_id}
  onChange={(e) => setEditDoc({ ...editDoc, owner_user_id: e.target.value })}
>
  <option value="">-- Sélectionner --</option>
  {users.map((u) => (
    <option key={u.id} value={u.id}>
      {u.display_name}
    </option>
  ))}
</CFormSelect>
  </div>
  <div className="col-md-6">
    <CFormInput label="Status" value={editDoc.status} onChange={(e) => setEditDoc({ ...editDoc, status: e.target.value })} />
  </div>

  <div className="col-md-6">
    <CFormInput label="Créé le" value={new Date(editDoc.created_at).toLocaleString()} disabled />
  </div>
  <div className="col-md-6">
    <CFormInput label="Mis à jour le" value={new Date(editDoc.updated_at).toLocaleString()} disabled />
  </div>


  <div className="col-12">
    <CButton color="primary" onClick={handleUpdate}>
      <CIcon icon={cilSave} /> Enregistrer
    </CButton>
  </div>
</CForm>

              )}

              <h6 className="mt-4">Versions</h6>
              <ul>
                {selectedDoc?.versions?.map((v) => (
                  <li key={v.id}>
                    v{v.version_no} - {v.storage_uri} ({new Date(v.created_at).toLocaleString()})
                    {" "}
                    <a href={`${API.replace("/api", "")}/uploads/${v.storage_uri}`} target="_blank" rel="noreferrer">Télécharger</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </COffcanvasBody>
      </COffcanvas>
    </>
  )
}

export default Documents
