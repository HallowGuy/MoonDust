// src/components/FormWrapper.js
import React, { useEffect, useState } from "react"
import FormioRenderer from "src/views/forms/FormioRenderer"
import { API_FORM_CONFIG } from "src/api"

const FormWrapper = ({ formId, formSchema }) => {
  const [form, setForm] = useState(formSchema || null)

  useEffect(() => {
    if (!formId) return
    const fetchForm = async () => {
      try {
        const res = await fetch(`${API_FORM_CONFIG}/${formId}`)
        if (!res.ok) throw new Error("Formulaire introuvable")
        const data = await res.json()
        setForm(data)
      } catch (e) {
        console.error("Erreur FormWrapper:", e)
      }
    }
    fetchForm()
  }, [formId])

  if (!form) return <p>⏳ Chargement du formulaire...</p>

  return <FormioRenderer form={form} />
}

export default FormWrapper
