// FormBuilderPage.js
import React, { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FormBuilder } from "formiojs"
import "formiojs/dist/formio.full.min.css"

import {
  CButton,
  CToaster,
  CToast,
  CToastBody,
  CCard,
  CCardHeader,
  CCardBody,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilSave } from "@coreui/icons"
import { API_FORM_CONFIG } from "src/api"
import ConfirmCancelModal from "src/components/ConfirmCancelModal"

const FormBuilderPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const builderRef = useRef(null)
  const builderInstance = useRef(null)

  const [form, setForm] = useState(null)
  const [toasts, setToasts] = useState([])

  const addToast = (message, color = "success") => {
    const tid = Date.now()
    setToasts((prev) => [...prev, { id: tid, message, color }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== tid)), 3000)
  }

  // Charger le formulaire existant
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${API_FORM_CONFIG}/${id}`)
        if (!res.ok) throw new Error("Impossible de charger le formulaire")
        const data = await res.json()
        setForm(data)
      } catch (err) {
        addToast(err.message, "danger")
      }
    }
    fetchForm()
  }, [id])

  // Init builder quand form est chargé
  useEffect(() => {
    if (form && builderRef.current) {
      if (builderInstance.current) {
        builderInstance.current.destroy()
      }
     builderInstance.current = new FormBuilder(
  builderRef.current,
  form.schema || { display: "form", components: [] },
  {
    i18n: {
      fr: {
        Save: "Enregistrer",
        Cancel: "Annuler",
        Remove: "Supprimer",
        "Text Field": "Champ texte",
        "Text Area": "Zone de texte",
        // tu peux ajouter autant de traductions que nécessaire
      },
    },
    language: "fr",
  }
)

    }
  }, [form])

  // Sauvegarder
  const handleSave = async () => {
    if (!builderInstance.current) return

    try {
      const schema = builderInstance.current.instance.schema

      const res = await fetch(`${API_FORM_CONFIG}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, schema }),
      })
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde")

      addToast("Formulaire enregistré avec succès", "success")
    } catch (err) {
      addToast(err.message, "danger")
    }
  }

  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
                    <span>Édition du formulaire : {form?.name}</span>

        </CCardHeader>

        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div />
            <div className="d-flex gap-2">
              <ConfirmCancelModal
                title="Annuler l’édition"
                message="Êtes-vous sûr de vouloir annuler ? Toutes vos modifications non sauvegardées seront perdues."
                confirmText="Oui, annuler"
                confirmColor="danger"
                onConfirm={() => navigate("/editionforms")}
                trigger={
                  <CButton color="secondary" variant="ghost">
                    Annuler
                  </CButton>
                }
              />

              <CButton color="primary" onClick={handleSave}>
                Enregistrer
              </CButton>
            </div>
          </div>

          <div ref={builderRef} style={{ minHeight: "650px" }} />

          {/* TOASTER */}
          <CToaster placement="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
            {toasts.map((t) => (
              <CToast key={t.id} visible autohide delay={3000} color={t.color}>
                <CToastBody className="text-white">{t.message}</CToastBody>
              </CToast>
            ))}
          </CToaster>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default FormBuilderPage
