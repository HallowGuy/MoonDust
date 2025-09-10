// src/views/contacts/ContactDetail.js
import React, { useEffect, useState, useContext } from "react"
import { useParams } from "react-router-dom"
import { API_CONTACTS, API_FORM_CONFIG } from "src/api"
import { fetchWithAuth } from "src/utils/auth"
import ProtectedFormio from "src/components/protected/ProtectedFormio"
import { PermissionsContext } from "/src/context/PermissionsContext"
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, COffcanvas, COffcanvasHeader, COffcanvasBody,
  CFormInput,
  CToaster, CToast, CToastBody
} from '@coreui/react'
const ContactDetail = () => {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [contact, setContact] = useState(null)

  // Récupération de actionsConfig & currentUserRoles comme dans Users.jsx
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


  useEffect(() => {
    const load = async () => {
      try {
        const [resForm, resContact] = await Promise.all([
          fetchWithAuth(`${API_FORM_CONFIG}/contact`),
          fetchWithAuth(`${API_CONTACTS}/${id}`),
        ])
        const [formJson, contactJson] = await Promise.all([resForm.json(), resContact.json()])
        setForm(formJson)
        setContact(contactJson)
      } catch (e) {
        console.error("❌ Erreur fetch ContactDetail:", e)
      }
    }
    load()
  }, [id])

  if (!form || !contact) return <p>⏳ Chargement...</p>

  // ACL par clé de champ (exemples)
  const fieldAcl = {
    email:  { action: "contact.email.edit" },        // utilisera actionsConfig["contact.email.edit"]
    mobile: { roles: ["admin", "manager"] },         // roles en dur
    tags:   { actions: ["contact.update", "tags.edit"] }, // union de plusieurs actions
  }

  return (
    <div className="container">
      <ProtectedFormio
         action="contact.update"
        fieldsAcl={{
          //email:  { action: "contact.email.edit" },
          //mobile: { roles: ["admin", "manager"] },
          //tags:   { actions: ["contact.update", "tags.edit"] },
        }}
  form={form}
  submission={contact.form_data || {}}
        onSave={async (data) => {
          try {
            const res = await fetchWithAuth(`${API_CONTACTS}/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...contact, form_data: data }),
            })
            if (!res.ok) throw new Error("Erreur API")
            const updated = await res.json()
            setContact(updated)
            showSuccess("Contact mis à jour")  
          } catch (err) {
            console.error("❌ Erreur update Contact:", err)
            showError("Erreur enregistrement")
          }
        }}
      />
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

export default ContactDetail
