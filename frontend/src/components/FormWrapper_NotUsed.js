// src/components/FormWrapper.js
import React, { useEffect, useState } from "react"
import FormioRenderer from "src/views/forms/FormioRenderer"
import { API_FORM_CONFIG } from "src/api"
import { fetchWithAuth } from "src/utils/auth"

const FormWrapper = ({ formId, formSchema }) => {
  const [form, setForm] = useState(formSchema || null)
  const [loading, setLoading] = useState(!formSchema)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!formId || formSchema) return // rien à fetch si on a déjà un schéma
    const fetchForm = async () => {
      try {
        setLoading(true)
        const res = await fetchWithAuth(`${API_FORM_CONFIG}/${formId}`)
        if (!res.ok) throw new Error("Formulaire introuvable")
        const data = await res.json()
        setForm(data)
      } catch (e) {
        console.error("❌ Erreur FormWrapper:", e)
        setError("Impossible de charger le formulaire")
      } finally {
        setLoading(false)
      }
    }
    fetchForm()
  }, [formId, formSchema])

  if (loading) return <p>⏳ Chargement du formulaire...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>
  if (!form) return <p>Aucun formulaire trouvé</p>

  return <FormioRenderer form={form} />
}

export default FormWrapper
