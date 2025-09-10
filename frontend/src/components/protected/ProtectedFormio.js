// src/components/ProtectedFormio.js
import React, { useContext, useMemo } from "react"
import FormioRenderer from "src/views/forms/FormioRenderer"
import { PermissionsContext } from "/src/context/PermissionsContext"
import { rolesFromToken } from "src/lib/jwt"
import { CLIENT_ID } from "src/api"

const norm = (arr = []) =>
  arr.map((r) => String(r || "").toLowerCase()).filter(Boolean).filter((r) => r !== "uma_authorization")
const hasAny = (userRoles = [], allowed = []) => {
  const u = norm(userRoles), a = norm(allowed)
  return u.some((r) => a.includes(r))
}
const deepClone = (o) => JSON.parse(JSON.stringify(o))

// ----- helpers de parcours sur SCHÉMA -----
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

// 🔐 lock global + strip des submits… sur **schema**
const lockSchemaAndStripSubmits = (schema, mode = "disable") => {
  const s = deepClone(schema)
  walk(s, (c) => {
    if (!c) return
    if (c.type === "button") {
      const isSubmit =
        c.action === "submit" ||
        c.key === "submit" ||
        c.event === "submit" ||
        c.event === "customSubmit" ||
        /submit/i.test(String(c.label || ""))
      if (isSubmit) { c.hidden = true; return }
    }
    if (!c.key) return
    if (mode === "hide") c.hidden = true
    else if (mode === "readonly") c.readOnly = true
    else c.disabled = true
  })
  return s
}

// 🔐 ACL champ par champ… sur **schema**
const applyFieldAclOnSchema = (schema, userRoles, fieldsAcl = {}, actionsConfig, mode = "disable") => {
  if (!fieldsAcl || !Object.keys(fieldsAcl).length) return schema
  const s = deepClone(schema)

  const resolveAllowedFromAction = (actionKey) => {
    const conf = actionsConfig?.[actionKey]
    if (Array.isArray(conf)) return conf
    if (conf && Array.isArray(conf.roles)) return conf.roles
    return []
  }
  const allowedForRule = (rule) => {
    if (Array.isArray(rule)) return rule
    if (!rule || typeof rule !== "object") return []
    if (Array.isArray(rule.roles)) return rule.roles
    if (typeof rule.action === "string") return resolveAllowedFromAction(rule.action)
    if (Array.isArray(rule.actions)) return rule.actions.flatMap(resolveAllowedFromAction)
    return []
  }
  const lock = (c) => {
    if (mode === "hide") c.hidden = true
    else if (mode === "readonly") c.readOnly = true
    else c.disabled = true
  }

  walk(s, (c) => {
    if (!c || !c.key) return
    const rule = fieldsAcl[c.key]
    if (!rule) return
    const allowed = allowedForRule(rule)
    if (!hasAny(userRoles, allowed)) lock(c)
  })

  return s
}

/**
 * ProtectedFormio
 *  - form: { schema: {...} }  ✅
 *  - action: clé globale (ex "contact.update") pour autoriser la sauvegarde
 *  - fieldsAcl: { fieldKey: { roles:[], action:"x", actions:["x","y"] } }
 */
const ProtectedFormio = ({
  form,
  submission,
  onSave,
  action,                    // ex: "contact.update"
  fieldsAcl,
  fieldStrategy = "disable", // "disable" | "readonly" | "hide"
  lockAllIfNoAccess = true,
  showReadOnlyBadge = true,
  actionsConfig: actionsConfigProp,
  currentUserRoles: currentUserRolesProp,
  header,
}) => {
  const ctx = useContext(PermissionsContext) || {}
  const actionsConfig = actionsConfigProp || ctx.actionsConfig || {}
  const contextRoles = currentUserRolesProp || ctx.currentUserRoles

  const userRoles = useMemo(() => {
    if (contextRoles?.length) return contextRoles
    const token = localStorage.getItem("access_token")
    try { return rolesFromToken(token, CLIENT_ID) || [] } catch {
      try {
        const payload = JSON.parse(atob((token || "").split(".")[1] || ""))
        return (
          payload.roles ||
          payload.authorities ||
          payload["realm_access"]?.roles ||
          payload["cognito:groups"] ||
          (typeof payload.scope === "string" ? payload.scope.split(" ") : []) ||
          []
        )
      } catch { return [] }
    }
  }, [contextRoles])

  const canUpdate = useMemo(() => {
    if (!action) return false
    const conf = actionsConfig?.[action]
    const allowed = Array.isArray(conf) ? conf : (conf?.roles || [])
    return hasAny(userRoles, allowed)
  }, [action, actionsConfig, userRoles])

  // ⚠️ On travaille bien sur form.schema
  const preparedForm = useMemo(() => {
    if (!form?.schema) return form
    const orig = deepClone(form)
    let schema = orig.schema

    if (!canUpdate && lockAllIfNoAccess) {
      schema = lockSchemaAndStripSubmits(schema, fieldStrategy)
    }
    if (fieldsAcl && Object.keys(fieldsAcl).length) {
      schema = applyFieldAclOnSchema(schema, userRoles, fieldsAcl, actionsConfig, fieldStrategy)
    }
    return { ...orig, schema }
  }, [form, canUpdate, lockAllIfNoAccess, fieldStrategy, fieldsAcl, userRoles, actionsConfig])

  return (
    <div>
      {header}
      {!canUpdate && showReadOnlyBadge && (
        <div className="mb-2">
          <span className="badge text-bg-secondary">Lecture seule</span>
        </div>
      )}

      <FormioRenderer
        form={preparedForm}
        submission={submission}
        onSave={canUpdate ? onSave : undefined}
        readOnly={!canUpdate}          // ⬅️ propage au renderer
        stripSubmits={!canUpdate}      // ⬅️ masque les boutons submit
      />
    </div>
  )
}

export default ProtectedFormio
