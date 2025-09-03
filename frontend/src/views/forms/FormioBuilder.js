import React, { useEffect, useRef } from "react"
import { FormBuilder } from "formiojs"
import "formiojs/dist/formio.full.min.css"

const FormioBuilder = ({ form, onSave }) => {
  const builderRef = useRef(null)
  const builderInstance = useRef(null)

  useEffect(() => {
    if (!builderRef.current) return

    try {
      // Détruire un éventuel ancien builder
      if (builderInstance.current) {
        builderInstance.current.destroy()
        builderInstance.current = null
      }

      // Initialiser avec le schéma
      const builder = new FormBuilder(
        builderRef.current,
        form?.schema || { display: "form", components: [] },
        {
          noDefaultSubmitButton: true,
          alwaysConfirmComponentRemoval: true,
        }
      )

      builder.on("change", () => {
        if (onSave) onSave(builder.schema)
      })

      builderInstance.current = builder
    } catch (err) {
      console.error("❌ Erreur init FormioBuilder:", err)
    }

    return () => {
      try {
        builderInstance.current?.destroy()
      } catch (e) {
        console.warn("⚠️ Cleanup builder:", e)
      }
    }
  }, [form, onSave])

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="d-flex justify-content-end mb-2 gap-2">
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
          Annuler
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (onSave && builderInstance.current) {
              onSave(builderInstance.current.schema)
            }
          }}
        >
          Enregistrer
        </button>
      </div>
      <div ref={builderRef} style={{ flexGrow: 1, minHeight: "600px" }} />
    </div>
  )
}

export default FormioBuilder
