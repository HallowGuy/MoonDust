// src/utils/formio.js
export function patchSubmitButtons(schema) {
  if (!schema || !Array.isArray(schema.components)) return schema

  schema.components = schema.components.map((comp) => {
    if (comp.type === "button" && comp.key === "submit" && !comp.action) {
      return { ...comp, action: "submit" }
    }
    return comp
  })

  return schema
}
