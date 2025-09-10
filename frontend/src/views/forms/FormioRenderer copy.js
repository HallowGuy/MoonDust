// src/views/forms/FormioRenderer.js
import React, { useEffect, useRef } from "react"
import { Formio } from "formiojs"
import "formiojs/dist/formio.full.min.css"

const FormioRenderer = ({ form, submission, onSave }) => {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)
  const handledRef = useRef(false) // évite doubles appels

  useEffect(() => {
    if (!containerRef.current || !form?.schema) return

    const token = localStorage.getItem("access_token")
    if (token) Formio.setToken(token)

    // clone pour ne pas muter la prop
    const schema = JSON.parse(JSON.stringify(form.schema))
    if (Array.isArray(schema.components)) {
      schema.components = schema.components.map((c) =>
        c.type === "button" && c.key === "submit"
          ? { ...c, action: "event", event: "customSubmit" }
          : c
      )
    }

    let cancelled = false
    ;(async () => {
      const instance = await Formio.createForm(containerRef.current, schema, {
        saveDraft: false,
        submitOnEnter: true,
        projectUrl: "",
        submitUrl: "",
      })
      if (cancelled) { instance.destroy(true); return }
      instanceRef.current = instance
      handledRef.current = false

      // --- pré-remplissage
      const data = submission?.data ?? submission ?? {}
      if (Object.keys(data).length) {
        try {
          await instance.setSubmission({ data })
        } catch {
          // fallback par champ si nécessaire
          Object.entries(data).forEach(([k, v]) => {
            const comp = instance.getComponent(k, true)
            comp?.setValue?.(v, { fromSubmission: true })
          })
          instance.redraw()
        }
      }

      // --- capture des clics sur le bouton
      const handle = (payload, source) => {
        const data = payload?.data ?? payload ?? {}
        console.log(`🛰️ submit capturé via ${source} :`, data)
        if (handledRef.current) return
        handledRef.current = true
        try { onSave?.(data) } finally {
          setTimeout(() => (handledRef.current = false), 0) // réarme
        }
      }

      // 3 variantes selon versions
      instance.on("customSubmit", (data) => handle(data, "customSubmit"))
      instance.on("formio.customEvent", (p) => {
        if (p?.type === "customSubmit") handle(p, "formio.customEvent")
      })
      instance.on("customEvent", (p) => {
        if (p?.type === "customSubmit") handle(p, "customEvent")
      })
    })()

    return () => {
      cancelled = true
      try { instanceRef.current?.destroy(true) } catch {}
      instanceRef.current = null
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [form])

  // réappliquer un pré-remplissage si la prop change
  useEffect(() => {
    const instance = instanceRef.current
    if (!instance) return
    const data = submission?.data ?? submission ?? {}
    if (!Object.keys(data).length) return
    ;(async () => {
      try { await instance.setSubmission({ data }) }
      catch {
        Object.entries(data).forEach(([k, v]) => {
          instance.getComponent(k, true)?.setValue?.(v, { fromSubmission: true })
        })
        instance.redraw()
      }
    })()
  }, [submission])

  return <div ref={containerRef} />
}

export default FormioRenderer
