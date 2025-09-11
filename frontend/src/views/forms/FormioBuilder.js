import React, { useEffect, useRef } from "react";
import { FormBuilder } from "formiojs";
import "formiojs/dist/formio.full.min.css";

const FormioBuilder = ({ form, onSave }) => {
  const builderRef = useRef(null);
  const builderInstance = useRef(null);

  useEffect(() => {
    if (!builderRef.current) return;

    try {
      builderInstance.current?.destroy?.();
      builderInstance.current = null;

      const builder = new FormBuilder(
        builderRef.current,
        form?.schema || { display: "form", components: [] },
        {
          noDefaultSubmitButton: true,
          alwaysConfirmComponentRemoval: true,
        }
      );

      builderInstance.current = builder;
    } catch (err) {
      console.error("❌ Erreur init FormioBuilder:", err);
    }

    return () => {
      try { builderInstance.current?.destroy?.(); } catch {}
      builderInstance.current = null;
    };
  }, [form]);

  // 🔒 Récupération robuste du schéma actuel
  const getSchema = () => {
    const b = builderInstance.current;
    if (!b) return { display: "form", components: [] };
    // Plusieurs implémentations Formio existent; on sécurise :
    const candidate =
      (b.schema && Object.keys(b.schema).length ? b.schema : null) ||
      b.instance?.schema ||
      b.instance?.form ||
      b.form ||
      {};
    return {
      display: candidate.display || "form",
      components: Array.isArray(candidate.components) ? candidate.components : [],
      ...candidate
    };
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="d-flex justify-content-end mb-2 gap-2">
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
          Annuler
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onSave && onSave(getSchema())} // ✅ crée la version au click
        >
          Enregistrer
        </button>
      </div>
      <div ref={builderRef} style={{ flexGrow: 1, minHeight: "600px" }} />
    </div>
  );
};

export default FormioBuilder;
