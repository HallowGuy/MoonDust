import React, { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import {
  CCard, CCardHeader, CCardBody,
  CNav, CNavItem, CNavLink, CTabContent, CTabPane,
  CButton, CFormInput
} from "@coreui/react"
import { API_CONTACTS, API_ENTREPRISES } from "src/api"

import ContactGeneralInfos from "./ContactGeneralInfos"
import ContactHistorique from "./ContactHistorique"
import ContactNotes from "./ContactNotes"
import ContactDocuments from "./ContactDocuments"
import { fetchWithAuth } from "../../utils/auth";

const ContactDetail = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const initialTab = parseInt(searchParams.get("tab") || "1", 10)

  const [activeKey, setActiveKey] = useState(initialTab)
  const [contact, setContact] = useState(null)
  const [entreprises, setEntreprises] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetchWithAuth(`${API_CONTACTS}/${id}`)
        if (!res.ok) throw new Error("Erreur lors du chargement du contact")
        const data = await res.json()
        setContact(data)
        setFormData(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchContact()
  }, [id])

  useEffect(() => {
    const fetchEntreprises = async () => {
      try {
        const res = await fetchWithAuth(`${API_ENTREPRISES}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        if (!res.ok) throw new Error("Impossible de charger les entreprises")
        const data = await res.json()
        setEntreprises(data)
      } catch (e) {
        console.error(e)
      }
    }
    fetchEntreprises()
  }, [])

  const handleSave = async () => {
    try {
      const res = await fetchWithAuth(`${API_CONTACTS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde")
      const updated = await res.json()
      setContact(updated)
      setFormData(updated)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert("Impossible de sauvegarder le contact")
    }
  }

  if (!contact) return <p>Chargement...</p>

  return (
    <div className="container py-4">
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          {!isEditing ? (
            <h4>{contact.prenom} {contact.nom}</h4>
          ) : (
            <div className="d-flex gap-2">
              <CFormInput
                size="sm"
                placeholder="Prénom"
                value={formData.prenom || ""}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              />
              <CFormInput
                size="sm"
                placeholder="Nom"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              />
            </div>
          )}

          <div className="d-flex gap-2">
            {!isEditing ? (
              <CButton color="primary" onClick={() => setIsEditing(true)}>Éditer</CButton>
            ) : (
              <>
                <CButton color="danger" variant="outline" onClick={() => { setIsEditing(false); setFormData(contact) }}>
                  Annuler
                </CButton>
                <CButton color="primary" onClick={handleSave}>
                  Enregistrer
                </CButton>
              </>
            )}
          </div>
        </CCardHeader>

        <CCardBody>
          <CNav variant="underline" role="tablist">
            <CNavItem>
              <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>Infos générales</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>Historique</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>Notes</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeKey === 4} onClick={() => setActiveKey(4)}>Documents</CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent className="mt-3">
            <CTabPane role="tabpanel" visible={activeKey === 1}>
              <ContactGeneralInfos
                contact={contact}
                formData={formData}
                isEditing={isEditing}
                setFormData={setFormData}
                entreprises={entreprises}
              />
            </CTabPane>

            <CTabPane role="tabpanel" visible={activeKey === 2}>
              <ContactHistorique contactId={id} />
            </CTabPane>

            <CTabPane role="tabpanel" visible={activeKey === 3}>
              <ContactNotes contactId={id} />
            </CTabPane>

            <CTabPane role="tabpanel" visible={activeKey === 4}>
              <ContactDocuments contactId={id} />
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ContactDetail
