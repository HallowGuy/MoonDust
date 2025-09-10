// src/views/forms/FormioRenderer.js
import React, { useEffect, useRef } from "react"
import { Formio } from "formiojs"
import "formiojs/dist/formio.full.min.css"

const FormioRenderer = ({ form, submission, onSave, readOnly = false, stripSubmits = false }) => {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)
  const handledRef = useRef(false) // évite doubles appels

  // petit util pour cloner
  const deepClone = (o) => JSON.parse(JSON.stringify(o))

  // parcours générique (components / columns / rows)
  const walk = (comp, fn) => {
    if (!comp) return
    fn(comp)
    if (Array.isArray(comp.components)) comp.components.forEach((c) => walk(c, fn))
    if (Array.isArray(comp.columns)) {
      comp.columns.forEach((col) => {
        if (Array.isArray(col?.components)) col.components.forEach((c) => walk(c, fn))
      })
    }
    if (Array.isArray(comp.rows)) {
      comp.rows.forEach((row) => {
        row.forEach((cell) => {
          if (Array.isArray(cell?.components)) cell.components.forEach((c) => walk(c, fn))
        })
      })
    }
  }

  useEffect(() => {
    if (!containerRef.current || !form?.schema) return

    const token = localStorage.getItem("access_token")
    if (token) Formio.setToken(token)

    // clone pour ne pas muter la prop
    const schema = deepClone(form.schema)

    // 1) optionnel : masquer tous les boutons submit si on est en lecture seule
    if (stripSubmits || readOnly || !onSave) {
      walk(schema, (c) => {
        if (!c) return
        if (c.type === "button") {
          const isSubmit =
            c.action === "submit" ||
            c.key === "submit" ||
            c.event === "submit" ||
            c.event === "customSubmit" ||
            /submit/i.test(String(c.label || ""))
          if (isSubmit) {
            c.hidden = true
          }
        }
      })
    } else {
      // 2) sinon, recâbler les vrais submit en "customSubmit" (clé quelle qu’elle soit)
      walk(schema, (c) => {
        if (!c) return
        if (c.type === "button") {
          const isSubmit =
            c.action === "submit" ||
            c.key === "submit" ||
            c.event === "submit" ||
            /submit/i.test(String(c.label || ""))
          if (isSubmit) {
            c.action = "event"
            c.event = "customSubmit"
          }
        }
      })
    }

    let cancelled = false
    ;(async () => {
      const instance = await Formio.createForm(containerRef.current, schema, {
        saveDraft: false,
        submitOnEnter: !readOnly && Boolean(onSave),
        projectUrl: "",
        submitUrl: "",
        readOnly: !!readOnly, // ⬅️ important
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
          Object.entries(data).forEach(([k, v]) => {
            const comp = instance.getComponent(k, true)
            comp?.setValue?.(v, { fromSubmission: true })
          })
          instance.redraw()
        }
      }

      // --- capture des clics sur le bouton (seulement si onSave ET pas readOnly)
      if (onSave && !readOnly) {
        const handle = (payload, source) => {
          const data = payload?.data ?? payload ?? {}
          if (handledRef.current) return
          handledRef.current = true
          try { onSave?.(data) } finally {
            setTimeout(() => (handledRef.current = false), 0)
          }
        }

        instance.on("customSubmit", (data) => handle(data, "customSubmit"))
        instance.on("formio.customEvent", (p) => {
          if (p?.type === "customSubmit") handle(p, "formio.customEvent")
        })
        instance.on("customEvent", (p) => {
          if (p?.type === "customSubmit") handle(p, "customEvent")
        })
      }
    })()

    return () => {
      cancelled = true
      try { instanceRef.current?.destroy(true) } catch {}
      instanceRef.current = null
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [form, onSave, readOnly, stripSubmits])

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
