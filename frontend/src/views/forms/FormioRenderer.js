// src/views/forms/FormioRenderer.js
import React, { useEffect, useRef } from "react"
import { Formio } from "formiojs"
import "formiojs/dist/formio.full.min.css"
import rfdc from "rfdc"
const clone = rfdc()

// Parcours récursif du schéma pour forcer le bouton submit -> customSubmit
const walk = (list = [], visit) => {
  if (typeof visit !== "function") return
  for (const c of list) {
    visit(c)
    if (Array.isArray(c.components)) walk(c.components, visit)
    if (Array.isArray(c.columns)) c.columns.forEach(col => walk(col.components || [], visit))
    if (Array.isArray(c.rows)) c.rows.forEach(row => row.forEach(cell => walk(cell.components || [], visit)))
  }
}

const forceCustomSubmit = (schema) => {
  let found = false
  walk(schema.components || [], (c) => {
    if (c.type === "button" && (c.key === "submit" || c.action === "submit")) {
      found = true
      c.key = "submit"
      c.action = "event"
      c.event = "customSubmit"
      c.disableOnInvalid = true
      c.label = c.label || "Enregistrer"
    }
  })
  if (!found) {
    // s'il n'y a PAS de bouton, on en ajoute un
    schema.components = schema.components || []
    schema.components.push({
      type: "button",
      input: true,
      key: "submit",
      label: "Enregistrer",
      action: "event",
      event: "customSubmit",
      disableOnInvalid: true,
      theme: "primary",
      tableView: false,
    })
  }
  return schema
}

const toSubmissionObj = (submission) =>
  submission && typeof submission === "object"
    ? (submission.data ? submission : { data: submission })
    : { data: {} }

const FormioRenderer = ({ form, submission, onSave }) => {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)
  const handledRef = useRef(false) // anti double-clic

  useEffect(() => {
    if (!containerRef.current || !form?.schema) return

    const token = localStorage.getItem("access_token")
    if (token) { try { Formio.setToken(token) } catch {} }

    // 1) cloner le schéma et forcer le bouton -> customSubmit (récursif)
    //const schema = forceCustomSubmit(clone(form.schema))
    const schema = forceCustomSubmit(form.schema)

    let cancelled = false
    ;(async () => {
      // 2) createForm (plus fiable en offcanvas)
      const instance = await Formio.createForm(containerRef.current, schema, {
        saveDraft: false,
        submitOnEnter: true,
        projectUrl: "",
        submitUrl: "",      // pas d’appels réseau internes
        noAlerts: false,
        readOnly: false,
      })
      if (cancelled) { instance.destroy(true); return }
      instanceRef.current = instance

      // Empêche la soumission Form.io d’aller chercher un endpoint
      instance.nosubmit = true

      // 3) pré-remplir
      const init = toSubmissionObj(submission)
      if (Object.keys(init.data || {}).length) {
        try {
          await instance.setSubmission(init)
        } catch {
          // fallback par champ si setSubmission indisponible
          Object.entries(init.data).forEach(([k, v]) => {
            instance.getComponent(k)?.setValue?.(v, { fromSubmission: true })
          })
          instance.redraw()
        }
      }

      // 4) Handler unique
      const handle = async (payload, source) => {
        const data = payload?.data ?? payload ?? {}
        // console.log(`🛰️ submit via ${source}`, data)
        if (handledRef.current) return
        handledRef.current = true
        try {
          await onSave?.(data)
          instance.emit("submitDone", { data }) // stoppe spinner interne
        } catch (e) {
          console.error("❌ onSave error:", e)
          instance.emit("submitError", e)
        } finally {
          setTimeout(() => (handledRef.current = false), 0)
        }
      }

      // 5) Écoutes robustes (3 variantes) + fallback 'submit'
      instance.on("customSubmit", (data) => handle(data, "customSubmit"))
      instance.on("formio.customEvent", (p) => { if (p?.type === "customSubmit") handle(p, "formio.customEvent") })
      instance.on("customEvent", (p) => { if (p?.type === "customSubmit") handle(p, "customEvent") })
      instance.on("submit", (sub) => handle(sub, "submit"))

      // Fallback ultime : si le bouton existe mais n’émet pas correctement
      const btn = instance.getComponent("submit")
      if (btn?.buttonElement) {
        btn.buttonElement.addEventListener("click", () => {
          handle(instance.submission || { data: {} }, "button.click")
        })
      }
    })()

    return () => {
      cancelled = true
      try { instanceRef.current?.destroy(true) } catch {}
      instanceRef.current = null
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [form])

  // ré-appliquer un pré-remplissage si la prop submission change
  useEffect(() => {
    const instance = instanceRef.current
    if (!instance) return
    const sub = toSubmissionObj(submission)
    if (!Object.keys(sub.data || {}).length) return
    ;(async () => {
      try { await instance.setSubmission(sub) }
      catch {
        Object.entries(sub.data).forEach(([k, v]) => {
          instance.getComponent(k)?.setValue?.(v, { fromSubmission: true })
        })
        instance.redraw()
      }
    })()
  }, [submission])

  return <div ref={containerRef} />
}

export default FormioRenderer
