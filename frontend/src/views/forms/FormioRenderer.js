// src/views/forms/FormioRenderer.js
import React, { useEffect, useRef } from "react"
import { Form } from "formiojs"
import "formiojs/dist/formio.full.min.css"

const FormioRenderer = ({ form }) => {
  const formRef = useRef(null)

  useEffect(() => {
    if (!formRef.current || !form) return

    const instance = new Form(formRef.current, form.schema)

    instance.on("submit", (submission) => {
      console.log("✅ Données soumises :", submission.data)
    })

    return () => instance.destroy(true)
  }, [form])

  return <div ref={formRef} style={{ minHeight: "500px" }} />
}

export default FormioRenderer
