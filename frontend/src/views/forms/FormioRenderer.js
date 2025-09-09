// src/views/forms/FormioRenderer.js
import React, { useEffect, useRef } from "react"
import { Form, Formio } from "formiojs"   // ⬅️ ajouter Formio
import "formiojs/dist/formio.full.min.css"

const FormioRenderer = ({ form }) => {
  const formRef = useRef(null)

  useEffect(() => {
    // 🔑 Injecter ton token une seule fois
    const token = localStorage.getItem("access_token")
    if (token) {
      Formio.setToken(token)
    }

    if (!formRef.current || !form) return

    const instance = new Form(formRef.current, form.schema)

    instance.on("submit", (submission) => {
      console.log("✅ Données soumises :", submission.data)
    })

    return () => instance.destroy(true)
  }, [form])

  return <div ref={formRef} />
}

export default FormioRenderer
