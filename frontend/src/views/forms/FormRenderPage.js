// src/views/forms/RenderFormPage.js
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { API_FORM_CONFIG } from "src/api"
import FormioRenderer from "./FormioRenderer"

const RenderFormPage = () => {
  const { id } = useParams()
  const [form, setForm] = useState(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${API_FORM_CONFIG}/${id}`)
        if (!res.ok) throw new Error("Formulaire introuvable")
        const data = await res.json()
        setForm(data)
      } catch (e) {
        console.error("Erreur :", e)
      }
    }
    fetchForm()
  }, [id])

  return (
    <div className="container py-4">
      <h2>📄 Formulaire : {form?.name}</h2>
      {form ? <FormioRenderer form={form} /> : <p>Chargement...</p>}
    </div>
  )
}

export default RenderFormPage
